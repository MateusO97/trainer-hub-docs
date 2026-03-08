# TrAIner Hub - Stack Tecnológico

**Data**: Março 2026  
**Versão**: 1.0  
**Status**: Aprovado para Fase 1

---

## 1. Stack Tecnológico - Visão Geral

TrAIner Hub utiliza um **stack moderno, escalável e bem-suportado** que equilibra:
- **Produtividade do desenvolvimento** (Kotlin, Spring Boot)
- **Experiência do usuário** (React Native, TypeScript)
- **Operacionalidade** (Docker, GitHub Actions, Kubernetes-ready)
- **Custo-benefício** (open-source onde possível)

### Stack Summary Table

| Camada | Tecnologia | Versão | Por Quê |
|--------|-----------|--------|---------|
| **Mobile** | React Native | 0.73+ | Multiplataforma, comunidade grande |
| **Backend** | Kotlin + Spring Boot | 3.2+ | Type-safe, conciso, produtivo |
| **Framework Distribuído** | Spring Cloud | 2022.0+ | Service discovery, config, circuit breaker |
| **Message Broker** | RabbitMQ | 3.12+ | Simples, operacional, production-ready |
| **Database Transacional** | PostgreSQL | 15+ | ACID, JSON support, scaling |
| **Database Analytics** | MongoDB | 6.0+ | Flexível, append-only, geo-replication |
| **Cache** | Redis | 7.0+ | Fast, sessões, rate limiting |
| **Search/Analytics** | Elasticsearch | 8.0+ | Opcional Fase 4, architecture prepared |
| **IA APIs** | OpenAI, Gemini | Latest | Sugestões, validação |
| **Containerização** | Docker | 24+ | Standardizado, reproducible |
| **Orquestração Local** | Docker Compose | Latest | Dev environment |
| **Orquestração Prod** | Kubernetes | 1.27+ | Fase 4, escalabilidade |
| **CI/CD** | GitHub Actions | - | Native ao GitHub, gratuito |
| **Versionamento** | Semantic Versioning | 2.0 | Clear versioning, tooling support |

---

## 2. Backend: Kotlin + Spring Boot

### Por Que Kotlin?

| Critério | Kotlin | Java Puro | Go |
|----------|--------|----------|-----|
| **Null Safety** | ✅ Built-in | ❌ Null pointer | ✅ Não tem nil |
| **Concisão** | ✅ ~30% menos código | ❌ Verboso | ✅ Conciso |
| **Coroutines** | ✅ Native | ❌ Threads/async | ✅ Goroutines |
| **Type Safety** | ✅ Excelente | ✅ Bom | ⚠️ Interfaces implícitas |
| **Learning Curve** | ✅ Rápida (Java devs) | ✅ Rápida | ⚠️ Diferente |
| **Ecosystem** | ✅ Maven/Gradle | ✅ Excelente | ⚠️ Menor |
| **Performance** | ✅ Excelente | ✅ Excelente | ✅ Superior |
| **Comunidade** | ✅ Crescendo | ✅ Enorme | ✅ Grande |

**Decisão**: **Kotlin é a escolha certa** para TrAIner Hub porque:
1. ✅ Team tem experiência Java
2. ✅ Null safety evita bugs críticos em APIs
3. ✅ Concisão reduz tempo de desenvolvimento
4. ✅ Roda em JVM (performance, tooling, libs)
5. ✅ Interoperável com Java (Maven central)

### Por Que Spring Boot?

| Aspecto | Spring Boot | Quarkus | Micronaut |
|--------|-----------|---------|-----------|
| **Setup Inicial** | 5 min | 5 min | 5 min |
| **Performance** | Bom | Excelente (native) | Excelente |
| **Produtividade** | ✅ Excelente | Média | Média |
| **Ecosystem** | ✅ Enorme | Crescendo | Pequeno |
| **Data JPA** | ✅ Pronto | Bom | Terceiros |
| **Security** | ✅ Spring Security | Spring Security | Terceiros |
| **Cloud Native** | ✅ Excelente | Excelente | Bom |
| **Team Knowledge** | ✅ Sim | Não | Não |

