# API Contracts - Microservices Communication

## Overview

Este documento define os contratos de comunicação entre os microserviços da plataforma Trainer Hub. Todos os microserviços se comunicam via REST APIs com JSON, exceto onde indicado.

## Architecture Pattern

- **Synchronous Communication**: REST APIs via Gateway (HTTP/JSON)
- **Asynchronous Communication**: Message broker (RabbitMQ) para eventos
- **Authentication**: JWT tokens validados pelo Auth Service
- **Service Discovery**: Kubernetes DNS (service-name.namespace.svc.cluster.local)

---

## 1. Auth Service → Other Services

### Token Validation (Internal)

**Endpoint**: `POST /api/v1/auth/validate`  
**Purpose**: Validar JWT tokens para outros microserviços  
**Authentication**: Service-to-service (API Key)

**Request**:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "valid": true,
  "userId": "uuid",
  "email": "user@example.com",
  "role": "USER",
  "exp": 1678901234
}
```

**Response** (401 Unauthorized):
```json
{
  "valid": false,
  "error": "TOKEN_EXPIRED"
}
```

**Consumers**: Gateway Service (todas as requisições autenticadas)

---

## 2. User Service APIs

### Get User Profile

**Endpoint**: `GET /api/v1/users/{userId}`  
**Purpose**: Obter perfil completo do usuário  
**Authentication**: JWT required

**Response** (200 OK):
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "role": "USER",
  "profile": {
    "birthDate": "1990-01-01",
    "gender": "MALE",
    "height": 175,
    "weight": 75.5,
    "activityLevel": "MODERATE",
    "goals": ["WEIGHT_LOSS", "MUSCLE_GAIN"],
    "restrictions": ["LACTOSE_INTOLERANT"],
    "allergies": ["PEANUTS"]
  },
  "preferences": {
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "notifications": {
      "email": true,
      "push": true,
      "mealReminders": true
    }
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Consumers**: Nutrition Service, Meal Service, AI Service, Mobile App

---

### Update User Profile

**Endpoint**: `PATCH /api/v1/users/{userId}`  
**Purpose**: Atualizar dados do perfil  
**Authentication**: JWT required (own profile or ADMIN)

**Request**:
```json
{
  "profile": {
    "weight": 74.0,
    "goals": ["WEIGHT_LOSS"]
  }
}
```

**Response** (200 OK): Same as Get User Profile

**Consumers**: Mobile App

---

### Get User Preferences

**Endpoint**: `GET /api/v1/users/{userId}/preferences`  
**Purpose**: Obter preferências do usuário  
**Authentication**: JWT required

**Response** (200 OK):
```json
{
  "dietType": "OMNIVORE",
  "restrictions": ["LACTOSE_INTOLERANT"],
  "allergies": ["PEANUTS"],
  "dislikedFoods": ["broccoli", "liver"],
  "preferredCuisines": ["BRAZILIAN", "ITALIAN"],
  "mealTimes": {
    "breakfast": "07:00",
    "lunch": "12:00",
    "dinner": "19:00"
  }
}
```

**Consumers**: Meal Service, Nutrition Service, AI Service

---

## 3. Food DB Service APIs

### Search Foods

**Endpoint**: `GET /api/v1/foods/search?q={query}&limit={limit}`  
**Purpose**: Buscar alimentos por nome  
**Authentication**: JWT required

**Response** (200 OK):
```json
{
  "foods": [
    {
      "foodId": "uuid",
      "name": "Arroz Branco Cozido",
      "brand": "Generic",
      "category": "GRAINS",
      "servingSize": 100,
      "servingUnit": "g",
      "nutrition": {
        "calories": 130,
        "protein": 2.7,
        "carbs": 28.2,
        "fat": 0.3,
        "fiber": 0.4,
        "sodium": 1,
        "sugar": 0.1
      },
      "verified": true
    }
  ],
  "total": 1
}
```

**Consumers**: Meal Service, Mobile App

---

### Get Food Details

**Endpoint**: `GET /api/v1/foods/{foodId}`  
**Purpose**: Obter informações nutricionais completas  
**Authentication**: JWT required

**Response** (200 OK):
```json
{
  "foodId": "uuid",
  "name": "Peito de Frango Grelhado",
  "brand": "Generic",
  "category": "PROTEIN",
  "servingSize": 100,
  "servingUnit": "g",
  "nutrition": {
    "calories": 165,
    "protein": 31.0,
    "carbs": 0.0,
    "fat": 3.6,
    "fiber": 0.0,
    "sodium": 74,
    "sugar": 0.0,
    "saturatedFat": 1.0,
    "transFat": 0.0,
    "cholesterol": 85,
    "vitamins": {
      "A": 0.01,
      "C": 0.0,
      "D": 0.0,
      "B12": 0.34
    },
    "minerals": {
      "calcium": 15,
      "iron": 1.0,
      "potassium": 256
    }
  },
  "alternativeUnits": [
    { "unit": "piece", "grams": 120 },
    { "unit": "cup", "grams": 140 }
  ],
  "verified": true,
  "source": "USDA"
}
```

**Consumers**: Meal Service, Nutrition Service, Mobile App

---

## 4. Meal Service APIs

### Log Meal

**Endpoint**: `POST /api/v1/meals`  
**Purpose**: Registrar refeição consumida  
**Authentication**: JWT required

**Request**:
```json
{
  "userId": "uuid",
  "mealType": "LUNCH",
  "consumedAt": "2024-03-08T12:30:00Z",
  "foods": [
    {
      "foodId": "uuid",
      "quantity": 150,
      "unit": "g"
    },
    {
      "foodId": "uuid",
      "quantity": 200,
      "unit": "g"
    }
  ],
  "notes": "Almoço no restaurante",
  "photoUrl": "https://s3.../meal-photo.jpg"
}
```

**Response** (201 Created):
```json
{
  "mealId": "uuid",
  "userId": "uuid",
  "mealType": "LUNCH",
  "consumedAt": "2024-03-08T12:30:00Z",
  "foods": [...],
  "totalNutrition": {
    "calories": 650,
    "protein": 45.0,
    "carbs": 70.0,
    "fat": 15.0
  },
  "createdAt": "2024-03-08T12:35:00Z"
}
```

**Consumers**: Mobile App

**Events Emitted**:
- `meal.logged` → Nutrition Service, Tracking Service, AI Service

---

### Get Meal Plan

**Endpoint**: `GET /api/v1/meal-plans/{userId}/current`  
**Purpose**: Obter plano alimentar ativo do usuário  
**Authentication**: JWT required

**Response** (200 OK):
```json
{
  "planId": "uuid",
  "userId": "uuid",
  "createdBy": "nutritionist-uuid",
  "status": "ACTIVE",
  "startDate": "2024-03-01",
  "endDate": "2024-03-31",
  "dailyTargets": {
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fat": 67
  },
  "meals": [
    {
      "mealType": "BREAKFAST",
      "targetTime": "07:00",
      "foods": [...]
    }
  ],
  "createdAt": "2024-03-01T00:00:00Z"
}
```

**Consumers**: Mobile App, Nutrition Service

---

## 5. Nutrition Service APIs

### Calculate Nutritional Goals

**Endpoint**: `POST /api/v1/nutrition/calculate-goals`  
**Purpose**: Calcular metas nutricionais com base no perfil  
**Authentication**: JWT required

**Request**:
```json
{
  "userId": "uuid",
  "goal": "WEIGHT_LOSS",
  "activityLevel": "MODERATE",
  "targetWeightLoss": 0.5,
  "targetWeightLossUnit": "kg/week"
}
```

**Response** (200 OK):
```json
{
  "userId": "uuid",
  "bmr": 1650,
  "tdee": 2310,
  "recommendedCalories": 1810,
  "macros": {
    "protein": 140,
    "proteinPercentage": 30,
    "carbs": 180,
    "carbsPercentage": 40,
    "fat": 60,
    "fatPercentage": 30
  },
  "deficit": 500,
  "expectedWeightLoss": 0.5,
  "expectedWeightLossUnit": "kg/week"
}
```

**Consumers**: Mobile App, AI Service

---

### Get Daily Summary

**Endpoint**: `GET /api/v1/nutrition/summary?userId={userId}&date={date}`  
**Purpose**: Obter resumo nutricional do dia  
**Authentication**: JWT required

**Response** (200 OK):
```json
{
  "date": "2024-03-08",
  "consumed": {
    "calories": 1650,
    "protein": 120,
    "carbs": 160,
    "fat": 55
  },
  "targets": {
    "calories": 1810,
    "protein": 140,
    "carbs": 180,
    "fat": 60
  },
  "remaining": {
    "calories": 160,
    "protein": 20,
    "carbs": 20,
    "fat": 5
  },
  "percentages": {
    "calories": 91,
    "protein": 86,
    "carbs": 89,
    "fat": 92
  },
  "mealsCount": 3,
  "waterIntake": 2.0,
  "waterTarget": 2.5
}
```

**Consumers**: Mobile App, AI Service

---

## 6. Tracking Service APIs

### Log Weight

**Endpoint**: `POST /api/v1/tracking/weight`  
**Purpose**: Registrar peso corporal  
**Authentication**: JWT required

**Request**:
```json
{
  "userId": "uuid",
  "weight": 74.5,
  "unit": "kg",
  "measuredAt": "2024-03-08T07:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "entryId": "uuid",
  "userId": "uuid",
  "weight": 74.5,
  "unit": "kg",
  "measuredAt": "2024-03-08T07:00:00Z",
  "difference": -0.5,
  "trend": "DECREASING"
}
```

**Consumers**: Mobile App

**Events Emitted**:
- `weight.logged` → AI Service, Notification Service

---

### Get Progress Report

**Endpoint**: `GET /api/v1/tracking/progress?userId={userId}&startDate={date}&endDate={date}`  
**Purpose**: Obter relatório de progresso  
**Authentication**: JWT required

**Response** (200 OK):
```json
{
  "userId": "uuid",
  "period": {
    "start": "2024-02-01",
    "end": "2024-03-08"
  },
  "weightProgress": {
    "initial": 77.0,
    "current": 74.5,
    "change": -2.5,
    "goalWeight": 70.0,
    "progress": 58
  },
  "nutritionAdherence": {
    "caloriesAvg": 92,
    "proteinAvg": 88,
    "mealsLoggedPercentage": 85
  },
  "streaks": {
    "currentLoggingStreak": 15,
    "longestLoggingStreak": 30
  }
}
```

**Consumers**: Mobile App, AI Service

---

## 7. AI Service APIs

### Generate Recommendations

**Endpoint**: `POST /api/v1/ai/recommendations`  
**Purpose**: Gerar recomendações personalizadas  
**Authentication**: JWT required

**Request**:
```json
{
  "userId": "uuid",
  "type": "MEAL_SUGGESTIONS",
  "context": {
    "mealType": "DINNER",
    "remainingCalories": 600,
    "timeOfDay": "19:00"
  }
}
```

**Response** (200 OK):
```json
{
  "recommendations": [
    {
      "type": "MEAL",
      "meal": {
        "name": "Frango Grelhado com Legumes",
        "foods": [...],
        "totalCalories": 580,
        "reason": "Alta em proteínas, baixo carboidrato, dentro do limite calórico"
      },
      "confidence": 0.92
    }
  ],
  "generatedAt": "2024-03-08T18:00:00Z"
}
```

**Consumers**: Mobile App

---

### Analyze Food Photo

**Endpoint**: `POST /api/v1/ai/analyze-photo`  
**Purpose**: Identificar alimentos em foto  
**Authentication**: JWT required

**Request** (multipart/form-data):
```
photo: [binary image data]
userId: uuid
```

**Response** (200 OK):
```json
{
  "detectedFoods": [
    {
      "foodId": "uuid",
      "name": "Arroz Branco",
      "confidence": 0.95,
      "estimatedQuantity": 150,
      "unit": "g",
      "boundingBox": {
        "x": 100,
        "y": 200,
        "width": 150,
        "height": 100
      }
    }
  ],
  "totalNutritionEstimate": {
    "calories": 650,
    "protein": 45,
    "carbs": 70,
    "fat": 15
  },
  "photoAnalysisId": "uuid"
}
```

**Consumers**: Mobile App

---

## 8. Notification Service APIs

### Send Notification

**Endpoint**: `POST /api/v1/notifications` (Internal)  
**Purpose**: Enviar notificação para usuário  
**Authentication**: Service-to-service (API Key)

**Request**:
```json
{
  "userId": "uuid",
  "type": "MEAL_REMINDER",
  "channels": ["PUSH", "EMAIL"],
  "title": "Hora do almoço!",
  "body": "Não esqueça de registrar sua refeição",
  "data": {
    "mealType": "LUNCH",
    "action": "LOG_MEAL"
  },
  "scheduledFor": "2024-03-08T12:00:00Z"
}
```

**Response** (202 Accepted):
```json
{
  "notificationId": "uuid",
  "status": "SCHEDULED",
  "scheduledFor": "2024-03-08T12:00:00Z"
}
```

**Consumers**: All services (via async events)

---

### Get Notification History

**Endpoint**: `GET /api/v1/notifications?userId={userId}&limit={limit}`  
**Purpose**: Obter histórico de notificações  
**Authentication**: JWT required

**Response** (200 OK):
```json
{
  "notifications": [
    {
      "notificationId": "uuid",
      "type": "MEAL_REMINDER",
      "title": "Hora do almoço!",
      "body": "Não esqueça de registrar sua refeição",
      "readAt": null,
      "sentAt": "2024-03-08T12:00:00Z",
      "channels": ["PUSH"]
    }
  ],
  "total": 15,
  "unreadCount": 3
}
```

**Consumers**: Mobile App

---

## 9. Gateway Service

### Purpose
- Ponto de entrada único para o Mobile App
- Roteamento de requisições para microserviços
- Rate limiting global
- Validação de JWT (via Auth Service)
- CORS configuration
- API versioning

### Routing Rules

| Path Pattern | Target Service | Auth Required |
|-------------|----------------|---------------|
| `/api/v1/auth/**` | Auth Service | No (except /me, /logout) |
| `/api/v1/users/**` | User Service | Yes |
| `/api/v1/foods/**` | Food DB Service | Yes |
| `/api/v1/meals/**` | Meal Service | Yes |
| `/api/v1/meal-plans/**` | Meal Service | Yes |
| `/api/v1/nutrition/**` | Nutrition Service | Yes |
| `/api/v1/tracking/**` | Tracking Service | Yes |
| `/api/v1/ai/**` | AI Service | Yes |
| `/api/v1/notifications/**` | Notification Service | Yes |

---

## Async Communication (Events)

### Event Bus: RabbitMQ

**Exchange**: `trainer-hub-events` (topic exchange)

### Events Published

#### meal.logged
**Publisher**: Meal Service  
**Consumers**: Nutrition Service, Tracking Service, AI Service  
**Payload**:
```json
{
  "eventId": "uuid",
  "eventType": "meal.logged",
  "timestamp": "2024-03-08T12:35:00Z",
  "userId": "uuid",
  "mealId": "uuid",
  "mealType": "LUNCH",
  "totalCalories": 650,
  "totalProtein": 45,
  "totalCarbs": 70,
  "totalFat": 15
}
```

---

#### weight.logged
**Publisher**: Tracking Service  
**Consumers**: AI Service, Notification Service  
**Payload**:
```json
{
  "eventId": "uuid",
  "eventType": "weight.logged",
  "timestamp": "2024-03-08T07:00:00Z",
  "userId": "uuid",
  "weight": 74.5,
  "unit": "kg",
  "difference": -0.5,
  "trend": "DECREASING"
}
```

---

#### goal.achieved
**Publisher**: AI Service  
**Consumers**: Notification Service, User Service  
**Payload**:
```json
{
  "eventId": "uuid",
  "eventType": "goal.achieved",
  "timestamp": "2024-03-08T23:59:00Z",
  "userId": "uuid",
  "goalType": "DAILY_CALORIES",
  "targetValue": 1810,
  "achievedValue": 1805,
  "achievement": "PERFECT_DAY"
}
```

---

#### meal.reminder
**Publisher**: Meal Service (scheduled jobs)  
**Consumers**: Notification Service  
**Payload**:
```json
{
  "eventId": "uuid",
  "eventType": "meal.reminder",
  "timestamp": "2024-03-08T12:00:00Z",
  "userId": "uuid",
  "mealType": "LUNCH",
  "scheduledTime": "12:00"
}
```

---

## Error Handling (Standard)

Todos os serviços devem retornar erros no formato padrão:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    },
    "timestamp": "2024-03-08T10:00:00Z",
    "traceId": "uuid"
  }
}
```

### Standard Error Codes

- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)

---

## Service-to-Service Authentication

### API Keys
- Internal services use API keys no header `X-Service-Key`
- API keys gerenciados via Kubernetes Secrets
- Validação no Gateway antes de rotear

### Service Mesh (Future)
- Implementar mTLS com Istio
- Service identity com SPIFFE
- Zero-trust networking

---

## Observability

### Distributed Tracing
- Todos os serviços propagam `X-Trace-Id` header
- OpenTelemetry para spans
- Jaeger para visualização

### Logging
- Structured JSON logs
- Incluir `traceId`, `userId`, `service`, `timestamp`
- Centralizado no ELK Stack

### Metrics
- Prometheus metrics em `/actuator/prometheus`
- Grafana dashboards por serviço
- Alertas via AlertManager

---

## Versioning & Deprecation

- API versioning via path: `/api/v1/`, `/api/v2/`
- Deprecation warnings no header `X-API-Deprecated: true`
- Mínimo 6 meses de suporte para versões depreciadas
- Documentação de breaking changes no CHANGELOG

---

## Rate Limiting

### External (Mobile App → Gateway)
- 1000 requests/hour per user
- Burst: 100 requests/minute
- Headers de resposta:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### Internal (Service-to-Service)
- 10000 requests/hour per service
- Circuit breaker após 5 falhas consecutivas
- Retry com exponential backoff

---

## Data Ownership

| Service | Tables Owned | Dependent Services |
|---------|-------------|-------------------|
| Auth Service | users (auth data), refresh_tokens, audit_log | All (token validation) |
| User Service | user_profiles, user_preferences | Nutrition, Meal, AI |
| Food DB Service | foods, food_nutrients | Meal, Nutrition |
| Meal Service | meals, meal_foods, meal_plans | Nutrition, Tracking, AI |
| Nutrition Service | nutrition_goals, daily_summaries | AI, Tracking |
| Tracking Service | weight_logs, body_measurements, progress_snapshots | AI, Notification |
| AI Service | recommendations, photo_analyses, ml_models | Notification |
| Notification Service | notifications, notification_preferences | None (consumer) |

**Regra**: Cada serviço é dono dos seus dados. Outros serviços devem usar APIs, nunca acessar diretamente o banco.

---

## SLA Targets

| Service | Availability | p95 Latency | p99 Latency |
|---------|-------------|------------|------------|
| Auth Service | 99.9% | 200ms | 500ms |
| Gateway Service | 99.99% | 100ms | 300ms |
| User Service | 99.9% | 150ms | 400ms |
| Food DB Service | 99.9% | 200ms | 500ms |
| Meal Service | 99.9% | 300ms | 800ms |
| Nutrition Service | 99.9% | 250ms | 600ms |
| Tracking Service | 99.5% | 200ms | 500ms |
| AI Service | 99.0% | 2000ms | 5000ms |
| Notification Service | 99.5% | 500ms | 1500ms |

---

## API Documentation

Cada serviço deve expor:
- OpenAPI 3.0 spec em `/api/docs/openapi.json`
- Swagger UI em `/api/docs` (dev only)
- Postman collection no repositório
- Examples em `docs/examples/`

---

## Contract Testing

- Consumer-driven contracts com Pact
- Contract tests executados no CI/CD
- Breaking changes bloqueiam merge
- Contract broker para versionamento
