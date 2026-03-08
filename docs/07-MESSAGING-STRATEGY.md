# 07-MESSAGING-STRATEGY.md
## Estratégia de Mensageria - TrAIner Hub

**Versão**: 1.0  
**Data**: 2025-08-01  
**Status**: Final - Fase 1.7  
**Propósito**: Definir topologia RabbitMQ, event contracts, retry policies e observabilidade

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Conceitos Fundamentais](#conceitos-fundamentais)
3. [Topologia de Exchanges](#topologia-de-exchanges)
4. [Definição de Filas](#definição-de-filas)
5. [Event Contracts](#event-contracts)
6. [Retry & DLQ Strategy](#retry--dlq-strategy)
7. [Garantias de Entrega](#garantias-de-entrega)
8. [Configuração de Produção](#configuração-de-produção)
9. [Monitoramento](#monitoramento)
10. [Troubleshooting](#troubleshooting)

---

## 1. Visão Geral

### 1.1 Princípios

RabbitMQ é o message broker centrale para TrAIner Hub com:
- **Topic Exchange**: Roteamento por padrão (wildcard)
- **Durable Queues**: Persistência em disco (survive restarts)
- **Ack Manual**: Processador reconhece após sucesso
- **DLX (Dead Letter Exchange)**: Falhas direcionadas para análise
- **TTL**: Mensagens expiram após período configurável

### 1.2 Eventos Principais

```
User Domain:
  - UserCreated
  - UserUpdated
  - UserDeleted
  - UserLoggedIn

Meal Planning Domain:
  - MealPlanCreated
  - MealPlanUpdated
  - MealPlanDeleted

Meal Consumption Domain:
  - MealConsumed
  - MealUpdated
  - FoodCreated
  - FoodUpdated

Nutrition Domain:
  - MacroCalculated
  - DailyGoalReached
  - MacroAlertTriggered
  - ProgressAnalyzed

Notification Domain:
  - NotificationSent
  - EmailQueued
  - PushSent
```

### 1.3 Padrão de Evento Global

```json
{
  "eventId": "evt-{uuid}-{timestamp}",
  "eventType": "user.created",
  "version": 1,
  "aggregateId": "user-uuid-123",
  "aggregateType": "User",
  "timestamp": "2025-08-01T10:30:45.123Z",
  "correlationId": "req-1693472445-abc123",
  "causationId": "req-1693472445-abc123",
  "source": "auth-service",
  "data": {
    // payload específico do evento
  },
  "metadata": {
    "userId": "uuid-123",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

---

## 2. Conceitos Fundamentais

### 2.1 Terminologia RabbitMQ

| Conceito | Descrição |
|----------|-----------|
| **Exchange** | Roteador de mensagens (recebe e distribui) |
| **Queue** | Buffer de mensagens (espera pelo consumer) |
| **Binding** | Ligação entre exchange e queue (com routing key) |
| **Routing Key** | Chave de roteamento (ex: `user.#`) |
| **Consumer** | Serviço que consome mensagens da fila |
| **Publisher** | Serviço que publica eventos |
| **Ack (Acknowledgment)** | Confirmação de processamento |
| **NACK** | Negação (falha de processamento) |
| **DLX** | Exchange para dead letters (mensagens não entregáveis) |

### 2.2 Exchange Types

**Topic Exchange** (usado em TrAIner Hub):
- Roteamento por pattern matching
- Exemplo: binding key `user.*` casa com routing key `user.created`
- Curinga `*` = uma palavra, `#` = zero ou mais palavras

```
Publisher envia em topic "user.created"
  ↓
Topic Exchange "events"
  ├─ Queue "user-service-queue" (bind: user.*)
  │   └─ consome user.created, user.updated, user.deleted
  ├─ Queue "notification-queue" (bind: user.created,user.updated)
  │   └─ consome apenas user.created e user.updated
  └─ Queue "audit-queue" (bind: #)
      └─ consome TODOS os eventos
```

---

## 3. Topologia de Exchanges

### 3.1 Exchange Principal

```
Exchange Name: "trainer_hub.events"
Type: Topic
Durable: YES
Auto-delete: NO
Arguments:
  - alternative-exchange: trainer_hub.dlx (para dead letters)
```

### 3.2 Exchanges Auxiliares

```
1. "trainer_hub.dlx" (Dead Letter Exchange)
   Type: Topic
   Durable: YES
   Propósito: Redirecionar mensagens que falham
   
2. "trainer_hub.retry" (Retry Exchange)
   Type: Topic
   Durable: YES
   Propósito: Reenviar mensagens com delay (retries)
   
3. "trainer_hub.notifications" (Notifications Exchange)
   Type: Direct
   Durable: YES
   Propósito: Notificações push/email (urgentes, direct routing)
```

### 3.3 Binding Topology Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLISHERS                               │
│  Auth, User, Meal Plan, Meal, Food, Nutrition, Tracking    │
└──────────────────────┬──────────────────────────────────────┘
                       │ publish event
                       ▼
    ┌──────────────────────────────────┐
    │  trainer_hub.events (Topic)      │
    │  - alternative-exchange: dlx     │
    └──────────────────────────────────┘
            │
        ┌───┼───────────────────────┬───────────────────────┐
        │   │                       │                       │
        │   │ (routing key pattern) │                       │
    user.*" "" user.created,       (All: #)
        │   user.updated"        │                       │
        │   │                       │                       │
        ▼   ▼                       ▼                       ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
    │   user     │  │notification │  │   audit    │  │  tracking  │
    │  .queue    │  │   .queue    │  │   .queue   │  │   .queue   │
    └────────────┘  └────────────┘  └────────────┘  └────────────┘
        │                │                │                │
        ↓                ↓                ↓                ↓
   User Service  Notification Svc   MongoDB              Tracking Svc
```

---

## 4. Definição de Filas

### 4.1 User Service Queue

```
Queue Name: "trainer_hub.user.events"
Durable: YES
Exclusive: NO
Auto-delete: NO
Arguments:
  x-dead-letter-exchange: "trainer_hub.dlx"
  x-message-ttl: 86400000  (24 horas)
  x-max-retries: 3

Bindings:
  - Exchange: trainer_hub.events
    Routing Key: user.*
  - Exchange: trainer_hub.events
    Routing Key: nutrition.daily_goal_reached
    (User service subscriber para goal notifications)

Consumers:
  - user-service instance 1 (port 8082)
  - user-service instance 2 (port 8082, replica)
  
Prefetch: 10 (quantas msgs carregar de uma vez)
```

### 4.2 Meal Plan Service Queue

```
Queue Name: "trainer_hub.meal-plan.events"
Durable: YES
Arguments:
  x-dead-letter-exchange: "trainer_hub.dlx"
  x-message-ttl: 86400000
  x-max-retries: 3

Bindings:
  - Exchange: trainer_hub.events
    Routing Key: meal.plan.*
  - Exchange: trainer_hub.events
    Routing Key: food.created
    Routing Key: food.updated

Consumers:
  - meal-plan-service (1 instância suficiente por enquanto)

Prefetch: 5
```

### 4.3 Meal Service Queue

```
Queue Name: "trainer_hub.meal.events"
Durable: YES
Arguments:
  x-dead-letter-exchange: "trainer_hub.dlx"
  x-message-ttl: 86400000
  x-max-retries: 3

Bindings:
  - Exchange: trainer_hub.events
    Routing Key: meal.#
  - Exchange: trainer_hub.events
    Routing Key: food.*

Prefetch: 10
```

### 4.4 Nutrition Service Queue

```
Queue Name: "trainer_hub.nutrition.events"
Durable: YES
Arguments:
  x-dead-letter-exchange: "trainer_hub.dlx"
  x-message-ttl: 86400000
  x-max-retries: 3

Bindings:
  - Exchange: trainer_hub.events
    Routing Key: meal.consumed
  - Exchange: trainer_hub.events
    Routing Key: user.created
    Routing Key: user.updated

Prefetch: 20 (nutritionServiceは muitas cálculos)
```

### 4.5 Tracking Service Queue

```
Queue Name: "trainer_hub.tracking.events"
Durable: YES
Arguments:
  x-dead-letter-exchange: "trainer_hub.dlx"
  x-message-ttl: 604800000  (7 dias para analytics)

Bindings:
  - Exchange: trainer_hub.events
    Routing Key: meal.consumed
  - Exchange: trainer_hub.events
    Routing Key: nutrition.macro_alert_triggered
  - Exchange: trainer_hub.events
    Routing Key: user.created
    Routing Key: user.deleted

Prefetch: 30 (event-driven analytics)
```

### 4.6 Notification Service Queue

```
Queue Name: "trainer_hub.notification.events"
Durable: YES
Arguments:
  x-dead-letter-exchange: "trainer_hub.dlx"
  x-message-ttl: 3600000  (1 hora - notifs são urgentes)

Bindings (multiple patterns):
  - Exchange: trainer_hub.events
    Routing Key: meal.consumed
  - Exchange: trainer_hub.events
    Routing Key: nutrition.daily_goal_reached
  - Exchange: trainer_hub.events
    Routing Key: nutrition.macro_alert_triggered
  - Exchange: trainer_hub.events
    Routing Key: user.created

Prefetch: 5 (process notifications quickly, high throughput)
```

### 4.7 AI Service Queue

```
Queue Name: "trainer_hub.ai.events"
Durable: YES
Arguments:
  x-dead-letter-exchange: "trainer_hub.dlx"
  x-message-ttl: 86400000  (24 horas)

Bindings:
  - Exchange: trainer_hub.events
    Routing Key: user.created
  - Exchange: trainer_hub.events
    Routing Key: meal.plan.suggest_requested

Prefetch: 1 (AI jobs são pesados, processar um por vez)
```

### 4.8 Audit Queue (MongoDB logging)

```
Queue Name: "trainer_hub.audit.events"
Durable: YES
Arguments:
  x-dead-letter-exchange: "trainer_hub.dlx"
  x-message-ttl: 7776000000  (90 dias)

Bindings:
  - Exchange: trainer_hub.events
    Routing Key: #  (TODOS os eventos)

Prefetch: 50 (just log, not CPU-intensive)

Consumer: audit-service (persists to MongoDB)
```

---

## 5. Event Contracts

### 5.1 UserCreated Event

```json
{
  "eventId": "evt-uuid-1693472445",
  "eventType": "user.created",
  "version": 1,
  "aggregateId": "user-uuid-123",
  "aggregateType": "User",
  "timestamp": "2025-08-01T10:30:45.123Z",
  "correlationId": "req-1693472445-abc123",
  "causationId": "req-1693472445-abc123",
  "source": "auth-service",
  "data": {
    "userId": "user-uuid-123",
    "email": "gabriel@example.com",
    "name": "Gabriel Silva",
    "birthDate": "2000-05-15",  // ISO 8601
    "gender": "M"
  },
  "metadata": {
    "userId": "user-uuid-123",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0"
  }
}
```

**Routing Key**: `user.created`

**Subscribers**:
- User Service: Cria user_profile e preferences defaults
- Notification Service: Envia welcome email
- Audit Service: Registra em MongoDB

---

### 5.2 MealConsumed Event

```json
{
  "eventId": "evt-uuid-1693472560",
  "eventType": "meal.consumed",
  "version": 1,
  "aggregateId": "consumed-meal-uuid-456",
  "aggregateType": "MealConsumed",
  "timestamp": "2025-08-01T12:30:00.000Z",
  "correlationId": "req-1693472450-def456",
  "causationId": "req-1693472450-def456",
  "source": "meal-service",
  "data": {
    "consumedMealId": "consumed-meal-uuid-456",
    "userId": "user-uuid-123",
    "mealId": "meal-uuid-789",
    "consumedAt": "2025-08-01T12:30:00Z",
    "quantity": 1.0,
    "macros": {
      "calories": 550,
      "protein": 30,
      "carbs": 45,
      "fat": 15,
      "fiber": 8,
      "sodium": 400
    }
  },
  "metadata": {
    "userId": "user-uuid-123"
  }
}
```

**Routing Key**: `meal.consumed`

**Subscribers**:
- Nutrition Service: Atualiza daily_consumed_macros, checa se atingiu meta
- Tracking Service: Incrementa meals_logged hoje, mantém streak
- Notification Service: Analisa se merece notificação de sucesso
- Audit Service: Log

---

### 5.3 MacroAlertTriggered Event

```json
{
  "eventId": "evt-uuid-1693472600",
  "eventType": "nutrition.macro_alert_triggered",
  "version": 1,
  "aggregateId": "alert-uuid-999",
  "aggregateType": "MacroAlert",
  "timestamp": "2025-08-01T14:45:00.000Z",
  "correlationId": "req-1693472500-ghi789",
  "causationId": "evt-uuid-1693472560",  // triggered by MealConsumed
  "source": "nutrition-service",
  "data": {
    "alertId": "alert-uuid-999",
    "userId": "user-uuid-123",
    "alertType": "CALORIE_OVERAGE",  // CALORIE_OVERAGE, LOW_PROTEIN, HIGH_SODIUM
    "severity": "WARNING",  // INFO, WARNING, CRITICAL
    "message": "Você ultrapassou sua meta calórica em 150 calorias",
    "metric": "calories",
    "threshold": 2500,
    "actual": 2650,
    "percentage": 106,
    "suggestedAction": "Reduza próximas refeições em 150 cal"
  },
  "metadata": {
    "userId": "user-uuid-123"
  }
}
```

**Routing Key**: `nutrition.macro_alert_triggered`

**Subscribers**:
- Notification Service: Envia push/email alertando usuário
- Audit Service: Log

---

### 5.4 DailyGoalReached Event

```json
{
  "eventId": "evt-uuid-1693472700",
  "eventType": "nutrition.daily_goal_reached",
  "version": 1,
  "aggregateId": "daily-summary-uuid",
  "aggregateType": "DailySummary",
  "timestamp": "2025-08-01T20:15:00.000Z",
  "correlationId": "req-1693472620-jkl012",
  "causationId": "evt-uuid-1693472560",
  "source": "nutrition-service",
  "data": {
    "userId": "user-uuid-123",
    "date": "2025-08-01",
    "goalType": "CALORIE",  // CALORIE, PROTEIN, MACRO_BALANCE
    "consumed": 2485,
    "target": 2500,
    "percentage": 99.4,
    "achievement": "COMPLETED"  // COMPLETED, EXCEEDED, MISSED
  },
  "metadata": {
    "userId": "user-uuid-123"
  }
}
```

**Routing Key**: `nutrition.daily_goal_reached`

**Subscribers**:
- Notification Service: Congratulations message
- Tracking Service: Log streak achievement
- User Service: Unlock badges/achievements (future)

---

### 5.5 FoodCreated Event

```json
{
  "eventId": "evt-uuid-1693472800",
  "eventType": "food.created",
  "version": 1,
  "aggregateId": "food-uuid-111",
  "aggregateType": "Food",
  "timestamp": "2025-08-01T15:00:00.000Z",
  "correlationId": "req-1693472700-mno345",
  "causationId": "req-1693472700-mno345",
  "source": "food-service",
  "data": {
    "foodId": "food-uuid-111",
    "name": "Peito de frango grelhado",
    "category": "PROTEIN",
    "portion": "100g",
    "macros": {
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "fiber": 0,
      "sodium": 75
    },
    "source": "MANUAL",  // MANUAL, NUTRITIONIX, USDA, OPENAI
    "verified": false
  },
  "metadata": {
    "userId": "user-uuid-123"  // se user-created, null se global
  }
}
```

**Routing Key**: `food.created`

**Subscribers**:
- Meal Plan Service: Enrich suggestions
- Notification Service: Notify if new food matches user preferences
- Audit Service: Log

---

## 6. Retry & DLQ Strategy

### 6.1 Retry Mechanism

**Padrão**: Exponential backoff com máximo de 3 retries

```
Tentativa 1: Imediato
Falha → Retry 1: 1 segundo de delay
Falha → Retry 2: 4 segundos de delay (2^2)
Falha → Retry 3: 16 segundos de delay (2^4)
Final Falha → DLX (Dead Letter Exchange)
```

**Implementação**:

```yaml
# application.yml - Meal Service
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true
          max-attempts: 4  # 1 original + 3 retries
          initial-interval: 1000
          multiplier: 4
          max-interval: 30000
        default-requeue-rejected: false  # não requeue indefinidamente
```

### 6.2 Dead Letter Queue (DLQ)

```
Fluxo:
  Publisher → trainer_hub.events
    ↓
  Consumer tries 4 times → All fail
    ↓
  DLX (trainer_hub.dlx) → Routing key preserved
    ↓
  trainer_hub.dlx.queue
    ↓
  Manual review + decision
```

**DLQ Configuration**:

```
Queue Name: "trainer_hub.dlx.queue"
Durable: YES
TTL: 604800000  (7 dias - retenção para análise)

Binding:
  - Exchange: trainer_hub.dlx
    Routing Key: #  (capture ALL dead letters)

Consumer: dlq-processor-service
  - Lê mensagem
  - Registra em MongoDB para analysis
  - Envia alert para ops team
  - Opções: retry manual, discard, publish fix
```

### 6.3 Exemplo de Tratamento em Código

```kotlin
// Meal Service - Spring RabbitMQ Listener

@RabbitListener(queues = ["trainer_hub.meal.events"])
@Transactional
fun handleMealEvent(
    event: MealEvent,
    message: Message,
    channel: Channel
) {
    try {
        // Processo o evento
        mealService.processMealEvent(event)
        
        // Se sucesso, fazer acknowledge automático
        // (default com acknowledge: MANUAL)
        channel.basicAck(message.messageProperties.deliveryTag, false)
        
        log.info("Meal event processed: ${event.eventId}")
    } catch (e: RecoverableException) {
        // Erro recuperável → NACK (vai pro retry)
        channel.basicNack(message.messageProperties.deliveryTag, false, true)
        log.warn("Recoverable error, nacking: ${e.message}")
    } catch (e: Exception) {
        // Erro não-recuperável → NACK sem requeue (vai pro DLX)
        channel.basicNack(message.messageProperties.deliveryTag, false, false)
        log.error("Non-recoverable error, sending to DLX: ${e.message}")
    }
}

// DLQ Handler
@RabbitListener(queues = ["trainer_hub.dlx.queue"])
fun handleDeadLetter(
    message: Message,
    @Header(name = "x-death") xDeathHeader: List<Map<String, ?>?>,
    channel: Channel
) {
    try {
        val body = String(message.body)
        log.error("Dead letter received: $body")
        log.error("Death history: $xDeathHeader")
        
        // Registrar em MongoDB
        dlqService.logDeadLetter(body, xDeathHeader)
        
        // Alertar ops
        alertingService.sendAlert(
            severity = "HIGH",
            message = "Message in DLQ: $body",
            channel = "slack"
        )
        
        channel.basicAck(message.messageProperties.deliveryTag, false)
    } catch (e: Exception) {
        log.error("Error processing DLQ message", e)
        // Acknowledge mesmo com erro para não ficar em loop
        channel.basicAck(message.messageProperties.deliveryTag, false)
    }
}
```

---

## 7. Garantias de Entrega

### 7.1 Durabilidade

```
Publisher → Persistent message
  ↓
RabbitMQ → Escreve em disco imediatamente
  ↓
Consumer → Processa
  ↓
Ack → Remove de fila/disco
```

**Garantia**: Se RabbitMQ cair entre publicação e ack, mensagem é re-entregue quando cair online.

### 7.2 At-Least-Once Semantics

- **Não suportamos** exactly-once (é muito caro em RabbitMQ)
- Usamos **idempotência** para tolerar duplicatas

```kotlin
// Event processor - idempotent
@RabbitListener(queues = ["trainer_hub.nutrition.events"])
fun handleMealConsumed(event: MealEvent) {
    // Checar se já processado
    val processed = idempotencyService.isProcessed(event.eventId)
    
    if (processed) {
        log.info("Event already processed: ${event.eventId}, skipping")
        return  // Skip duplicata
    }
    
    // Processar
    nutritionService.updateDaily(event)
    
    // Marcar como processado (atomic)
    idempotencyService.markProcessed(event.eventId)
}

// Idempotency table (PostgreSQL)
CREATE TABLE idempotent_events (
    event_id UUID PRIMARY KEY,
    service_name VARCHAR(100),
    processed_at TIMESTAMP DEFAULT NOW()
);
```

### 7.3 Ordering Guarantee

Dentro de uma **fila individual**, mensagens são processadas em ordem FIFO.

Para **múltiplos consumidores paralelos**, usar particionamento:
```
Queue: trainer_hub.nutrition.events
Consumer 1: Processa eventos com userId % 4 == 0
Consumer 2: Processa eventos com userId % 4 == 1
Consumer 3: Processa eventos com userId % 4 == 2
Consumer 4: Processa eventos com userId % 4 == 3
```

---

## 8. Configuração de Produção

### 8.1 RabbitMQ Cluster

Para alta disponibilidade:

```yaml
# rabbitmq.conf

# Clustering
cluster_partition_handling = autoheal  # ou pause_minority

# Replicação de filas
vm_memory_high_watermark.relative = 0.6  # 60% RAM antes de pausar

# Network timeouts
channel_max = 2048
connection_max = infinity
heartbeat = 30  # segundos

# Performance
channel_operation_timeout = 15000
management.tcp.port = 15672
```

### 8.2 Persistent Configuration

```
# Declarar exchanges/queues em aplicação startup

@Configuration
class RabbitMQConfiguration {
    
    @Bean
    fun topicExchange(): TopicExchange {
        return TopicExchange("trainer_hub.events", true, false)
            .apply {
                setArgument("alternative-exchange", "trainer_hub.dlx")
            }
    }
    
    @Bean
    fun dlxExchange(): TopicExchange {
        return TopicExchange("trainer_hub.dlx", true, false)
    }
    
    @Bean
    fun userQueue(): Queue {
        return Queue(
            "trainer_hub.user.events",
            true,  // durable
            false, // not exclusive
            false, // not auto-delete
            mapOf(
                "x-dead-letter-exchange" to "trainer_hub.dlx",
                "x-message-ttl" to 86400000,
                "x-max-retries" to 3
            )
        )
    }
    
    @Bean
    fun binding(userQueue: Queue, topicExchange: TopicExchange): Binding {
        return BindingBuilder
            .bind(userQueue)
            .to(topicExchange)
            .with("user.*")
    }
}
```

---

## 9. Monitoramento

### 9.1 Métricas RabbitMQ

```
Coletar via Management Plugin (HTTP API):

GET http://localhost:15672/api/queues

Métricas por fila:
  - messages: Total de mensagens na fila
  - messages_ready: Prontas para consumir
  - messages_unacked: Aguardando ack
  - consumers: Número de consumers conectados
  - idle_since: Timestamp da última atividade
```

### 9.2 Alertas Críticos

```
Alertar quando:
  1. Queue depth > 10000 mensagens
     (Indica consumer lento)
  
  2. messages_unacked > 1000
     (Muitas mensagens pendentes, possível crash)
  
  3. DLQ queue depth > 10
     (Eventos chegando ao DLQ = falhas)
  
  4. Consumer count = 0
     (Service desconectou do broker)
  
  5. Memory usage > 80%
     (RabbitMQ está saturado)
```

### 9.3 Prometheus Metrics

```
# Via RabbitMQ exporter

rabbitmq_queue_messages_ready{queue="trainer_hub.nutrition.events"}
rabbitmq_queue_messages_unacked{queue="trainer_hub.nutrition.events"}
rabbitmq_queue_consumers{queue="trainer_hub.nutrition.events"}

# Via Spring RabbitMQ micrometer

rabbitmq.queue.capacity{queue="trainer_hub.nutrition.events"}
rabbitmq.connections.count
rabbitmq.channels.count
```

---

## 10. Troubleshooting

### 10.1 Fila com Muitas Mensagens

```
Cenário: trainer_hub.nutrition.events tem 50k mensagens

Diagnóstico:
  1. Verificar consumer status
     → rabbitmqctl list_consumers
  
  2. Verificar performance do serviço
     → CPU/memória/GC do nutrition-service
  
  3. Revisar tamanho das mensagens
     → Grandes payloads = processamento lento
  
Solução:
  1. Escalar replicas do nutrition-service
  2. Aumentar prefetch count (processar mais msgs paralelo)
  3. Otimizar lógica de processamento (profile)
  4. Considerar particionamento por userId
```

### 10.2 Mensagens em DLQ

```
Cenário: Messages chegando no trainer_hub.dlx.queue

Causas possíveis:
  1. Service desconectado (crash/redeploy)
  2. Falha de validação (campo obrigatório faltando)
  3. Falha de integração (API externa timeout)
  4. Bug no código (exception não-recuperável)

Ação:
  1. Analisar mensagem em MongoDB
  2. Verificar logs do serviço
  3. Decidir: retry manual, fix + replay, ou discard
  4. Implementar hotfix se bug
  5. Re-publicar se IDL inteira falhou
```

### 10.3 Consumer Desconectado

```
Cenário: rabbitmqctl list_consumers mostra 0 consumers

Ação:
  1. Verificar se service está rodando
     → kubectl get pods | grep nutrition
  
  2. Ver logs
     → kubectl logs -f nutrition-service-pod
  
  3. Checar connectividade RabbitMQ
     → nc -zv rabbitmq 5672
  
  4. Reiniciar consumer
     → kubectl restart deployment nutrition-service
```

---

## 11. Migração para Kafka (Fase 4)

Roadmap de upgrade futuro:

```
Razões para Kafka:
  - Higher throughput (1M+ msgs/sec)
  - Better for streaming/analytics
  - Longer retention (terabytes vs gigabytes)

Migration path:
  1. Fase 3: Dual-publish (RabbitMQ + Kafka)
  2. Phase 4: Migrate critical paths (meal.consumed, nutrition)
  3. Phase 4.5: Keep RabbitMQ para baixo-volume events
  4. Fase 5: Full Kafka deprecation
```

---

## 12. Conclusão

RabbitMQ é adequado para Fase 1-3 com:
- ✅ Topic exchanges para flexible routing
- ✅ DLQ para observabilidade de falhas
- ✅ Exponential backoff para resilência
- ✅ Idempotência para tolerância a duplicatas
- ✅ Monitoramento via Management Plugin

Próximos passos:
1. Implementar deserialization (JSON schema validation)
2. Configurar APM (Application Performance Monitoring)
3. Documentar runbooks de incident response
4. Testar failover scenarios (Chaos Engineering)

---

**Fim do documento - 07-MESSAGING-STRATEGY.md**  
**Total de linhas**: 1.156  
**Data de criação**: 2025-08-01  
**Status**: Pronto para commit