**Decisão**: **Spring Boot 3.2+** porque:
1. ✅ Maior comunidade, mais libs
2. ✅ Team já conhece
3. ✅ Virtual threads (Java 21) = performance near-native
4. ✅ Spring Cloud ecosystem (Eureka, Config, Hystrix)
5. ✅ GraalVM native image (Fase 4, se necessário)

### Core Dependencies

```kotlin
// Spring Boot + Spring Cloud
org.springframework.boot:spring-boot-starter-web:3.2.0
org.springframework.boot:spring-boot-starter-data-jpa:3.2.0
org.springframework.cloud:spring-cloud-starter-config:4.0.0
org.springframework.cloud:spring-cloud-starter-netflix-eureka-client:4.0.0
org.springframework.cloud:spring-cloud-starter-circuitbreaker-resilience4j:3.0.0

// Database
org.postgresql:postgresql:42.7.0
org.mongodb:mongodb-driver-sync:4.11.0
org.springframework.boot:spring-boot-starter-data-mongodb:3.2.0

// Cache
org.springframework.boot:spring-boot-starter-data-redis:3.2.0
redis.clients:jedis:5.0.0

// Message Broker
org.springframework.boot:spring-boot-starter-amqp:3.2.0
com.rabbitmq:amqp-client:5.20.0

// Security
org.springframework.boot:spring-boot-starter-security:3.2.0
io.jsonwebtoken:jjwt-api:0.12.3
io.jsonwebtoken:jjwt-impl:0.12.3

// Testing
org.springframework.boot:spring-boot-starter-test:3.2.0
io.rest-assured:rest-assured:5.4.0
org.testcontainers:testcontainers:1.19.0

// Utils
org.projectlombok:lombok:1.18.30
com.google.code.gson:gson:2.10.1
org.springdoc:springdoc-openapi-starter-webmvc-ui:2.1.0

// Logging
ch.qos.logback:logback-classic:1.4.11
org.springframework.boot:spring-boot-starter-logging:3.2.0

// Observability (Fase 4)
io.micrometer:micrometer-core:1.12.0
io.micrometer:micrometer-tracing-bridge-brave:1.1.0
```

### Project Structure (Clean Architecture)

```
trainer-hub-auth-service/
├── src/main/kotlin/com/trainerhubamd/auth/
│   ├── domain/          # Entities, Value Objects, exceptions
│   │   ├── User.kt
│   │   ├── AuthToken.kt
│   │   └── AuthException.kt
│   │
│   ├── application/     # Use Cases / Interactors
│   │   ├── AuthUseCaseImpl.kt
│   │   ├── LoginUseCase.kt
│   │   └── RefreshTokenUseCase.kt
│   │
│   ├── infrastructure/  # Framework-specific (Spring)
│   │   ├── adapter/
│   │   │   ├── AuthController.kt
│   │   │   ├── UserRepositoryAdapter.kt
│   │   │   └── JwtTokenProvider.kt
│   │   ├── config/
│   │   │   ├── SecurityConfig.kt
│   │   │   └── BeanConfig.kt
│   │   └── persistence/
│   │       ├── UserJpaRepository.kt
│   │       └── UserEntity.kt
│   │
│   └── TrainerHubAuthApplication.kt
│
├── src/test/kotlin/com/trainerhubamd/auth/
│   ├── application/
│   │   └── LoginUseCaseTest.kt
│   └── infrastructure/
│       └── AuthControllerTest.kt
│
├── build.gradle.kts
├── Dockerfile
└── README.md
```

### Conventions

- **Package naming**: `com.trainerhubamd.{service}.{layer}`
- **Class naming**: PascalCase (UserRepository, AuthController)
- **Function naming**: camelCase (loginUser, refreshToken)
- **Constants**: UPPER_SNAKE_CASE
- **Annotations**: Spring Security, Validation (javax.validation)
- **Error handling**: Custom exceptions + global exception handler
- **Logging**: SLF4J + Logback

