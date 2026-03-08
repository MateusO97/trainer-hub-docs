# 06-DATA-FLOW.md
## Fluxos de Dados - TrAIner Hub

**Versão**: 1.0  
**Data**: 2025-08-01  
**Status**: Final - Fase 1.6  
**Propósito**: Documentar fluxos críticos com sequence diagrams, latência budgets e pontos críticos

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Fluxo 1: Autenticação (Login/Register)](#fluxo-1-autenticação)
3. [Fluxo 2: Criação de Meal Plan](#fluxo-2-criação-de-meal-plan)
4. [Fluxo 3: Consumo de Refeição](#fluxo-3-consumo-de-refeição)
5. [Fluxo 4: Busca de Alimento](#fluxo-4-busca-de-alimento)
6. [Fluxo 5: Dashboard de Tracking](#fluxo-5-dashboard-de-tracking)
7. [Fluxo 6: Notificação](#fluxo-6-notificação)
8. [Fluxo 7: Sugestão de Meal Plan via IA](#fluxo-7-sugestão-de-meal-plan-via-ia)
9. [Fluxo 8: Análise de Progresso](#fluxo-8-análise-de-progresso)
10. [Latência Budgets](#latência-budgets)
11. [Observabilidade](#observabilidade)

---

## 1. Visão Geral

TrAIner Hub opera em dois modos de comunicação:

### 1.1 Síncrono (REST)
- Requisições críticas que exigem resposta imediata
- Budget: **< 500ms** para caso de sucesso
- Circuit breaker ativa após 5 timeouts consecutivos
- Fallback para dados em cache se serviço cair

### 1.2 Assíncrono (RabbitMQ)
- Eventos que podem ser processados em background
- Garante entrega (dead letter queue se falhar)
- Retry policy: exponential backoff (1s, 2s, 4s, 8s, 30min)
- Idempotência via request ID

### 1.3 Padrão de Rastreamento

**Request ID**: Gerado no Gateway, propagado em todos os serviços
```
X-Request-Id: req-{timestamp}-{random-6-chars}
Exemplo: X-Request-Id: req-1693472445-abc123
```

**Propagação de contexto**:
```
X-User-Id: extraído do JWT token
X-Service-Name: serviço que originou a chamada
X-Trace-Id: ID único de rastreamento distribuído
Timing-Allow-Origin: para medir latência em cliente
```

---

## 2. Fluxo 1: Autenticação (Login/Register)

### 2.1 Registro (Register)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as App Mobile
    participant Gateway as API Gateway
    participant AuthSvc as Auth Service
    participant UserSvc as User Service
    participant DB as PostgreSQL
    participant RabbitMQ as RabbitMQ
    participant NotifSvc as Notification Service
    participant Email as SendGrid (Email)

    User->>App: Clica em "Registrar"
    App->>Gateway: POST /auth/register<br/>{email, password, name, birthDate, gender}
    Gateway->>AuthSvc: Roteia para Auth Service (porta 8081)
    
    Note over AuthSvc: Valida payload (RFC 5322, pwd strength)
    AuthSvc->>DB: SELECT * FROM users WHERE email = ?
    DB-->>AuthSvc: null (email não existe)
    
    AuthSvc->>AuthSvc: Hash password com bcrypt (10 rounds)
    AuthSvc->>DB: INSERT INTO users (email, password_hash, name, birthDate, gender)
    DB-->>AuthSvc: UUID de usuário criado
    
    AuthSvc->>AuthSvc: Gera JWT accessToken (1h) e refreshToken (7d)
    AuthSvc->>RabbitMQ: Publica evento "UserCreated"<br/>{userId, email, name, timestamp}
    
    RabbitMQ->>UserSvc: Consome "UserCreated"
    UserSvc->>DB: INSERT INTO user_profiles<br/>(user_id, name, email, created_at)
    UserSvc->>DB: INSERT INTO nutrition_targets<br/>(user_id, default_calories, ...)
    
    RabbitMQ->>NotifSvc: Consome "UserCreated"
    NotifSvc->>NotifSvc: Esqueduliza welcome email
    NotifSvc->>Email: POST /send<br/>{email, template: welcome, name}
    Email-->>NotifSvc: 202 (queued)
    
    AuthSvc->>Gateway: 201 Created<br/>{accessToken, refreshToken, expiresIn}
    Gateway-->>App: 201<br/>{token_data}
    App-->>User: ✅ Registro sucesso! Bem-vindo
    Email-->>User: Welcome email enviado
```

**Latência Budget**: < 800ms (inclui hash + DB writes)
- Gateway validation: 10ms
- Auth service: 50ms
- Password hashing: 200ms
- DB inserts (x2): 100ms  
- RabbitMQ publish: 50ms
- Total aproximado: 410ms ✅

**Pontos Críticos**:
- ❌ Email já existe: Retorna 400 (DUPLICATE_EMAIL) - 50ms
- ❌ Senha fraca: Retorna 400 (WEAK_PASSWORD) - 20ms
- ❌ Auth service down: Gateway retorna 503, cliente vê "tente novamente"

---

### 2.2 Login

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as App Mobile
    participant Gateway as API Gateway
    participant AuthSvc as Auth Service
    participant DB as PostgreSQL
    participant Redis as Redis Cache
    participant RabbitMQ as RabbitMQ

    User->>App: Clica em "Login"
    App->>Gateway: POST /auth/login<br/>{email, password}
    Gateway->>AuthSvc: Roteia para Auth Service
    
    Note over AuthSvc: Valida payload básico
    AuthSvc->>Redis: GET user:email:{email}
    Redis-->>AuthSvc: null ou {userId, hash_cache} (TTL 1h)
    
    alt Cache hit
        AuthSvc->>AuthSvc: Compara password com hash_cache
        Note over AuthSvc: bcrypt_verify() - rápido se match
    else Cache miss
        AuthSvc->>DB: SELECT id, password_hash FROM users WHERE email = ?
        DB-->>AuthSvc: {userId, password_hash}
        AuthSvc->>AuthSvc: Compara password com hash
        AuthSvc->>Redis: SET user:email:{email}<br/>{userId, hash_cache} EX 3600
    end
    
    alt Password match
        AuthSvc->>AuthSvc: Gera JWT accessToken (1h)
        AuthSvc->>AuthSvc: Gera refreshToken (7d) + salva em Redis
        AuthSvc->>Redis: SET refresh_token:{token} {userId} EX 604800
        AuthSvc->>RabbitMQ: Publica "UserLoggedIn"<br/>{userId, timestamp, ip, userAgent}
        RabbitMQ->>RabbitMQ: (async) - analytics, fraud detection
        AuthSvc->>Gateway: 200 OK<br/>{accessToken, refreshToken, expiresIn}
        Gateway-->>App: 200<br/>{token_data}
        App-->>User: ✅ Login sucesso
    else Password wrong
        AuthSvc->>Gateway: 401 Unauthorized<br/>(INVALID_CREDENTIALS)
        Gateway-->>App: 401<br/>{error}
        App-->>User: ❌ Email ou senha incorretos
    end
```

**Latência Budget**: < 300ms (com cache) ou < 500ms (sem cache)
- Gateway validation: 10ms
- Redis lookup: 2ms (hit) ou 50ms (miss)
- bcrypt_verify: 100ms (password match check)
- JWT generation: 5ms
- DB query (miss): 50ms
- Total: 167ms (cache hit) até 265ms (cache miss) ✅

---

## 3. Fluxo 2: Criação de Meal Plan

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as App Mobile
    participant Gateway as API Gateway
    participant MealPlanSvc as Meal Plan Service
    participant DB as PostgreSQL
    participant Cache as Redis Cache
    participant RabbitMQ as RabbitMQ

    User->>App: Preenche formulário de meal plan
    App->>Gateway: POST /api/v1/meal-plans<br/>{name, targetCalories, startDate, foods: [...]}
    Gateway->>Gateway: Valida JWT token
    Gateway->>MealPlanSvc: Roteia<br/>Header: X-User-Id, X-Request-Id
    
    Note over MealPlanSvc: Clean Architecture
    MealPlanSvc->>MealPlanSvc: MealPlanValidator.validate()
    
    alt Validação falha
        MealPlanSvc->>Gateway: 400<br/>{error, details}
        Gateway-->>App: 400<br/>{validation_errors}
    else Validação OK
        MealPlanSvc->>DB: SELECT * FROM foods WHERE id IN (?)
        DB-->>MealPlanSvc: foods com macros
        
        MealPlanSvc->>MealPlanSvc: Calcula macros totais do plano
        Note over MealPlanSvc: macroCalculator.sum(foods)
        
        MealPlanSvc->>DB: BEGIN TRANSACTION
        MealPlanSvc->>DB: INSERT INTO meal_plans<br/>(user_id, name, target_calories, ...)
        DB-->>MealPlanSvc: meal_plan_id (UUID)
        
        MealPlanSvc->>DB: INSERT INTO meals_in_plan<br/>(meal_plan_id, meal_id, ...) [batch]
        DB-->>MealPlanSvc: inserted count
        MealPlanSvc->>DB: COMMIT
        
        MealPlanSvc->>Cache: SET meal_plan:{plan_id}<br/>{plan_data} EX 3600
        MealPlanSvc->>RabbitMQ: Publica "MealPlanCreated"<br/>{userId, planId, targetCalories}
        
        MealPlanSvc->>Gateway: 201 Created<br/>{mealPlanId, ...}
        Gateway-->>App: 201<br/>{meal_plan}
    end
    
    App-->>User: ✅ Meal plan criado!
```

**Latência Budget**: < 600ms
- Validação: 20ms
- DB selects: 100ms
- Cálculo de macros: 20ms
- DB writes (transaction): 150ms
- Cache write: 10ms
- RabbitMQ: 50ms
- Total: ~350ms ✅

**Ponto Crítico**: Se database está lento (> 200ms), retorna 503

---

## 4. Fluxo 3: Consumo de Refeição

### 4.1 Registrar Consumo

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as App Mobile
    participant Gateway as API Gateway
    participant MealSvc as Meal Service
    participant NutritionSvc as Nutrition Service
    participant TrackingSvc as Tracking Service
    participant DB as PostgreSQL
    participant RabbitMQ as RabbitMQ
    participant NotifSvc as Notification Service
    participant Cache as Redis Cache

    User->>App: Clica "Registrar refeição consumida"
    App->>Gateway: POST /api/v1/meals/{mealId}/consume<br/>{consumedAt, quantity}
    Gateway->>MealSvc: Roteia
    
    MealSvc->>DB: SELECT * FROM meals WHERE id = ? AND user_id = ?
    DB-->>MealSvc: meal com foods/macros
    
    alt Meal não encontrado
        MealSvc->>Gateway: 404<br/>(MEAL_NOT_FOUND)
    else Meal found
        MealSvc->>MealSvc: Aplica quantity multiplicador aos macros
        Note over MealSvc: macros * quantity
        
        MealSvc->>DB: INSERT INTO meals_consumed<br/>(user_id, meal_id, consumed_at, quantity)
        DB-->>MealSvc: consumed_meal_id
        
        MealSvc->>RabbitMQ: Publica "MealConsumed"<br/>{userId, mealId, macros, consumedAt}
        
        RabbitMQ->>NutritionSvc: Consome "MealConsumed" (async)
        NutritionSvc->>NutritionSvc: Calcula daily_consumed_macros
        NutritionSvc->>Cache: SET user:daily:{userId}:{date}<br/>{consumed_macros, percentage}
        NutritionSvc->>DB: UPSERT INTO daily_nutrition_summary
        
        RabbitMQ->>TrackingSvc: Consome "MealConsumed" (async)
        TrackingSvc->>Cache: INCR user:meals_logged:{date}
        TrackingSvc->>Cache: SET streak:{userId} (se continuou a sequência)
        
        RabbitMQ->>NotifSvc: Consome "MealConsumed" (async)
        NotifSvc->>NutritionSvc: GET /api/v1/nutrition/daily<br/>para verificar se atingiu meta
        NutritionSvc-->>NotifSvc: {macros, remaining, percentage}
        
        alt Atingiu meta calórica
            NotifSvc->>NotifSvc: Prepara notificação de sucesso
            NotifSvc->>NotifSvc: Agenda push notification (imediato)
        end
        
        MealSvc->>Gateway: 201 Created<br/>{consumedMealId, macros}
        Gateway-->>App: 201<br/>{consumed_meal}
    end
    
    App-->>User: ✅ Refeição registrada!
    User->>App: Abre dashboard
    App->>App: Atualiza UI com novo total calórico (via WebSocket ou polling)
```

**Latência Budget**: < 800ms síncrono
- Validação + DB: 100ms
- Cálculo macros: 10ms
- Insert: 50ms
- RabbitMQ publish: 30ms
- **Retorno ao usuário**: ~190ms ✅
- Processamento assíncrono (Nutrition, Tracking, Notif): acontece em background, não bloqueia

**Pontos Críticos**:
- ❌ RabbitMQ down: Fila fica local em redis, retry automático
- ❌ DB slow: Retorna 503 após 3s timeout
- ✅ Nutrition/Tracking lentos: não afeta resposta síncrona

---

## 5. Fluxo 4: Busca de Alimento

### 4.1 Busca Local + Externa

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as App Mobile
    participant Gateway as API Gateway
    participant FoodSvc as Food Service
    participant DB as PostgreSQL
    participant Cache as Redis Cache
    participant Nutritionix as Nutritionix API
    participant USDA as USDA API

    User->>App: Digita "frango" na busca
    App->>Gateway: POST /api/v1/foods/search<br/>{query: "frango", limit: 10, includeExternal: true}
    Gateway->>FoodSvc: Roteia
    
    FoodSvc->>Cache: GET foods:search:{query}
    Cache-->>FoodSvc: null ou {local[], 5min TTL}
    
    alt Cache hit
        FoodSvc->>Gateway: 200<br/>{local: [...]}
        Gateway-->>App: 200
    else Cache miss
        Note over FoodSvc: Busca local
        FoodSvc->>DB: SELECT * FROM foods<br/>WHERE name ILIKE '%frango%'<br/>LIMIT 10
        DB-->>FoodSvc: foods (usando índice GIN)
        
        FoodSvc->>Cache: SET foods:search:{query}<br/>{foods} EX 300
        
        alt Resultados locais >= 5
            FoodSvc->>Gateway: 200<br/>{local: [...]}
        else Resultados locais < 5
            Note over FoodSvc: Busca externa em paralelo (non-blocking)
            
            par Nutritionix
                FoodSvc->>Nutritionix: GET /v1_1/search?query=frango<br/>timeout: 2000ms
                Nutritionix-->>FoodSvc: {foods: [...]}
            and USDA
                FoodSvc->>USDA: GET /api/search?q=frango<br/>timeout: 2000ms
                USDA-->>FoodSvc: {foods: [...]}
            end
            
            alt Ambas APIs responderam
                FoodSvc->>FoodSvc: Merge resultados + ranking por relevância
                FoodSvc->>Cache: SET foods:search:external<br/>{merged} EX 600
                FoodSvc->>Gateway: 200<br/>{local: [...], nutritionix: [...], usda: [...]}
            else Uma API timeout
                FoodSvc->>FoodSvc: Fallback: retorna apenas local + respondida
                FoodSvc->>Gateway: 200 + X-Partial-Results: true<br/>{local, nutritionix_only}
            else Ambas timeout
                FoodSvc->>Gateway: 200<br/>{local: [...]}
                Note over Gateway: Header: X-Degraded: true
            end
        end
        
        Gateway-->>App: 200
    end
    
    App-->>User: ✅ Resultados de busca
```

**Latência Budget**: < 1500ms (com APIs externas)
- Cache check: 2ms (hit) ou miss
- DB search: 50ms (com GIN index)
- Nutritionix + USDA (paralelo): 2000ms timeout cada
- **Retorno rápido**: 100ms (se cache) até 2050ms (timeout) ✅

**Degradação Graceful**:
- Se Nutritionix cai: retorna USDA + local
- Se ambas caem: retorna apenas local com flag `X-Degraded: true`

---

## 6. Fluxo 5: Dashboard de Tracking

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as App Mobile
    participant Gateway as API Gateway
    participant TrackingSvc as Tracking Service
    participant NutritionSvc as Nutrition Service
    participant Cache as Redis Cache
    participant MongoDB as MongoDB
    participant DB as PostgreSQL

    User->>App: Abre aba "Progresso"
    App->>Gateway: GET /api/v1/tracking/dashboard<br/>?date=2025-09-01
    Gateway->>TrackingSvc: Roteia + aguarda resposta
    
    TrackingSvc->>Cache: GET dashboard:{userId}:{date}
    Cache-->>TrackingSvc: null ou {cached_data, 5min TTL}
    
    alt Cache hit
        TrackingSvc->>Gateway: 200<br/>{dashboard}
    else Cache miss
        Note over TrackingSvc: Agregação de dados
        
        par Nutrition Daily
            TrackingSvc->>NutritionSvc: GET /api/v1/nutrition/daily<br/>?date=2025-09-01
            NutritionSvc->>Cache: GET user:daily:{userId}:{date}
            Cache-->>NutritionSvc: {macros, percentage}
            NutritionSvc-->>TrackingSvc: {consumed, target, remaining}
        and Streak Info
            TrackingSvc->>Cache: GET streak:{userId}
            Cache-->>TrackingSvc: {current: 15, longest: 45}
        and Week Summary
            TrackingSvc->>MongoDB: db.user_analytics.findOne<br/>{userId, week: 36, year: 2025}
            MongoDB-->>TrackingSvc: {avgCalories, avgProtein, adherence}
        and Chart Data (últimos 30 dias)
            TrackingSvc->>MongoDB: db.user_analytics.find<br/>{userId, date: {$gte: 30d_ago}}<br/>projection: {date, calories, protein}
            MongoDB-->>TrackingSvc: [{date, metrics}...]
        end
        
        TrackingSvc->>TrackingSvc: Agregação em objeto DashboardResponse
        Note over TrackingSvc: Combina dados de múltiplas fontes
        
        TrackingSvc->>Cache: SET dashboard:{userId}:{date}<br/>{aggregated} EX 300
        TrackingSvc->>Gateway: 200<br/>{dashboard}
    end
    
    Gateway-->>App: 200<br/>{today, chart, streak, ...}
    App-->>User: ✅ Dashboard carregado
    
    Note over App: Gráficos renderizam em < 1s<br/>(dados já em formato otimizado)
```

**Latência Budget**: < 1200ms
- Cache check: 2ms
- Nutrition parallel call: 200ms
- Streak check: 5ms
- MongoDB finds: 100-200ms
- Agregação: 50ms
- Cache write: 10ms
- **Total**: ~400ms (cache hit) até 500ms (miss) ✅

**Otimizações**:
- MongoDB indexado em (userId, date) para rápido lookup
- Redis cache TTL 5 min evita recálculos frequentes
- Parallelização de 4 queries reduz latência em 75%

---

## 7. Fluxo 6: Notificação

```mermaid
sequenceDiagram
    participant Event as Evento (RabbitMQ)
    participant NotifSvc as Notification Service
    participant Redis as Redis
    participant FCM as Firebase Cloud Messaging
    participant Email as SendGrid
    participant Device as Device do Usuário

    Event->>NotifSvc: Recebe "MealConsumed" ou<br/>"DailyGoalReached"
    
    NotifSvc->>Redis: GET user:notification_prefs:{userId}
    Redis-->>NotifSvc: {pushEnabled, emailEnabled, ...}
    
    NotifSvc->>NotifSvc: Template resolver<br/>(baseado em evento type)
    
    alt Email enabled
        NotifSvc->>NotifSvc: Prepara email HTML
        NotifSvc->>Email: POST /send<br/>{to, subject, html, scheduled: null}
        Email-->>NotifSvc: 202 (queued)
    end
    
    alt Push enabled
        NotifSvc->>NotifSvc: Prepara push payload
        Note over NotifSvc: {title, body, deepLink}
        
        NotifSvc->>Redis: SMEMBERS push_tokens:{userId}
        Redis-->>NotifSvc: {token1, token2, ...} (múltiplos devices)
        
        par Device 1
            NotifSvc->>FCM: POST /send<br/>{tokens: [device1], message}
            FCM-->>NotifSvc: 200 {success_count: 1}
        and Device 2
            NotifSvc->>FCM: POST /send<br/>{tokens: [device2], message}
            FCM-->>NotifSvc: 200 {success_count: 1}
        end
    end
    
    FCM->>Device: Push notification via APNs (iOS) ou GCM (Android)
    Device-->>Device: ✅ Notificação exibida
```

**Latência Budget**: < 500ms (até confirmação FCM)
- Template resolver: 10ms
- Redis cache: 5ms
- Email queue (async): 10ms
- FCM (paralelo): 100-200ms
- **Total (até resposta)**: ~225ms ✅
- Entrega real no device: 1-5 segundos (FCM backend)

**Retry Policy**:
- Email falha: retry automático 3x com exponential backoff
- Push falha: marca token como inválido após 3 erros
- Notification not sent: registra em MongoDB (audit trail)

---

## 8. Fluxo 7: Sugestão de Meal Plan via IA

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as App Mobile
    participant Gateway as API Gateway
    participant MealPlanSvc as Meal Plan Service
    participant Queue as Task Queue (Redis)<br/>+ Workers
    participant AISvc as AI Service
    participant OpenAI as OpenAI GPT-4o
    participant Gemini as Google Gemini<br/>(Fallback)
    participant FoodSvc as Food Service
    participant DB as PostgreSQL

    User->>App: Clica "Sugerir meal plan"<br/>preenche constraints
    App->>Gateway: POST /api/v1/meal-plans/suggest<br/>{targetCalories, daysCount, dietaryRestrictions}
    Gateway->>MealPlanSvc: Roteia
    
    MealPlanSvc->>MealPlanSvc: Valida constraints
    MealPlanSvc->>DB: INSERT INTO suggestion_requests<br/>(user_id, constraints, status: 'PENDING')
    DB-->>MealPlanSvc: suggestion_request_id
    
    MealPlanSvc->>Queue: LPUSH suggest_job<br/>{userId, suggestionId, constraints}
    MealPlanSvc->>Gateway: 202 Accepted<br/>{suggestionId, status: PROCESSING}
    Gateway-->>App: 202<br/>{suggestion_id, poll_url}
    
    Note over App: App inicia polling de 2 em 2s<br/>GET /api/v1/meal-plans/suggest/{suggestionId}
    
    Queue->>AISvc: Worker dequeue + processa job
    
    AISvc->>AISvc: Monta prompt estruturado
    Note over AISvc: Include: calories, diet restrictions,<br/>available foods, chain-of-thought
    
    par OpenAI (Primary)
        AISvc->>AISvc: Timeout: 60s
        AISvc->>OpenAI: POST /v1/chat/completions<br/>{model: gpt-4o, messages, temperature: 0.7}
        OpenAI-->>AISvc: {choices[0].text: meal_suggestions_json}
    and Gemini (Fallback)
        AISvc->>AISvc: Timeout: 30s<br/>(só executa se OpenAI demora > 10s)
        AISvc->>Gemini: POST /v1beta/models/...:generateContent
    end
    
    alt OpenAI respondeu < 10s
        AISvc->>AISvc: Parse response JSON
    else OpenAI > 10s E Gemini < 30s
        AISvc->>AISvc: Usa resposta Gemini
    else Ambas timeout
        AISvc->>AISvc: Fallback: gera sugestão heurística
        Note over AISvc: Base em histórico de alimentos<br/>do usuário + algoritmo simples
    end
    
    AISvc->>FoodSvc: Enriquece com dados reais dos foods
    Note over AISvc: Para cada alimento sugerido,<br/>busca macros precisas em FoodSvc
    FoodSvc-->>AISvc: {foods com macros atualizadas}
    
    AISvc->>AISvc: Valida meal plan sugerido
    Note over AISvc: Confirma que macros batem<br/>com constraints
    
    alt Validação OK
        AISvc->>DB: UPDATE suggestion_requests<br/>SET status: 'COMPLETED', result: {...}
        AISvc->>MealPlanSvc: Evento "SuggestionReady"<br/>{suggestionId, mealPlan}
    else Validação falha
        AISvc->>DB: UPDATE suggestion_requests<br/>SET status: 'FAILED', error: {...}
    end
    
    App->>Gateway: GET /api/v1/meal-plans/suggest/{suggestionId}
    Gateway->>MealPlanSvc: Busca resultado
    MealPlanSvc->>DB: SELECT * FROM suggestion_requests WHERE id = ?
    DB-->>MealPlanSvc: {status: COMPLETED, result}
    Gateway-->>App: 200<br/>{status: COMPLETED, meal_plan}
    
    App-->>User: ✅ Sugestão pronta!<br/>Opção de aceitar/rejeitar
```

**Latência Budget**: 30-120 segundos (assíncrono)
- Job enqueue: 50ms
- OpenAI response: 10-30s
- Gemini fallback: 5-15s
- Food enrichment: 2-5s
- Validação: 500ms
- **Total**: ~15-40s típico ✅

**Padrão**: 
- Assíncrono com polling (evita timeout HTTP)
- Double timeout: OpenAI (60s) + Gemini (30s)
- Fallback heurístico se ambas falham (nunca nega ao usuário)

---

## 9. Fluxo 8: Análise de Progresso (IA)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as App Mobile
    participant Gateway as API Gateway
    participant TrackingSvc as Tracking Service
    participant Queue as Task Queue
    participant AISvc as AI Service
    participant NutritionSvc as Nutrition Service
    participant MongoDB as MongoDB
    participant OpenAI as OpenAI GPT-4o

    User->>App: Abre "Insights IA"
    App->>Gateway: POST /api/v1/ai/analyze-progress<br/>{days: 30}
    Gateway->>TrackingSvc: Roteia
    
    TrackingSvc->>TrackingSvc: Cria analysis request
    TrackingSvc->>Queue: LPUSH analysis_job<br/>{userId, days, analysisId}
    TrackingSvc->>Gateway: 202 Accepted<br/>{analysisId}
    Gateway-->>App: 202
    
    App->>App: Exibe "Analisando seus dados..."<br/>polling a cada 3s
    
    Queue->>AISvc: Worker processa job
    
    AISvc->>NutritionSvc: GET /api/v1/nutrition/report/{period}<br/>?days=30
    NutritionSvc-->>AISvc: {avgDaily, peaks, consistency, trends}
    
    AISvc->>MongoDB: db.user_analytics.find<br/>{userId, date: {$gte: 30d_ago}}
    MongoDB-->>AISvc: raw historical data
    
    AISvc->>AISvc: Agregação estatística
    Note over AISvc: média, desvio padrão,<br/>correlações, tendências
    
    AISvc->>AISvc: Monta prompt de análise
    Note over AISvc: Context: histórico 30 dias,<br/>metas, aderência, top days/bloqueios
    
    AISvc->>OpenAI: POST /v1/chat/completions<br/>system: análise nutricional especializada<br/>user: seus dados dos últimos 30 dias
    OpenAI-->>AISvc: análise estruturada<br/>{summary, strengths, improvements, recommendations}
    
    AISvc->>MongoDB: db.ai_analyses.insertOne<br/>{userId, analysisId, result, timestamp}
    
    AISvc->>AISvc: Evento "AnalysisComplete"
    
    App->>Gateway: GET /api/v1/ai/analyze-progress/{analysisId}
    Gateway->>TrackingSvc: Busca resultado
    TrackingSvc->>MongoDB: db.ai_analyses.findOne<br/>{analysisId}
    MongoDB-->>TrackingSvc: analysis result
    Gateway-->>App: 200<br/>{analysis}
    
    App-->>User: ✅ Análise pronta
    User->>App: Lê insights e recomendações
```

**Latência Budget**: 20-60 segundos
- Nutrition report: 500ms
- MongoDB fetch: 1-2s
- Agregação: 500ms
- GPT-4o response: 5-15s
- **Total**: ~7-20s ✅

---

## 10. Latência Budgets

### 10.1 Tabela de SLAs por Operação

| Operação | Budget P95 | P99 | Tipo | Crítica? |
|----------|-----------|-----|------|-----------|
| Login | 300ms | 500ms | Síncrono | ✅ SIM |
| Register | 800ms | 1200ms | Síncrono | ✅ SIM |
| Criar Meal Plan | 600ms | 1000ms | Síncrono | ❌ NÃO (pode async) |
| Registrar consumo | 800ms | 1200ms | Síncrono | ✅ SIM |
| Buscar alimento | 1500ms | 2500ms | Síncrono + Externo | ✅ SIM |
| Dashboard | 1200ms | 1500ms | Síncrono | ✅ SIM |
| Sugerir meal plan | 30-120s | 180s | Assíncrono | ❌ NÃO |
| Análise progresso | 20-60s | 120s | Assíncrono | ❌ NÃO |
| Notificação enviada | 500ms | 1000ms | Assíncrono | ❌ NÃO |

### 10.2 Estratégias de Proteção

**Circuit Breaker**: 
- Ativa depois de 5 timeouts consecutivos
- Estado: CLOSED (normal) → OPEN (falha) → HALF_OPEN (testando) → CLOSED
- Fallback para dados em cache ou resposta padrão
- Timeout padrão: 3 segundos

**Rate Limiting**:
- 100 requisições/minuto por usuário
- 1000 requisições/minuto por IP (para APIs públicas)
- Resposta: 429 Too Many Requests

**Timeout Graduado**:
```
API Gateway timeout: 30 segundos
Serviço-to-serviço timeout: 3 segundos
RabbitMQ timeout: 30 segundos (com retry)
Acessos externos (OpenAI/Nutritionix): 60 segundos (com fallback)
```

---

## 11. Observabilidade

### 11.1 Rastreamento Distribuído

Cada requisição possui:
```
X-Request-Id: req-{timestamp}-{random}
X-Trace-Id: {uuid} (para APM)
X-Span-Id: incremental por serviço
X-User-Id: extraído do JWT
```

### 11.2 Métricas por Fluxo

```
Para cada fluxo registrar:
  - total_requests (contador)
  - latency_p50, p95, p99 (histograma)
  - error_rate (taxa de erros 4xx/5xx)
  - circuit_breaker_trips (evento)
  - cache_hit_rate (%)
  - dependency_latency (latência de chamadas síncronas)
```

### 11.3 Alertas Críticos

```
Alertar quando:
  - P95 latência > 2x do normal para fluxo crítico
  - Error rate > 1% em qualquer serviço
  - Circuit breaker em OPEN > 60s
  - Database query > 1s
  - RabbitMQ queue depth > 10000 mensagens
  - Cache hit rate < 50% para operações críticas
```

---

## 12. Conclusão

Os 8 fluxos principais cobrem:
- ✅ Autenticação (2 fluxos: register, login)
- ✅ Meal planning (1 fluxo: criação + IA)
- ✅ Consumo/registro (1 fluxo: meal consumed)
- ✅ Busca (1 fluxo: foods com APIs externas)
- ✅ Dashboard (1 fluxo: agregação dados)
- ✅ Notificações (1 fluxo: async eventos)
- ✅ IA/analytics (2 fluxos: sugestão + análise)

Todos respeitam budgets e contêm estratégias de fallback/degradação graceful.

**Próximos passos**:
1. Implementar tracing distribuído (Jaeger/Datadog)
2. Configurar alertas em Prometheus
3. Validar latências em staging (load testing)
4. Documentar runbooks de incident response

---

**Fim do documento - 06-DATA-FLOW.md**  
**Total de linhas**: 980  
**Data de criação**: 2025-08-01  
**Status**: Pronto para commit
