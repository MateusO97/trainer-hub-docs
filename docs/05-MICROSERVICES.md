# 05-MICROSERVICES.md
## Especificações de Microsserviços - TrAIner Hub

**Versão**: 1.0  
**Data**: 2025-08-01  
**Status**: Final - Fase 1.5  
**Propósito**: Definir contratos REST, DTOs, status codes e responsabilidades de cada microsserviço

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Padrões Globais](#padrões-globais)
3. [Api Gateway](#api-gateway)
4. [Auth Service](#auth-service)
5. [User Service](#user-service)
6. [Meal Plan Service](#meal-plan-service)
7. [Meal Service](#meal-service)
8. [Food Service](#food-service)
9. [Nutrition Service](#nutrition-service)
10. [Tracking Service](#tracking-service)
11. [Notification Service](#notification-service)
12. [AI Service](#ai-service)
13. [Contatos e SLAs](#contatos-e-slas)

---

## 1. Visão Geral

Cada microsserviço expõe uma REST API com responsabilidades bem definidas, seguindo princípios:

- **Database per Service**: Cada serviço gerencia seus dados
- **Loosely Coupled**: Comunicação assíncrona via eventos (RabbitMQ) quando possível
- **REST Síncrono**: Apenas para operações críticas que exigem resposta imediata (<500ms)
- **Versionamento**: URLs com `/api/v1/` prefix
- **Documentação**: OpenAPI 3.0 schema embarcado em cada serviço

### Arquitetura de Camadas por Serviço

```
┌ HTTP Request
│
├─ Controller (Spring REST)
├─ DTO Validation (Validation annotations)
├─ UseCase (Business Logic - Clean Architecture)
├─ Repository (Data Access)
├─ Entity (Domain Model)
│
└─ HTTP Response
```

### Padrão de Erro Global

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 'uuid-123' not found",
    "timestamp": "2025-08-01T10:30:45Z",
    "requestId": "req-abc-123",
    "details": {
      "userId": "uuid-123"
    }
  }
}
```

---

## 2. Padrões Globais

### 2.1 Autenticação & Autorização

**Todos os serviços (exceto Auth)** validam Bearer token JWT:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
```

**Headers Obrigatórios em Requisições Internas**:
```
X-User-Id: uuid (extraído do JWT)
X-Request-Id: req-{timestamp}-{random} (para rastreamento)
X-Service-Name: origin-service (qual serviço fez a chamada)
```

### 2.2 Respostas de Sucesso

```json
{
  "data": { /* payload */ },
  "meta": {
    "timestamp": "2025-08-01T10:30:45Z",
    "requestId": "req-abc-123"
  }
}
```

### 2.3 Status Codes Padrão

| Código | Significado | Exemplo |
|--------|-------------|---------|
| 200 | OK - Operação bem-sucedida | GET /users/{id} |
| 201 | Created - Recurso criado | POST /users |
| 202 | Accepted - Assíncrono aceito | POST /meals/batch-process |
| 204 | No Content - Sucesso sem body | DELETE /users/{id} |
| 400 | Bad Request - Validação falhou | Payload inválido |
| 401 | Unauthorized - Token inválido/expirado | JWT expirado |
| 403 | Forbidden - Sem permissão | User não é nutricionista |
| 404 | Not Found - Recurso não existe | GET /users/{id} inexistente |
| 409 | Conflict - Estado inválido | Duplicar meal-plan |
| 429 | Too Many Requests - Rate limit | 100 req/min excedido |
| 500 | Internal Server Error | Bug no serviço |
| 503 | Service Unavailable - Downstream off | Food DB offline |

### 2.4 Rate Limiting

**Padrão Global**: 100 requisições por minuto por user (JWT sub)

Headers de resposta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1693472445 (Unix timestamp)
```

### 2.5 Paginação

Para endpoints que retornam listas:

```
Query Parameters:
  - page: 1 (número de página, começa em 1)
  - size: 20 (itens por página, máx 100)
  - sort: field:asc|desc (ex: sort=createdAt:desc)

Response Structure:
{
  "data": [{...}, {...}],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 150,
    "hasMore": true
  },
  "meta": {...}
}
```

---

## 3. Api Gateway

**Porta**: 8080 (Public)  
**Função**: Roteamento, autenticação global, rate limiting, log de requisições  
**Tecnologia**: Spring Cloud Gateway

### 3.1 Rotas

| Padrão | Destino | Autenticação |
|--------|---------|------|
| `/auth/**` | Auth Service (8081) | ❌ Sem auth |
| `/api/v1/users/**` | User Service (8082) | ✅ JWT obrigatório |
| `/api/v1/meal-plans/**` | Meal Plan Service (8083) | ✅ JWT obrigatório |
| `/api/v1/meals/**` | Meal Service (8084) | ✅ JWT obrigatório |
| `/api/v1/foods/**` | Food Service (8085) | ✅ JWT obrigatório |
| `/api/v1/nutrition/**` | Nutrition Service (8086) | ✅ JWT obrigatório |
| `/api/v1/tracking/**` | Tracking Service (8087) | ✅ JWT obrigatório |
| `/api/v1/notifications/**` | Notification Service (8088) | ✅ JWT obrigatório |
| `/api/v1/ai/**` | AI Service (8089) | ✅ JWT obrigatório |
| `/docs/**` | Swagger UI | ❌ Sem auth |

### 3.2 Endpoints Gateway

```http
GET /docs
Description: Swagger UI agregado de todos os serviços
Response: HTML (Swagger UI)
```

```http
GET /health
Description: Health check do gateway
Response: 
{
  "status": "UP",
  "services": {
    "users": "UP",
    "meals": "UP",
    "food": "UP",
    ...
  }
}
```

---

## 4. Auth Service

**Porta**: 8081 (Private, acessível via Gateway)  
**Função**: Autenticação (login, registro), geração JWT, refresh token  
**Database**: PostgreSQL (users table)  
**Padrão**: OAuth2 + JWT  

### 4.1 DTOs

```kotlin
// Request
data class LoginRequest(
  val email: String,      // RFC 5322
  val password: String    // min 8 chars
)

// Response
data class LoginResponse(
  val accessToken: String,      // JWT válido por 1h
  val refreshToken: String,     // válido por 7 dias
  val expiresIn: Long,          // segundos (3600)
  val tokenType: String = "Bearer"
)

data class RegisterRequest(
  val email: String,
  val password: String,           // min 8 chars, 1 upper, 1 digit, 1 special
  val name: String,
  val birthDate: LocalDate,       // ISO 8601
  val gender: String              // M, F, O
)

data class RefreshTokenRequest(
  val refreshToken: String
)
```

### 4.2 Endpoints

```http
POST /auth/register
Description: Crear nova conta de usuário
Request:
{
  "email": "gabriel@example.com",
  "password": "SecurePass123!",
  "name": "Gabriel Silva",
  "birthDate": "2000-05-15",
  "gender": "M"
}

Response 201:
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiI...",
    "refreshToken": "ref_token_xyz...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}

Errors:
  - 400: Email já registrado (DUPLICATE_EMAIL)
  - 400: Senha fraca (WEAK_PASSWORD)
  - 400: Email inválido (INVALID_EMAIL)
```

```http
POST /auth/login
Description: Autenticar usuário existente
Request:
{
  "email": "gabriel@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "data": {...} // LoginResponse
}

Errors:
  - 401: Email/senha incorretos (INVALID_CREDENTIALS)
```

```http
POST /auth/refresh
Description: Gerar novo access token usando refresh token
Request:
{
  "refreshToken": "ref_token_xyz..."
}

Response 200:
{
  "data": {...} // LoginResponse (com novo accessToken)
}

Errors:
  - 401: Refresh token expirado/inválido (INVALID_REFRESH_TOKEN)
```

```http
POST /auth/logout
Description: Invalidar refresh token (revoke)
Headers:
  Authorization: Bearer {accessToken}

Request: {}

Response 204: (No Content)

Errors:
  - 401: Token inválido (INVALID_TOKEN)
```

```http
POST /auth/password-reset
Description: Iniciar reset de senha (enviar email com link)
Request:
{
  "email": "gabriel@example.com"
}

Response 202: (Accepted)
{
  "data": {
    "message": "Email de reset enviado para gabriel@example.com"
  }
}
```

---

## 5. User Service

**Porta**: 8082 (Private)  
**Função**: Gerenciar perfis, preferências, dados pessoais  
**Database**: PostgreSQL (users, user_profiles, user_preferences tables)  
**Eventos Produzidos**: UserCreated, UserUpdated, UserDeleted

### 5.1 DTOs

```kotlin
data class UserProfileResponse(
  val userId: UUID,
  val name: String,
  val email: String,
  val birthDate: LocalDate,
  val gender: String,
  val phone: String?,
  val avatar: String?,
  val createdAt: Instant,
  val updatedAt: Instant
)

data class UserPreferencesRequest(
  val language: String = "pt-BR",  // ISO 639-1
  val timezone: String = "America/Sao_Paulo",
  val dailyCalorieGoal: Int?,       // 1500-3500
  val notificationEnabled: Boolean = true,
  val nutritionistAccess: Boolean = false  // permite nutricionista ver dados
)

data class UserPreferencesResponse(
  val userId: UUID,
  val ...  // UserPreferencesRequest fields
)
```

### 5.2 Endpoints

```http
GET /api/v1/users/profile
Description: Obter perfil do usuário autenticado
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // UserProfileResponse
}
```

```http
PUT /api/v1/users/profile
Description: Atualizar perfil (name, phone, avatar, etc)
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "name": "Gabriel Silva Santos",
  "phone": "+55 11 9 8765-4321",
  "avatar": "https://..."
}

Response 200:
{
  "data": {...}  // UserProfileResponse atualizado
}

Errors:
  - 400: Avatar URL inválida (INVALID_AVATAR_URL)
  - 400: Phone inválido (INVALID_PHONE_FORMAT)
```

```http
GET /api/v1/users/preferences
Description: Obter preferências do usuário
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // UserPreferencesResponse
}
```

```http
PUT /api/v1/users/preferences
Description: Atualizar preferências
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "dailyCalorieGoal": 2000,
  "notificationEnabled": true,
  "timezone": "America/Sao_Paulo"
}

Response 200:
{
  "data": {...}  // UserPreferencesResponse
}
```

```http
DELETE /api/v1/users/profile
Description: Deletar conta (soft delete, anonimizar dados)
Headers:
  Authorization: Bearer {accessToken}

Response 204: (No Content)

Events:
  - UserDeleted event publicado para RabbitMQ
```

```http
GET /api/v1/users/{userId}/summary
Description: Obter sumário público (usado por nutricionistas)
Headers:
  Authorization: Bearer {accessToken}
  X-User-Id: {requestingUserId}

Response 200:
{
  "data": {
    "userId": "...",
    "name": "Gabriel",
    "email": "gabriel@...",
    "memberSince": "2025-01-01",
    "mealsLogged": 145,
    "nutritionistId": "..." // se tem nutricionista atribuído
  }
}

Errors:
  - 403: Acesso negado (nutricionista não autorizado)
```

---

## 6. Meal Plan Service

**Porta**: 8083 (Private)  
**Função**: Criar, gerenciar e sugerir meal plans (planos de alimentação)  
**Database**: PostgreSQL (meal_plans, meals_in_plan tables)  
**Eventos Produzidos**: MealPlanCreated, MealPlanUpdated, MealPlanDeleted  
**Eventos Consumidos**: UserCreated

### 6.1 DTOs

```kotlin
data class CreateMealPlanRequest(
  val name: String,
  val description: String?,
  val startDate: LocalDate,
  val endDate: LocalDate?,
  val targetCalories: Int,          // em calorias/dia
  val frequency: String = "WEEKLY"  // DAILY, WEEKLY, MONTHLY
)

data class MealPlanResponse(
  val mealPlanId: UUID,
  val userId: UUID,
  val name: String,
  val description: String?,
  val startDate: LocalDate,
  val endDate: LocalDate?,
  val targetCalories: Int,
  val frequency: String,
  val meals: List<MealInPlanResponse>,
  val createdAt: Instant,
  val updatedAt: Instant,
  val status: String  // ACTIVE, PAUSED, COMPLETED
)

data class MealInPlanResponse(
  val mealPlanMealId: UUID,
  val mealId: UUID,
  val dayOfWeek: Int,  // 0-6 (seg-dom)
  val mealType: String,  // BREAKFAST, LUNCH, DINNER, SNACK
  val servings: Int
)

data class SuggestMealPlanRequest(
  val targetCalories: Int,
  val daysCount: Int = 7,
  val dietaryRestrictions: List<String>?  // VEGETARIAN, VEGAN, GLUTEN_FREE
)
```

### 6.2 Endpoints

```http
POST /api/v1/meal-plans
Description: Criar novo meal plan
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "name": "Plano de Ganho de Massa",
  "description": "3000 calorias/dia",
  "startDate": "2025-09-01",
  "targetCalories": 3000,
  "frequency": "WEEKLY"
}

Response 201:
{
  "data": {...}  // MealPlanResponse
}
```

```http
GET /api/v1/meal-plans/{planId}
Description: Obter plano específico com todos os meals
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // MealPlanResponse
}

Errors:
  - 404: Plan não encontrado (MEAL_PLAN_NOT_FOUND)
  - 403: Acesso negado (NOT_PLAN_OWNER)
```

```http
GET /api/v1/meal-plans
Description: Listar todos os planos do usuário
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - page: 1
  - size: 20
  - status: ACTIVE,PAUSED
  - sort: createdAt:desc

Response 200:
{
  "data": [{...}, {...}],
  "pagination": {...}
}
```

```http
PUT /api/v1/meal-plans/{planId}
Description: Atualizar plano
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "name": "Plano atualizado",
  "targetCalories": 3200,
  "status": "ACTIVE"
}

Response 200:
{
  "data": {...}  // MealPlanResponse atualizado
}
```

```http
DELETE /api/v1/meal-plans/{planId}
Description: Deletar plano
Headers:
  Authorization: Bearer {accessToken}

Response 204: (No Content)
```

```http
POST /api/v1/meal-plans/{planId}/meals/{mealId}
Description: Adicionar meal ao plano
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "dayOfWeek": 0,        // segunda-feira
  "mealType": "LUNCH",
  "servings": 1
}

Response 201:
{
  "data": {...}  // MealInPlanResponse
}

Errors:
  - 400: Meal já existe no plano (DUPLICATE_MEAL_IN_PLAN)
```

```http
DELETE /api/v1/meal-plans/{planId}/meals/{mealInPlanId}
Description: Remover meal do plano
Headers:
  Authorization: Bearer {accessToken}

Response 204: (No Content)
```

```http
POST /api/v1/meal-plans/suggest
Description: Sugerir meal plan via IA
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "targetCalories": 2500,
  "daysCount": 7,
  "dietaryRestrictions": ["VEGETARIAN"]
}

Response 202: (Accepted - assíncrono)
{
  "data": {
    "suggestRequestId": "sugg-xyz-123",
    "status": "PROCESSING",
    "estimatedTime": 30  // segundos
  }
}

Polling para resultado:
GET /api/v1/meal-plans/suggest/{suggestRequestId}

Response 200 (quando pronto):
{
  "data": {
    "status": "COMPLETED",
    "suggestedPlan": {...}  // MealPlanResponse
  }
}
```

---

## 7. Meal Service

**Porta**: 8084 (Private)  
**Função**: Gerenciar refeições (meals) com alimentos e macros  
**Database**: PostgreSQL (meals, meals_consumed tables)  
**Eventos Produzidos**: MealCreated, MealUpdated, MealConsumed  
**Eventos Consumidos**: FoodCreated, FoodUpdated

### 7.1 DTOs

```kotlin
data class CreateMealRequest(
  val name: String,
  val description: String?,
  val mealType: String,  // BREAKFAST, LUNCH, DINNER, SNACK
  val foods: List<MealFoodItem>,
  val prepTime: Int?  // em minutos
)

data class MealFoodItem(
  val foodId: UUID,
  val quantity: Double,  // em unidade padrão (g, ml, un)
  val unit: String      // g (default), ml, un
)

data class MealResponse(
  val mealId: UUID,
  val userId: UUID,
  val name: String,
  val description: String?,
  val mealType: String,
  val foods: List<MealFoodInResponse>,
  val macros: MacroNutrients,
  val prepTime: Int?,
  val createdAt: Instant
)

data class MacroNutrients(
  val calories: Float,
  val protein: Float,      // em gramas
  val carbs: Float,
  val fat: Float,
  val fiber: Float,
  val sodium: Float
)

data class ConsumeMealRequest(
  val mealId: UUID,
  val consumedAt: Instant = now(),
  val quantity: Double = 1.0  // multiplicador
)

data class MealConsumedResponse(
  val consumedMealId: UUID,
  val mealId: UUID,
  val userId: UUID,
  val consumedAt: Instant,
  val macros: MacroNutrients  // com quantity aplicada
)
```

### 7.2 Endpoints

```http
POST /api/v1/meals
Description: Criar nova refeição (recipe)
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "name": "Frango com arroz integral",
  "description": "200g frango + 150g arroz",
  "mealType": "LUNCH",
  "prepTime": 30,
  "foods": [
    {"foodId": "uuid-chicken", "quantity": 200, "unit": "g"},
    {"foodId": "uuid-rice", "quantity": 150, "unit": "g"}
  ]
}

Response 201:
{
  "data": {...}  // MealResponse (com macros calculadas)
}
```

```http
GET /api/v1/meals/{mealId}
Description: Obter detalhes de refeição
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // MealResponse
}
```

```http
GET /api/v1/meals
Description: Listar refeições do usuário
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - page: 1
  - mealType: BREAKFAST
  - sort: createdAt:desc

Response 200:
{
  "data": [{...}, {...}],
  "pagination": {...}
}
```

```http
PUT /api/v1/meals/{mealId}
Description: Atualizar refeição
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "name": "Frango com batata doce",
  "foods": [...]
}

Response 200:
{
  "data": {...}  // MealResponse atualizado
}
```

```http
DELETE /api/v1/meals/{mealId}
Description: Deletar refeição
Headers:
  Authorization: Bearer {accessToken}

Response 204: (No Content)
```

```http
POST /api/v1/meals/{mealId}/consume
Description: Registrar consumo de refeição
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "consumedAt": "2025-09-01T12:30:00Z",
  "quantity": 1.0
}

Response 201:
{
  "data": {...}  // MealConsumedResponse
}

Events:
  - MealConsumed publicado (consumido em {timestamp})
  - Nutrition Service notificado para atualizar macros diários
```

```http
GET /api/v1/meals/consumed
Description: Histórico de refeições consumidas
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - date: 2025-09-01 (filter por data)
  - page: 1
  - size: 50

Response 200:
{
  "data": [{...}, {...}],
  "pagination": {...}
}
```

---

## 8. Food Service

**Porta**: 8085 (Private)  
**Função**: Gerenciar banco de alimentos com macros  
**Database**: PostgreSQL (foods, food_macros tables)  
**Eventos Produzidos**: FoodCreated, FoodUpdated  
**APIs Externas**: Nutritionix API, USDA FoodData Central

### 8.1 DTOs

```kotlin
data class CreateFoodRequest(
  val name: String,
  val description: String?,
  val barcode: String?,         // EAN-13 opcional
  val category: String,          // FRUIT, VEGETABLE, PROTEIN, CARB, FAT, etc
  val portion: String = "100g",  // unidade padrão
  val macros: CreateMacroRequest
)

data class CreateMacroRequest(
  val calories: Float,
  val protein: Float,
  val carbs: Float,
  val fat: Float,
  val fiber: Float? = 0f,
  val sodium: Float? = 0f
)

data class FoodResponse(
  val foodId: UUID,
  val name: String,
  val description: String?,
  val barcode: String?,
  val category: String,
  val portion: String,
  val macros: MacroNutrients,
  val source: String,  // MANUAL, NUTRITIONIX, USDA, OPENAI
  val verified: Boolean,  // verificado por nutricionista?
  val createdAt: Instant
)

data class SearchFoodRequest(
  val query: String,
  val limit: Int = 10,
  val includeExternal: Boolean = true  // buscar em Nutritionix/USDA se não achar local
)
```

### 8.2 Endpoints

```http
POST /api/v1/foods
Description: Criar novo alimento
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "name": "Peito de frango grelhado",
  "category": "PROTEIN",
  "portion": "100g",
  "macros": {
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "sodium": 75
  }
}

Response 201:
{
  "data": {...}  // FoodResponse
}
```

```http
GET /api/v1/foods/{foodId}
Description: Obter alimento específico
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // FoodResponse
}
```

```http
GET /api/v1/foods
Description: Listar alimentos com filtros
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - category: PROTEIN
  - search: frango
  - page: 1
  - verified: true (apenas verificados)

Response 200:
{
  "data": [{...}, {...}],
  "pagination": {...}
}
```

```http
POST /api/v1/foods/search
Description: Buscar alimentos (local + externos)
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "query": "frango grelhado",
  "limit": 10,
  "includeExternal": true
}

Response 200:
{
  "data": {
    "local": [{...}, {...}],  // foods já cadastrados
    "nutritionix": [{...}, {...}],  // resultados Nutritionix API
    "usda": [{...}]  // resultados USDA
  }
}

Errors:
  - 503: Nutritionix/USDA unavailable (EXTERNAL_API_ERROR)
```

```http
POST /api/v1/foods/{foodId}/import
Description: Importar alimento de fonte externa (Nutritionix/USDA)
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "source": "NUTRITIONIX",
  "externalId": "nutritionix-123"
}

Response 201:
{
  "data": {...}  // FoodResponse com dados importados
}
```

```http
PUT /api/v1/foods/{foodId}
Description: Atualizar alimento
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "name": "Peito de frango assado",
  "macros": {...}
}

Response 200:
{
  "data": {...}  // FoodResponse atualizado
}
```

```http
DELETE /api/v1/foods/{foodId}
Description: Deletar alimento (soft delete)
Headers:
  Authorization: Bearer {accessToken}

Response 204: (No Content)

Note: Alimentos consumidos anteriormente não são deletados, apenas marcados como inacessíveis
```

```http
POST /api/v1/foods/{foodId}/verify
Description: Verificar alimento (marcar como confiável - admin/nutricionista only)
Headers:
  Authorization: Bearer {accessToken}
  X-User-Role: NUTRITIONIST|ADMIN

Response 200:
{
  "data": {...}  // FoodResponse com verified=true
}
```

---

## 9. Nutrition Service

**Porta**: 8086 (Private)  
**Função**: Calcular macros, acompanhar consumo diário, gerar relatórios  
**Database**: PostgreSQL (nutrition_targets table), MongoDB (user_analytics collection)  
**Eventos Consumidos**: MealConsumed, UserCreated  
**Eventos Produzidos**: DailyGoalReached, MacroAlertTriggered

### 9.1 DTOs

```kotlin
data class DailyMacroSummaryResponse(
  val userId: UUID,
  val date: LocalDate,
  val consumed: MacroNutrients,
  val target: NutritionTarget,
  val remaining: MacroNutrients,
  val percentage: MacroPercentage,
  val meals: List<MealConsumedRef>
)

data class NutritionTarget(
  val calories: Int,
  val protein: Int,      // em gramas
  val carbs: Int,
  val fat: Int,
  val fiber: Int,
  val sodium: Int
)

data class MacroPercentage(
  val calories: Float,    // em % do alvo
  val protein: Float,
  val carbs: Float,
  val fat: Float,
  val fiber: float,
  val sodium: Float
)

data class NutritionReportResponse(
  val userId: UUID,
  val startDate: LocalDate,
  val endDate: LocalDate,
  val averageDaily: MacroNutrients,
  val peaks: List<PeakEntry>,      // dias/macros mais altos
  val consistency: Float,            // 0-100%, aderência ao alvo
  val trends: List<TrendEntry>,
  val nutritionistInsights: String?  // anotações nutricionista
)

data class PeakEntry(
  val date: LocalDate,
  val macro: String,  // CALORIES, PROTEIN, etc
  val value: Float,
  val percentage: Float
)

data class TrendEntry(
  val week: Int,
  val avgCalories: Float,
  val avgProtein: Float,
  val direction: String  // UP, DOWN, STABLE
)
```

### 9.2 Endpoints

```http
GET /api/v1/nutrition/daily
Description: Resumo diário de macros consumidas
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - date: 2025-09-01 (default: hoje)

Response 200:
{
  "data": {...}  // DailyMacroSummaryResponse
}

Example Response:
{
  "data": {
    "userId": "uuid-123",
    "date": "2025-09-01",
    "consumed": {
      "calories": 2150,
      "protein": 95,
      "carbs": 280,
      "fat": 55,
      "fiber": 22,
      "sodium": 1800
    },
    "target": {
      "calories": 2500,
      "protein": 150,
      "carbs": 250,
      "fat": 70,
      "fiber": 25,
      "sodium": 2000
    },
    "remaining": {
      "calories": 350,
      "protein": 55,
      "carbs": -30,  // excedeu
      "fat": 15,
      "fiber": 3,
      "sodium": 200
    },
    "percentage": {
      "calories": 86,
      "protein": 63,
      "carbs": 112,  // acima do alvo
      "fat": 79,
      "fiber": 88,
      "sodium": 90
    },
    "meals": [
      {"mealId": "...", "name": "Frango com arroz", "consumedAt": "..."}
    ]
  }
}
```

```http
PUT /api/v1/nutrition/targets
Description: Atualizar metas nutricionais do usuário
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "calories": 3000,
  "protein": 180,
  "carbs": 300,
  "fat": 100,
  "fiber": 35,
  "sodium": 2000
}

Response 200:
{
  "data": {...}  // NutritionTarget atualizado
}
```

```http
GET /api/v1/nutrition/targets
Description: Obter metas nutricionais
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // NutritionTarget
}
```

```http
GET /api/v1/nutrition/report/{period}
Description: Relatório nutricional detalhado
Headers:
  Authorization: Bearer {accessToken}

Path:
  - period: WEEK, MONTH, CUSTOM

Query Parameters (se period=CUSTOM):
  - startDate: 2025-08-01
  - endDate: 2025-09-01

Response 200:
{
  "data": {...}  // NutritionReportResponse
}
```

```http
POST /api/v1/nutrition/alerts/subscribe
Description: Configurar alertas nutricionais
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "type": "CALORIE_OVERAGE",  // CALORIE_OVERAGE, LOW_PROTEIN, HIGH_SODIUM
  "enabled": true,
  "threshold": 10  // % de variação
}

Response 201:
{
  "data": {
    "alertId": "uuid",
    "type": "CALORIE_OVERAGE",
    "enabled": true,
    "threshold": 10
  }
}
```

```http
GET /api/v1/nutrition/insights
Description: Insights IA baseados em dados históricos
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - days: 30 (análise últimos 30 dias)

Response 200:
{
  "data": {
    "insights": [
      "Você vem consumindo 15% de carboidratos acima da meta",
      "Proteína tem se mantido consistente nos últimos 15 dias",
      "Melhor dia foi 05/09 com 2450 calorias"
    ],
    "recommendations": [
      "Aumentar proteína em 20g por dia para ganho de massa",
      "Reduzir carboidratos noite (pico aos 19h)"
    ]
  }
}
```

---

## 10. Tracking Service

**Porta**: 8087 (Private)  
**Função**: Dashboard e histórico de progresso, gráficos, metas atingidas  
**Database**: MongoDB (user_analytics collection)  
**Eventos Consumidos**: MealConsumed, UserDeleted

### 10.1 DTOs

```kotlin
data class DashboardResponse(
  val today: TodayDailyCard,
  val progressChart: ProgressChartData,
  val streakInfo: StreakInfo,
  val weekSummary: WeekSummaryCard,
  val upcomingGoals: List<GoalCard>
)

data class TodayDailyCard(
  val macros: MacroNutrients,
  val mealsLogged: Int,
  val percentage: MacroPercentage
)

data class ProgressChartData(
  val points: List<ChartPoint>,  // últimos 30 dias
  val trend: String              // UP, DOWN, STABLE
)

data class ChartPoint(
  val date: LocalDate,
  val calories: Float,
  val protein: Float,
  val weekAverage: Float?  // média móvel
)

data class StreakInfo(
  val currentStreak: Int,  // dias consecutivos loggando
  val longestStreak: Int,
  val lastLogDate: LocalDate
)

data class WeekSummaryCard(
  val avgCalories: Float,
  val avgProtein: Float,
  val logsPerDay: Float,  // média de logs/dia
  val adherence: Float    // 0-100% variação vs meta
)

data class GoalCard(
  val goalId: UUID,
  val description: String,
  val targetDate: LocalDate,
  val progress: Float  // 0-100%
)

data class HistoryResponse(
  val entries: List<HistoryEntry>,
  "pagination": {...}
)

data class HistoryEntry(
  val date: LocalDate,
  val caloriesConsumed: Float,
  val mealsLogged: Int,
  val adherence: Float  // % vs meta
)
```

### 10.2 Endpoints

```http
GET /api/v1/tracking/dashboard
Description: Dashboard principal do usuário
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // DashboardResponse
}

Example:
{
  "data": {
    "today": {
      "macros": {"calories": 2150, "protein": 95, ...},
      "mealsLogged": 3,
      "percentage": {"calories": 86, ...}
    },
    "progressChart": {
      "points": [
        {"date": "2025-08-15", "calories": 2300, "protein": 140, "weekAverage": 2280},
        {"date": "2025-08-16", "calories": 2450, "protein": 155, "weekAverage": 2310}
      ],
      "trend": "UP"
    },
    "streakInfo": {
      "currentStreak": 15,
      "longestStreak": 45,
      "lastLogDate": "2025-09-01"
    },
    "weekSummary": {
      "avgCalories": 2300,
      "avgProtein": 145,
      "logsPerDay": 3.1,
      "adherence": 92
    },
    "upcomingGoals": [
      {"goalId": "...", "description": "Atingir 150g de proteína", "targetDate": "2025-10-01", "progress": 95}
    ]
  }
}
```

```http
GET /api/v1/tracking/history
Description: Histórico de consumo por período
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - startDate: 2025-08-01
  - endDate: 2025-09-01
  - page: 1

Response 200:
{
  "data": {
    "entries": [
      {"date": "2025-08-01", "caloriesConsumed": 2300, "mealsLogged": 3, "adherence": 92},
      {"date": "2025-08-02", "caloriesConsumed": 2100, "mealsLogged": 3, "adherence": 84}
    ],
    "pagination": {...}
  }
}
```

```http
GET /api/v1/tracking/chart-data
Description: Dados para gráficos (últimos 30 dias)
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - metric: CALORIES, PROTEIN (qual métrica plotar)
  - days: 30

Response 200:
{
  "data": {
    "points": [...],  // ChartPoint[]
    "trend": "UP",
    "average": 2300,
    "peak": 2650,
    "low": 1900
  }
}
```

```http
POST /api/v1/tracking/goals
Description: Criar meta de tracking
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "description": "Atingir 150g de proteína por dia",
  "targetDate": "2025-10-01",
  "metricType": "PROTEIN",  // CALORIES, PROTEIN, FIBER
  "targetValue": 150
}

Response 201:
{
  "data": {...}  // GoalCard
}
```

```http
GET /api/v1/tracking/goals
Description: Listar metas do usuário
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": [{...}, {...}]
}
```

---

## 11. Notification Service

**Porta**: 8088 (Private)  
**Função**: Gerenciar notificações (alertas, dicas, lembretes)  
**Database**: PostgreSQL (notifications table)  
**Eventos Consumidos**: MealConsumed, UserCreated, MacroAlertTriggered  
**Integrações**: Firebase Cloud Messaging (FCM), Email (SendGrid)

### 11.1 DTOs

```kotlin
data class NotificationRequest(
  val userId: UUID,
  val type: String,              // MEAL_REMINDER, GOAL_REACHED, TIP, ALERT
  val title: String,
  val body: String,
  val actionUrl: String?,        // deep link
  val sendVia: List<String>      // PUSH, EMAIL, IN_APP
)

data class NotificationResponse(
  val notificationId: UUID,
  val userId: UUID,
  val type: String,
  val title: String,
  val body: String,
  val read: Boolean,
  val createdAt: Instant,
  val readAt: Instant?
)

data class UserNotificationPreferences(
  val pushEnabled: Boolean = true,
  val emailEnabled: Boolean = true,
  val mealRemindersEnabled: Boolean = true,
  val goalAlertsEnabled: Boolean = true,
  val tipsEnabled: Boolean = true,
  val preferredTimes: List<String>  // "09:00", "12:00", "19:00"
)
```

### 11.2 Endpoints

```http
GET /api/v1/notifications
Description: Listar notificações do usuário
Headers:
  Authorization: Bearer {accessToken}

Query Parameters:
  - unreadOnly: true
  - type: MEAL_REMINDER
  - page: 1

Response 200:
{
  "data": [{...}, {...}],
  "pagination": {
    "unreadCount": 5,
    ...
  }
}
```

```http
PUT /api/v1/notifications/{notificationId}/read
Description: Marcar notificação como lida
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // NotificationResponse com read=true
}
```

```http
PUT /api/v1/notifications/read-all
Description: Marcar todas notificações como lidas
Headers:
  Authorization: Bearer {accessToken}

Response 204: (No Content)
```

```http
DELETE /api/v1/notifications/{notificationId}
Description: Deletar notificação
Headers:
  Authorization: Bearer {accessToken}

Response 204: (No Content)
```

```http
GET /api/v1/notifications/preferences
Description: Obter preferências de notificação
Headers:
  Authorization: Bearer {accessToken}

Response 200:
{
  "data": {...}  // UserNotificationPreferences
}
```

```http
PUT /api/v1/notifications/preferences
Description: Atualizar preferências
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "pushEnabled": true,
  "emailEnabled": false,
  "preferredTimes": ["08:00", "12:00", "19:00"]
}

Response 200:
{
  "data": {...}  // UserNotificationPreferences
}
```

**Eventos Internos Processados**:

```
Eventos RabbitMQ consumidos:
  - MealConsumed: Verifica se atingiu meta, envia notificação de sucesso
  - UserCreated: Envia welcome email
  - MacroAlertTriggered: Converte para notificação baseada em tipo de alerta
```

---

## 12. AI Service

**Porta**: 8089 (Private)  
**Função**: Inteligência artificial para sugestões, análises e meal planning  
**APIs Externas**: OpenAI GPT-4o, Google Gemini (fallback), Nutritionix, USDA  
**Padrão**: Chain-of-thought para decisões complexas

### 12.1 DTOs

```kotlin
data class SuggestMealRequest(
  val userId: UUID,
  val constraints: MealConstraints?,
  val context: String?  // "estou cansado", "quero ganhar massa"
)

data class MealConstraints(
  val targetCalories: Int?,
  val dietaryRestrictions: List<String>?,
  val avoidFoods: List<String>?,
  val preferredCuisines: List<String>?,
  val prepTimeMax: Int?  // minutos
)

data class SuggestMealResponse(
  val mealSuggestionId: UUID,
  val meals: List<MealSuggestion>,
  val reasoning: String,  // explicação IA
  val confidence: Float   // 0-100%
)

data class MealSuggestion(
  val name: String,
  val description: String,
  val estimatedMacros: MacroNutrients,
  val recipe: String,
  val ingredients: List<IngredientSuggestion>,
  val prepTime: Int
)

data class IngredientSuggestion(
  val foodName: String,
  val quantity: Double,
  val unit: String,
  val nutritionixId: String?  // para rápido lookup se não existir local
)

data class AnalyzeProgressRequest(
  val userId: UUID,
  val days: Int = 30
)

data class AnalyzeProgressResponse(
  val summary: String,
  val strengths: List<String>,
  val improvements: List<String>,
  val recommendations: List<String>,
  val generatedAt: Instant
)

data class FoodAnalysisRequest(
  val foodName: String,
  val quantity: Double,
  val unit: String
)

data class FoodAnalysisResponse(
  val foodId: UUID?,  // null se não encontrar
  val name: String,
  val macros: MacroNutrients,
  val source: String,  // LOCAL, NUTRITIONIX, OPENAI
  val confidence: Float,
  val alternativeMatches: List<AlternativeFood>?
)

data class AlternativeFood(
  val name: String,
  val macros: MacroNutrients,
  val similarity: Float  // 0-100%
)
```

### 12.2 Endpoints

```http
POST /api/v1/ai/suggest-meal
Description: Sugerir refeição com base em constraints e contexto
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "constraints": {
    "targetCalories": 500,
    "dietaryRestrictions": ["VEGETARIAN"],
    "prepTimeMax": 20
  },
  "context": "quero ganhar massa mas com rapido preparo"
}

Response 202: (Accepted - pode demorar 30-60s)
{
  "data": {
    "suggestionId": "sugg-xyz-123",
    "status": "PROCESSING"
  }
}

Polling para resultado:
GET /api/v1/ai/suggest-meal/{suggestionId}

Response 200 (quando pronto):
{
  "data": {
    "status": "COMPLETED",
    "meals": [
      {
        "name": "Ovos com aveia e amendoim",
        "description": "3 ovos + 50g aveia + 30g pasta amendoim",
        "estimatedMacros": {"calories": 520, "protein": 25, "carbs": 35, "fat": 28},
        "recipe": "Refogue os ovos...",
        "ingredients": [
          {"foodName": "Ovos", "quantity": 3, "unit": "un"},
          {"foodName": "Aveia em flocos", "quantity": 50, "unit": "g"},
          {"foodName": "Pasta de amendoim", "quantity": 30, "unit": "g"}
        ],
        "prepTime": 10
      }
    ],
    "reasoning": "Combinação clássica que fornece proteína, carboidratos e gorduras para ganho de massa",
    "confidence": 95
  }
}

Errors:
  - 429: Rate limit IA (OPENAI_RATE_LIMIT)
  - 503: OpenAI unavailable, usando fallback Gemini
```

```http
POST /api/v1/ai/analyze-food
Description: Analisar alimento por descrição (não precisa estar cadastrado)
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "foodName": "peito de frango grelhado",
  "quantity": 200,
  "unit": "g"
}

Response 200:
{
  "data": {
    "foodId": "uuid-123",  // encontrou
    "name": "Peito de frango grelhado",
    "macros": {...},
    "source": "LOCAL",
    "confidence": 100,
    "alternativeMatches": null
  }
}

Ou (se não achar):
{
  "data": {
    "foodId": null,
    "name": "Peito de frango grelhado",
    "macros": {"calories": 330, "protein": 62, "carbs": 0, "fat": 7},
    "source": "OPENAI",
    "confidence": 92,
    "alternativeMatches": [
      {"name": "Peito de frango assado", "macros": {...}, "similarity": 98},
      {"name": "Peito de frango cozido", "macros": {...}, "similarity": 96}
    ]
  }
}

Errors:
  - 503: OpenAI + Nutritionix offline (usar defaults ou cache)
```

```http
POST /api/v1/ai/analyze-progress
Description: Análise IA do progresso (dinâmica, insights personalizados)
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "days": 30
}

Response 202: (Accepted)
{
  "data": {
    "analysisId": "analys-xyz",
    "status": "PROCESSING"
  }
}

Polling:
GET /api/v1/ai/analyze-progress/{analysisId}

Response 200 (quando pronto):
{
  "data": {
    "status": "COMPLETED",
    "summary": "Em 30 dias você manteve consistência de 85% com a meta calórica, com variação média de +/- 150 calorias",
    "strengths": [
      "Proteína: Mantém acima de 150g em 90% dos dias",
      "Consistência: Apenas 2 dias de pausa em logging",
      "Adesão: Cumpirou meta em 25 dos 30 dias"
    ],
    "improvements": [
      "Carboidratos: Picos acima de 400g às terças-feiras",
      "Sódio: Média 2400mg (10% acima da recomendação)",
      "Variação: 200+ calorias de oscilação semanal"
    ],
    "recommendations": [
      "Manter proteína em 150-160g (muito bom!)",
      "Reduzir sal em alimentos processados (ready-to-eat)",
      "Aumentar consistência de carboidratos (evitar picos terça)"
    ],
    "generatedAt": "2025-09-01T14:30:00Z"
  }
}
```

```http
POST /api/v1/ai/suggest-meal-plan
Description: Sugerir plano de refeições com IA
Headers:
  Authorization: Bearer {accessToken}

Request:
{
  "goalType": "GAIN_MUSCLE",  // GAIN_MUSCLE, LOSE_WEIGHT, MAINTENANCE
  "targetCalories": 3000,
  "dietaryRestrictions": [],
  "daysCount": 7
}

Response 202: (Accepted)
{
  "data": {
    "planId": "plan-xyz",
    "status": "PROCESSING"
  }
}

Polling:
GET /api/v1/ai/suggest-meal-plan/{planId}

Response 200:
{
  "data": {
    "status": "COMPLETED",
    "suggestedPlan": {
      "mealPlanId": "uuid",
      "name": "Plano de Ganho de Massa - 3000 cal/dia",
      "meals": [
        // breakfast, lunch, dinner, snacks para cada dia
      ]
    }
  }
}
```

---

## 13. Contatos e SLAs

### 13.1 Responsáveis por Serviço

| Serviço | Owner | Backup | Slack |
|---------|-------|--------|-------|
| API Gateway | @backend-team | @devops | #api-gateway |
| Auth | @security-team | @backend-team | #auth-service |
| User | @backend-team | @platform | #user-service |
| Meal Plan | @nutrition-team | @backend-team | #meal-plan |
| Meal | @backend-team | @nutrition-team | #meal-service |
| Food | @nutrition-team | @qa-team | #food-service |
| Nutrition | @nutrition-team | @backend-team | #nutrition-service |
| Tracking | @frontend-team | @analytics | #tracking-service |
| Notification | @backend-team | @devops | #notification |
| AI | @ml-team | @backend-team | #ai-service |

### 13.2 SLAs (Service Level Agreements)

```
Aviability:  99.5% (máx 3.6h downtime/mês)
Response Time P95: 500ms (critical path), 1000ms (non-critical)
Error Rate: < 0.5% (4xx+5xx / total requests)
Recovery Time (RTO): < 1 hora para falha crítica
Recovery Point (RPO): < 5 minutos (dados perdidos máximo)
```

### 13.3 Oncall Rotation

```
Escalation escalation chain em caso de prod issue:
  1. Service owner (15 min response)
  2. Backup owner (30 min response)  
  3. Tech lead / Platform team (30 min response)

Crítico (P1): Serviço completamente down, > 5% users impactados
Alto (P2): Degradação funcional, <5% users impactados
Médio (P3): Erro não-crítico, workaround disponível
Baixo (P4): Documentação, feature request
```

---

## 14. Próximas Etapas

1. ✅ **Fase 1.5 Completa**: Especificações de microsserviços finalizadas
2. ⏳ **Fase 1.6**: Data flows com sequence diagrams (mermaid)
3. ⏳ **Fase 1.7**: Messaging strategy (RabbitMQ exchanges/queues)
4. ⏳ **Fase 1.8**: Security & authentication (OAuth2, JWT, RBAC)
5. ⏳ **Fase 1.9-1.11**: RFCs (macro sync, AI pipeline, calculation)
6. ⏳ **Fase 1.12**: Product roadmap (Gantt chart)
7. ⏳ **Fase 1.13**: GitHub project board setup
8. ⏳ **Fase 1.14**: Mobile tech decision validation

---

**Fim do documento - 05-MICROSERVICES.md**  
**Total de linhas**: 1.247  
**Data de criação**: 2025-08-01  
**Status**: Pronto para commit
