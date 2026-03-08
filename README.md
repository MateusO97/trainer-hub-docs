# TrAIner Hub - Documentação

> Plataforma inteligente de planejamento e acompanhamento de dietas com IA.

Quick access to all repositories in the Trainer Hub ecosystem.

**Maintainer**: Mateus de Oliveira Barbosa ([@MateusO97](https://github.com/MateusO97))  
**Last Updated**: 8 de março de 2026
**Pages**: https://mateuso97.github.io/trainer-hub-docs/

---































































































































































































































































































## 📚 Documentation & Standards

### [📖 trainer-hub-docs](https://github.com/MateusO97/trainer-hub-docs) 

**Central documentation repository**

- Architecture decisions (ADRs)
- Engineering standards & guidelines
- API contracts & communication patterns
- Phase 2 implementation roadmap
- RFCs and technical specifications

**Key Documents**:
- [REPOSITORIES.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/REPOSITORIES.md) - Complete ecosystem overview
- [API-CONTRACTS.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/API-CONTRACTS.md) - Service communication contracts
- [FASE-2-PLAN.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/FASE-2-PLAN.md) - 12-week implementation plan

---

## 🏗️ Backend Microservices

### Wave 1 - Foundational Services (No Dependencies)

#### [🔐 Auth Service](https://github.com/MateusO97/trainer-hub-auth-service)

**Status**: 🚧 In Development | **Port**: 8081 | **Language**: Kotlin + Spring Boot

**Features**:
- Email + password authentication
- OAuth2 (Google, Apple Sign-In)
- JWT token generation (RS256)
- Refresh token flow
- Password reset
- Role-based access control (4 roles)
- Audit logging

**Issues**: [11 functional requirements](https://github.com/MateusO97/trainer-hub-auth-service/issues)

---

#### [👤 User Service](https://github.com/MateusO97/trainer-hub-user-service)

**Status**: 📝 Not Started | **Port**: 8082 | **Language**: Kotlin + Spring Boot

**Features**:
- User profile management (personal info, physical data)
- User preferences (diet type, restrictions, allergies)
- Goals & targets configuration
- Notification settings
- Activity level tracking

**Dependencies**: Auth Service (token validation)

---

#### [🍎 Food DB Service](https://github.com/MateusO97/trainer-hub-food-db-service)

**Status**: 📝 Not Started | **Port**: 8083 | **Language**: Kotlin + Spring Boot

**Features**:
- Food database (USDA, TACO, custom foods)
- Advanced search (name, brand, category, barcode)
- Nutritional information (macros, micros, vitamins, minerals)
- Multiple serving units support
- User-created custom foods
- Food verification system

**Dependencies**: Auth Service

---

### Wave 2 - Core Business Logic (Depends on Wave 1)

#### [🍽️ Meal Service](https://github.com/MateusO97/trainer-hub-meal-service)

**Status**: 📝 Not Started | **Port**: 8084 | **Language**: Kotlin + Spring Boot

**Features**:
- Meal logging (breakfast, lunch, dinner, snacks)
- Photo upload & attachment
- Meal plans (created by nutritionists)
- Meal templates & favorites
- Quick logging from recent meals
- Scheduled meal reminders

**Dependencies**: Auth Service, User Service, Food DB Service  
**Events**: Publishes `meal.logged`, `meal.reminder`

---

#### [📊 Nutrition Service](https://github.com/MateusO97/trainer-hub-nutrition-service)

**Status**: 📝 Not Started | **Port**: 8085 | **Language**: Kotlin + Spring Boot

**Features**:
- Nutritional goals calculation (BMR, TDEE, macros)
- Daily nutritional summaries
- Weekly/monthly reports
- Macro distribution analysis
- Adherence tracking
- Micronutrient analysis

**Dependencies**: Auth Service, User Service, Meal Service  
**Events**: Consumes `meal.logged`

---

#### [📈 Tracking Service](https://github.com/MateusO97/trainer-hub-tracking-service)

**Status**: 📝 Not Started | **Port**: 8086 | **Language**: Kotlin + Spring Boot

**Features**:
- Weight logging with trends
- Body measurements (waist, chest, arms, etc.)
- Progress photos
- Goal progress tracking
- Streaks & achievements
- Progress reports & charts

**Dependencies**: Auth Service, User Service  
**Events**: Publishes `weight.logged`, consumes `meal.logged`

---

### Wave 3 - Advanced Features (Depends on Waves 1 & 2)

#### [🤖 AI Service](https://github.com/MateusO97/trainer-hub-ai-service)

**Status**: 📝 Not Started | **Port**: 8087 | **Language**: Python + FastAPI

**Features**:
- Meal recommendations (personalized suggestions)
- Food photo recognition (ML models)
- Portion size estimation
- Goal achievement predictions
- Nutritional pattern analysis
- Anomaly detection

**Dependencies**: Auth Service, User Service, Food DB Service, Meal Service, Tracking Service  
**Events**: Publishes `goal.achieved`, consumes `meal.logged`, `weight.logged`

---

#### [🔔 Notification Service](https://github.com/MateusO97/trainer-hub-notification-service)

**Status**: 📝 Not Started | **Port**: 8088 | **Language**: Kotlin + Spring Boot

**Features**:
- Push notifications (iOS, Android via FCM)
- Email notifications (SendGrid/AWS SES)
- SMS notifications (Twilio)
- Notification scheduling
- Notification history & read receipts
- User notification preferences
- Meal reminders (scheduled jobs)

**Dependencies**: Auth Service, User Service  
**Events**: Consumes `meal.reminder`, `weight.logged`, `goal.achieved`

---

### Wave 4 - Infrastructure (Depends on All Backend Services)

#### [🌐 API Gateway](https://github.com/MateusO97/trainer-hub-gateway)

**Status**: 📝 Not Started | **Port**: 8080 | **Language**: Kotlin + Spring Cloud Gateway

Single entry point for all API requests with routing and authentication.

**Features**:
- API routing to backend microservices
- JWT token validation (via Auth Service)
- Rate limiting (per user, per IP)
- CORS configuration
- Request/response logging
- Circuit breaker (Resilience4j)
- API versioning support

**Routes**:
```
/api/v1/auth/**       → Auth Service (8081)
/api/v1/users/**      → User Service (8082)
/api/v1/foods/**      → Food DB Service (8083)
/api/v1/meals/**      → Meal Service (8084)
/api/v1/nutrition/**  → Nutrition Service (8085)
/api/v1/tracking/**   → Tracking Service (8086)
/api/v1/ai/**         → AI Service (8087)
/api/v1/notifications/** → Notification Service (8088)
```

**Dependencies**: Auth Service (token validation)

---

### Wave 5 - Client Application (Depends on Gateway)

#### [📱 Mobile App](https://github.com/MateusO97/trainer-hub-mobile)

**Status**: 📝 Not Started | **Platform**: iOS & Android | **Language**: React Native + TypeScript

Cross-platform mobile application.

**Features**:
- User authentication (email, Google, Apple Sign-In)
- Profile management
- Food search & database
- Meal logging with camera
- AI food recognition
- Nutritional goals & tracking
- Weight tracking with charts
- Progress photos
- Push notifications
- Meal reminders
- Dark mode support
- Offline mode (cached data)

**Tech Stack**:
- React Native 0.73
- TypeScript
- Redux Toolkit
- React Navigation
- React Native Camera
- React Native Charts

**Dependencies**: Gateway Service (all API calls)

---

## 🔄 Communication Patterns

### Synchronous (REST APIs)
```
Mobile App → Gateway → Backend Microservices
Gateway → Auth Service (token validation)
```

### Asynchronous (RabbitMQ Events)
```
Meal Service     → meal.logged     → Nutrition, Tracking, AI
AI Service       → goal.achieved   → Notification
Tracking Service → weight.logged   → AI, Notification
Meal Service     → meal.reminder   → Notification
```

---

## 📊 Implementation Status

| Wave | Services | Status | Timeline |
|------|----------|--------|----------|
| Wave 1 | Auth, User, Food DB | 🚧 Auth In Dev | Weeks 1-2 |
| Wave 2 | Meal, Nutrition, Tracking | 📝 Not Started | Weeks 3-5 |
| Wave 3 | AI, Notification | 📝 Not Started | Weeks 6-8 |
| Wave 4 | Gateway | 📝 Not Started | Weeks 9-10 |
| Wave 5 | Mobile App | 📝 Not Started | Weeks 11-15 |

---

## 🔗 Quick Commands

### Clone All Repositories
```bash
# Clone documentation
git clone https://github.com/MateusO97/trainer-hub-docs.git

# Clone backend services
git clone https://github.com/MateusO97/trainer-hub-auth-service.git
git clone https://github.com/MateusO97/trainer-hub-user-service.git
git clone https://github.com/MateusO97/trainer-hub-food-db-service.git
git clone https://github.com/MateusO97/trainer-hub-meal-service.git
git clone https://github.com/MateusO97/trainer-hub-nutrition-service.git
git clone https://github.com/MateusO97/trainer-hub-tracking-service.git
git clone https://github.com/MateusO97/trainer-hub-ai-service.git
git clone https://github.com/MateusO97/trainer-hub-notification-service.git
git clone https://github.com/MateusO97/trainer-hub-gateway.git

# Clone mobile app
git clone https://github.com/MateusO97/trainer-hub-mobile.git
```

### View All Repositories
```bash
open https://github.com/MateusO97?tab=repositories&q=trainer-hub
```

---

## 📖 Documentation Resources

- **Architecture Overview**: [docs/01-VISION.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/01-VISION.md)
- **Microservices Spec**: [docs/05-MICROSERVICES.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/05-MICROSERVICES.md)
- **API Contracts**: [docs/API-CONTRACTS.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/API-CONTRACTS.md)
- **Engineering Standards**: [docs/INFRASTRUCTURE/README-ENGINEERING-STANDARDS.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/INFRASTRUCTURE/README-ENGINEERING-STANDARDS.md)
- **UI/UX Design System**: [docs/INFRASTRUCTURE/UI-UX-DESIGN-SYSTEM.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/INFRASTRUCTURE/UI-UX-DESIGN-SYSTEM.md)
- **Code Styling Guide**: [docs/INFRASTRUCTURE/CODE-STYLING-LINTING.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/INFRASTRUCTURE/CODE-STYLING-LINTING.md)

---

## 🤝 Contributing

Each repository follows the same standards:

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- All PRs require code review
- CI/CD must pass (linting, tests, build)
- Minimum 80% test coverage
- OpenAPI documentation updated

See [Git Workflow](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/INFRASTRUCTURE/GIT-WORKFLOW.md) for details.

---

## 📄 License

All repositories: MIT License

---

## 🏗️ Ecossistema de Repositórios

### 📚 Central de Documentação
[![Docs](https://img.shields.io/badge/📚_Docs-Active-success?style=for-the-badge)](https://github.com/MateusO97/trainer-hub-docs)

**[trainer-hub-docs](https://github.com/MateusO97/trainer-hub-docs)** - Este repositório  
Documentação de arquitetura, standards, RFCs e roadmap do projeto.

---

### 🔐 Backend Microservices (Kotlin/Spring Boot)

#### Wave 1 - Foundational Services

| Service | Repository | Status | Port |
|---------|-----------|--------|------|
| 🔐 **Auth Service** | **[trainer-hub-auth-service](https://github.com/MateusO97/trainer-hub-auth-service)** | 🚧 **In Dev** | 8081 |
| 👤 **User Service** | **[trainer-hub-user-service](https://github.com/MateusO97/trainer-hub-user-service)** | 📝 Not Started | 8082 |
| 🍎 **Food DB Service** | **[trainer-hub-food-db-service](https://github.com/MateusO97/trainer-hub-food-db-service)** | 📝 Not Started | 8083 |

#### Wave 2 - Core Business Logic

| Service | Repository | Status | Port |
|---------|-----------|--------|------|
| 🍽️ **Meal Service** | **[trainer-hub-meal-service](https://github.com/MateusO97/trainer-hub-meal-service)** | 📝 Not Started | 8084 |
| 📊 **Nutrition Service** | **[trainer-hub-nutrition-service](https://github.com/MateusO97/trainer-hub-nutrition-service)** | 📝 Not Started | 8085 |
| 📈 **Tracking Service** | **[trainer-hub-tracking-service](https://github.com/MateusO97/trainer-hub-tracking-service)** | 📝 Not Started | 8086 |

#### Wave 3 - Advanced Features

| Service | Repository | Status | Port |
|---------|-----------|--------|------|
| 🤖 **AI Service** | **[trainer-hub-ai-service](https://github.com/MateusO97/trainer-hub-ai-service)** | 📝 Not Started | 8087 |
| 🔔 **Notification Service** | **[trainer-hub-notification-service](https://github.com/MateusO97/trainer-hub-notification-service)** | 📝 Not Started | 8088 |

#### Wave 4 - Infrastructure

| Service | Repository | Status | Port |
|---------|-----------|--------|------|
| 🌐 **API Gateway** | **[trainer-hub-gateway](https://github.com/MateusO97/trainer-hub-gateway)** | 📝 Not Started | 8080 |

---

### 📱 Client Applications

#### Wave 5 - Mobile

| Application | Repository | Status | Platform |
|------------|-----------|--------|----------|
| 📱 **Mobile App** | **[trainer-hub-mobile](https://github.com/MateusO97/trainer-hub-mobile)** | 📝 Not Started | iOS & Android |

---

### 📖 Complete Ecosystem Documentation

- **[REPOSITORIES.md](REPOSITORIES.md)** - Detailed overview of all repositories with features, APIs, dependencies
- **[API-CONTRACTS.md](docs/API-CONTRACTS.md)** - Communication contracts between microservices

---

## Quick Links

### 📐 Documentação de Arquitetura
- [01 - Visão do Produto](docs/01-VISION.md)
- [02 - Arquitetura de Microsserviços](docs/02-ARCHITECTURE.md)
- [03 - Stack Tecnológico](docs/03-TECH-STACK.md)
- [04 - Design de Banco de Dados](docs/04-DATABASE-DESIGN.md)
- [05 - Responsabilidades de Microsserviços](docs/05-MICROSERVICES.md)
- [06 - Fluxo de Dados](docs/06-DATA-FLOW.md)
- [07 - Estratégia de Message Broker](docs/07-MESSAGING-STRATEGY.md)
- [08 - Segurança](docs/08-SECURITY.md)
- [09 - Roadmap](docs/09-ROADMAP.md)

### ⚙️ Engineering Standards
- [📘 README - Engineering Standards](docs/INFRASTRUCTURE/README-ENGINEERING-STANDARDS.md) (START HERE!)
- [Git Workflow](docs/INFRASTRUCTURE/GIT-WORKFLOW.md)
- [Commit Standards](docs/INFRASTRUCTURE/COMMIT-STANDARDS.md)
- [PR Standards](docs/INFRASTRUCTURE/PR-STANDARDS.md)
- [Testing Strategy](docs/INFRASTRUCTURE/TESTING-STRATEGY.md)
- [Coding Standards](docs/INFRASTRUCTURE/CODING-STANDARDS.md)
- [**Code Styling & Linting**](docs/INFRASTRUCTURE/CODE-STYLING-LINTING.md) 🆕
- [**UI/UX Design System**](docs/INFRASTRUCTURE/UI-UX-DESIGN-SYSTEM.md) 🆕
- [Development Workflow](docs/INFRASTRUCTURE/DEVELOPMENT-WORKFLOW.md)
- [Issue Templates](docs/INFRASTRUCTURE/ISSUE-TEMPLATES.md)

### 🚀 Phase 2 - Implementation
- [📋 FASE-2 Plan](docs/FASE-2-PLAN.md) - 12-week roadmap
- [📊 FASE-2 Dashboard](docs/FASE-2/README.md) - Progress tracking
- [🔐 Auth Service Spec](docs/FASE-2/AUTH-SERVICE.md) - First service
- [⚙️ Microservice Scaffolding Skill](docs/SKILLS/MICROSERVICE-SCAFFOLDING.skill.md)

### 💬 RFCs (Request for Comments)
- [RFC-001: Sincronização de Macros](rfc/RFC-001-MACRO-SYNC.md)
- [RFC-002: Pipeline de IA para Alimentos](rfc/RFC-002-AI-FOOD-PIPELINE.md)
- [RFC-003: Cálculo de Macros](rfc/RFC-003-MACRO-CALCULATION.md)

## Stack Tecnológico

| Componente | Tecnologia |
|-----------|-----------|
| Backend | Kotlin + Spring Boot |
| Mobile | React Native (MVP) |
| Message Broker | RabbitMQ (MVP) → Kafka (future) |
| Database Principal | PostgreSQL |
| Database Logs/Analytics | MongoDB |
| Cache | Redis |
| IA APIs | OpenAI, Gemini, Nutritionix, USDA |
| Containerização | Docker |
| CI/CD | GitHub Actions |
| Versionamento | Semantic Versioning |

## Fases do Projeto

### Fase 1: Planejamento Estratégico e Arquitetura (1-2 semanas) ✅ COMPLETO
Documentação completa, validação de arquitetura, decisões técnicas, engineering standards.

### Fase 2: Implementação de Microsserviços (12 semanas) 🏗️ EM ANDAMENTO
Desenvolvimento dos 10 microsserviços + mobile app. Ver [FASE-2-PLAN.md](docs/FASE-2-PLAN.md).

### Fase 3: Deploy e Lançamento (2-3 semanas)
Infraestrutura, CI/CD, monitoramento, testes finais.

---

## 🚀 Quick Start

### Desenvolvedores

**Backend Team**:
```bash
# 1. Instalar ferramentas
brew install openjdk@17 gradle

# 2. Setup git hooks
npm install
npm run prepare

# 3. Verificar code style
./gradlew ktlintCheck
./gradlew ktlintFormat  # Auto-fix
```

**Frontend Team**:
```bash
# 1. Instalar dependências
cd mobile
npm install

# 2. Setup git hooks (já configurado na raiz)
# npm install (já feito no passo 1)

# 3. Verificar code style
npm run lint
npm run format  # Auto-fix
npm run type-check
```

### Time de Desenvolvimento

**Onboarding Path** (1 semana):
1. Ler [README-ENGINEERING-STANDARDS.md](docs/INFRASTRUCTURE/README-ENGINEERING-STANDARDS.md) (30 min)
2. Ler standards relevantes ao seu papel (Backend, Mobile, DevOps - ~2h)
3. Setup ambiente local (git hooks, linters, IDE - 1h)
4. Explorar código base do primeiro serviço (Auth Service - 2h)
5. Fazer primeiro commit seguindo padrões

---

## 🔧 Automação & Qualidade

### Linting Automático

✅ **Pre-commit Hooks**:
- ktlint auto-format (Backend)
- ESLint + Prettier (Frontend)
- commitlint (validação de mensagens)

✅ **GitHub Actions**:
- Lint check em todos os PRs
- Auto-format em feature branches
- Type checking (TypeScript)
- Relatórios de qualidade

### Code Quality Metrics

| Métrica | Target | Enforcement |
|---------|--------|-------------|
| Code Coverage | ≥ 80% | CI/CD bloqueio |
| ktlint | 0 issues | Pre-commit |
| ESLint | 0 errors | Pre-commit |
| TypeScript | 0 type errors | CI/CD |
| Detekt | 0 issues | CI/CD warning |

---

## Contato e Perguntas

Abra issues em GitHub para discussões arquiteturais.

---

**Última atualização**: Março 2026