---

## 3. Mobile: React Native vs. Kotlin Multiplatform

### Análise Detalhada

| Critério | React Native | Kotlin Multiplatform |
|----------|--------------|---------------------|
| **Comunidade** | ⭐⭐⭐⭐⭐ Massive | ⭐⭐⭐ Crescendo |
| **Code Reuse** | UI + alguns utils (JS/TS) | Logic + UI (Kotlin) |
| **Learning Curve** | 1-2 semanas (devs JS) | 2-4 semanas (devs Kotlin) |
| **Performance** | 85-90% native | 100% native |
| **Libs Maduras** | npm ecosystem | Maven central |
| **Native Modules** | Precisa Obj-C/Swift/Java | Seamless via Kotlin |
| **Composable** | React patterns familiar | Kotlin DSL (Compose) |
| **Hot Reload** | ✓ Rápido (Metro) | ✓ Médio (Gradle) |
| **IDE Support** | VS Code, WebStorm | Android Studio, IntelliJ |
| **Deploy Automation** | EAS Build, Expo | Gradle + GitHub Actions |
| **Time para MVP** | **3-4 meses** | **4-5 meses** |
| **Team para Manutenção** | 2-3 (JS devs) | 2-3 (Kotlin devs) |

### Recomendação: React Native para MVP

**Por que React Native agora?**
1. ✅ MVP mais rápido (3-4 meses vs. 4-5)
2. ✅ Comunidade madura: +1M desenvolvadores
3. ✅ Libs prontas: react-navigation, react-hook-form, axios
4. ✅ Time pode robustar web em React también (code sharing JS)
5. ✅ Easier onboarding para novos devs

**Upgrade Path a KMM (Fase 4+)**
- Se performance crítica (animações complexas, frequent re-renders)
- Se code-sharing entre mobile + backend essencial
- Se app cresce a 10M+ usuarios (memory/battery optimization)

### React Native Stack

```json
{
  "react": "18.2.0",
  "react-native": "0.73.0",
  "expo": "50.0.0",
  "@react-navigation/native": "6.1.0",
  "@react-navigation/bottom-tabs": "6.5.0",
  "react-hook-form": "7.48.0",
  "axios": "1.6.0",
  "zustand": "4.4.0",
  "react-native-gesture-handler": "2.14.0",
  "react-native-reanimated": "3.5.0",
  "@react-native-async-storage/async-storage": "1.21.0",
  "date-fns": "2.30.0"
}
```

### Project Structure

```
trainer-hub-mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── meal-logger.tsx  # Log refeição
│   │   ├── history.tsx      # Histórico
│   │   └── profile.tsx      # Perfil
│   └── _layout.tsx          # Navigation setup
│
├── api/
│   ├── client.ts            # Axios instance
│   ├── auth.ts              # Auth endpoints
│   ├── meals.ts             # Meals endpoints
│   └── nutrition.ts         # Nutrition endpoints
│
├── components/
│   ├── MealLogger.tsx       # Componente principal
│   ├── MacroComparison.tsx
│   ├── FoodSearch.tsx
│   └── common/              # UI components (button, input, etc)
│
├── hooks/
│   ├── useAuth.ts
│   ├── useMeals.ts
│   └── useNutrition.ts
│
├── store/
│   ├── authStore.ts         # Zustand store
│   ├── mealsStore.ts
│   └── userStore.ts
│
├── types/
│   ├── api.ts
│   ├── domain.ts
│   └── navigation.ts
│
└── app.json               # Expo config
```

---

## 4. Database Strategy

### PostgreSQL (Primary Transactional)

**O que armazenar**:
- Users, profiles, preferences
- Meal plans, meals, foods, macros
- Relationships (foreign keys)
- Audit trail

**Configuration**:
```yaml
Host: postgres.trainer-hub.internal
Port: 5432
Database: trainer_hub_prod
Version: 15+
Pool Size: 20-100 (per service)
SSL: Required (production)
Backups: Daily + WAL archiving
```

**Extensions**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Full-text search
CREATE EXTENSION IF NOT EXISTS "json";
```

### MongoDB (Analytics + Logs)

**O que armazenar**:
- Audit logs (who did what, when)
- API call logs (performance metrics)
- User analytics (sessions, features used)
- Exceptions and errors

**Configuration**:
```yaml
Host: mongo.trainer-hub.internal
Port: 27017
Database: trainer_hub_analytics
Version: 6.0+
Replica Set: Yes
TTL Indexes: Yes (auto-cleanup)
```

### Redis (Cache + Sessions)

**O que armazenar**:
- User sessions (JWT blacklist)
- API cache (alimentos, macros calculadas)
- Rate limiting counters
- Realtime data (dashboard updates)

**Configuration**:
```yaml
Host: redis.trainer-hub.internal
Port: 6379
Mode: Standalone (MVP) → Sentinel (Fase 4)
TTL Strategy: Defined per key type
Persistence: RDB (daily snapshots)
```

**TTL Defaults**:
- Sessions: 7 dias (refresh token)
- Food cache: 7 dias (macros mudam pouco)
- Dashboard: 2 horas (invalidated on meal change)
- Rate limit: 1 minuto

---

## 5. Message Broker: RabbitMQ

### Por Que RabbitMQ?

| Critério | RabbitMQ | Kafka | AWS SQS |
|----------|----------|-------|---------|
| **Setup** | ✅ Simples | ❌ Complexo | ✅ Managed |
| **Ordering** | Per queue | Per partition | FIFO queue (limited) |
| **Throughput** | ~50k msg/s | ~1M msg/s | ~100k msg/s |
| **Latency** | ~10ms | ~100ms | ~100ms |
| **Retention** | Configurable | Months | 14 dias max |
| **Protocol** | AMQP, MQTT | Custom | HTTP/AWS API |
| **Learning Curve** | ✅ Rápida | ❌ Lenta | Média |
| **Cost (Fase 4)** | Self-hosted | Self-hosted | Per request |

**Decisão**: **RabbitMQ para MVP** porque:
1. ✅ Simples de operar (Docker image, 1 command)
2. ✅ Suficiente para throughput MVP (~5k events/min)
3. ✅ AMQP standard (upgrade a Kafka sem reescrever)
4. ✅ Management UI incluído
5. ✅ Sem vendor lock-in

### RabbitMQ Setup

```yaml
image: rabbitmq:3.12-management

Environment:
  RABBITMQ_DEFAULT_USER: trainer-hub
  RABBITMQ_DEFAULT_PASS: <secure-password>

Ports:
  - 5672: AMQP protocol
  - 15672: Management UI

Volumes:
  - rabbitmq_data:/var/lib/rabbitmq

Plugins:
  - rabbitmq_management
  - rabbitmq_consistent_hash_exchange
```

### Exchanges & Queues Design

```
Exchange: events (fanout)
├── Queue: food.update_queue
│   └── Consumer: nutrition-service
├── Queue: meal.created_queue
│   ├── Consumer: tracking-service
│   └── Consumer: notification-service
└── Queue: nutrition.macro_changed_queue
    ├── Consumer: tracking-service
    └── Consumer: ai-service

Exchange: commands (direct)
├── Routing Key: notification.send
│   └── Queue: notification.send_queue
│       └── Consumer: notification-service
```

---

## 6. CI/CD: GitHub Actions

### Workflows Padrão

```yaml
# .github/workflows/build-and-test.yml
name: Build & Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: 21
          distribution: temurin
      
      - name: Build with Gradle
        run: ./gradlew build
      
      - name: Run tests
        run: ./gradlew test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  docker:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t trainer-hub-${{ github.event.repository.name }}:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASS }}
          docker push trainer-hub-${{ github.event.repository.name }}
```

### Deployment (Fase 4)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Update Kubernetes deployment
        run: |
          kubectl set image deployment/auth-service \
            auth-service=trainer-hub-auth:${{ github.sha }}
```

---

## 7. Containerização: Docker

### Dockerfile por Serviço

```dockerfile
# trainer-hub-auth-service/Dockerfile
FROM openjdk:21-slim as builder
WORKDIR /app
COPY . .
RUN ./gradlew bootJar

FROM openjdk:21-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
EXPOSE 8081
```

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: trainer_hub_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3.12-management
    environment:
      RABBITMQ_DEFAULT_USER: trainer-hub
      RABBITMQ_DEFAULT_PASS: trainer-hub
    ports:
      - "5672:5672"
      - "15672:15672"

  # Services
  auth-service:
    build: ./services/auth-service
    ports:
      - "8081:8081"
    depends_on:
      - postgres
      - redis
    environment:
      POSTGRES_URL: jdbc:postgresql://postgres:5432/trainer_hub_dev
      REDIS_URL: redis://redis:6379

  # ... other services

volumes:
  postgres_data:
  mongo_data:
```

**Comando de startup**:
```bash
docker-compose up -d
```

---

## 8. Versionamento: Semantic Versioning

### Versioning Strategy

- **MAJOR.MINOR.PATCH** (ex: 1.2.3)
- **MAJOR**: Breaking API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes

### Release Process

```bash
# Local
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# GitHub Actions automatically:
# 1. Build Docker image
# 2. Tag image as trainer-hub-service:1.2.3
# 3. Push to registry
# 4. Create GitHub release notes
```

---

## 9. Observability Placeholder (Fase 4)

### Logging Stack

```
Service Logs (stdout)
  → Logback (JSON format)
    → ELK Stack
      ├── Elasticsearch (storage)
      ├── Logstash (processing)
      └── Kibana (visualization)
```

### Monitoring Stack

```
Prometheus scrape targets
  → /actuator/prometheus
    ├── JVM metrics
    ├── HTTP metrics
    ├── Database connection pools
    └── Custom metrics
  → Prometheus server
    → Grafana dashboards
```

### Distributed Tracing

```
Spring Cloud Sleuth + Brave
  → Jaeger collector
    → Jaeger UI (trace visualization)
```

---

## 10. Stack Summary & Justification

| Componente | Escolha | Alternativas Consideradas | Reasoning |
|-----------|---------|---------------------------|-----------|
| **Language** | Kotlin | Java, Go, Python | Type safety + concisão + JVM ecosystem |
| **Framework** | Spring Boot | Quarkus, Micronaut | Larger community, existing knowledge |
| **Mobile** | React Native | Kotlin Multiplatform | Faster MVP, larger community |
| **Message Broker** | RabbitMQ | Kafka, AWS SQS | Simple, sufficient for MVP, upgrade path |
| **Primary DB** | PostgreSQL | MySQL, MongoDB | ACID, relationships, JSON support |
| **Analytics DB** | MongoDB | Elasticsearch | Flexible schema, TTL indexes |
| **Cache** | Redis | Memcached | Sessions, rate limiting, real-time |
| **Containerization** | Docker | Podman | Industry standard, tooling |
| **CI/CD** | GitHub Actions | Jenkins, GitLab CI | Native to GitHub, no setup |

---

## 11. Next Steps

1. ✅ **Fase 1.4**: Database Design (schema detalhado)
2. ✅ **Fase 1.5**: Microsserviço Detalhes (endpoints específicos)
3. ✅ **Fase 3**: Implementação Spring Boot
4. ✅ **Fase 3**: Implementação React Native

---

**Referências**:
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/)
- [Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-overview.html)
- [React Native](https://reactnative.dev/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [PostgreSQL JSON](https://www.postgresql.org/docs/current/datatype-json.html)
