# TrAIner Hub - Documentação














































































































































































































































































































































**Maintainer**: Mateus de Oliveira Barbosa ([@MateusO97](https://github.com/MateusO97))**Last Updated**: 2024-03-08  ---All repositories: MIT License## 📄 License---See [Git Workflow](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/INFRASTRUCTURE/GIT-WORKFLOW.md) for details.- OpenAPI documentation updated- Minimum 80% test coverage- CI/CD must pass (linting, tests, build)- All PRs require code review- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`Each repository follows the same standards:## 🤝 Contributing---- **Code Styling Guide**: [docs/INFRASTRUCTURE/CODE-STYLING-LINTING.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/INFRASTRUCTURE/CODE-STYLING-LINTING.md)- **UI/UX Design System**: [docs/INFRASTRUCTURE/UI-UX-DESIGN-SYSTEM.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/INFRASTRUCTURE/UI-UX-DESIGN-SYSTEM.md)- **Engineering Standards**: [docs/INFRASTRUCTURE/README-ENGINEERING-STANDARDS.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/INFRASTRUCTURE/README-ENGINEERING-STANDARDS.md)- **API Contracts**: [docs/API-CONTRACTS.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/API-CONTRACTS.md)- **Microservices Spec**: [docs/05-MICROSERVICES.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/05-MICROSERVICES.md)- **Architecture Overview**: [docs/01-VISION.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/01-VISION.md)## 📖 Documentation Resources---```open https://github.com/MateusO97?tab=repositories&q=trainer-hub```bash### View All Repositories```git clone https://github.com/MateusO97/trainer-hub-mobile.git# Clone mobile appgit clone https://github.com/MateusO97/trainer-hub-gateway.gitgit clone https://github.com/MateusO97/trainer-hub-notification-service.gitgit clone https://github.com/MateusO97/trainer-hub-ai-service.gitgit clone https://github.com/MateusO97/trainer-hub-tracking-service.gitgit clone https://github.com/MateusO97/trainer-hub-nutrition-service.gitgit clone https://github.com/MateusO97/trainer-hub-meal-service.gitgit clone https://github.com/MateusO97/trainer-hub-food-db-service.gitgit clone https://github.com/MateusO97/trainer-hub-user-service.gitgit clone https://github.com/MateusO97/trainer-hub-auth-service.git# Clone backend servicesgit clone https://github.com/MateusO97/trainer-hub-docs.git# Clone documentation```bash### Clone All Repositories## 🔗 Quick Commands---| Wave 5 | Mobile App | 📝 Not Started | Weeks 11-15 || Wave 4 | Gateway | 📝 Not Started | Weeks 9-10 || Wave 3 | AI, Notification | 📝 Not Started | Weeks 6-8 || Wave 2 | Meal, Nutrition, Tracking | 📝 Not Started | Weeks 3-5 || Wave 1 | Auth, User, Food DB | 🚧 Auth In Dev | Weeks 1-2 ||------|----------|--------|----------|| Wave | Services | Status | Timeline |## 📊 Implementation Status---```Meal Service     → meal.reminder   → NotificationAI Service       → goal.achieved   → NotificationTracking Service → weight.logged   → AI, NotificationMeal Service     → meal.logged     → Nutrition, Tracking, AI```### Asynchronous (RabbitMQ Events)```Gateway → Auth Service (token validation)Mobile App → Gateway → Backend Microservices```### Synchronous (REST APIs)## 🔄 Communication Patterns---- React Native Charts- React Native Camera- React Navigation- Redux Toolkit- TypeScript- React Native 0.73**Tech Stack**:**Dependencies**: Gateway Service (all API calls)- Offline mode (cached data)- Dark mode support- Meal reminders- Push notifications- Progress photos- Weight tracking with charts- Nutritional goals & tracking- AI food recognition- Meal logging with camera- Food search & database- Profile management- User authentication (email, Google, Apple Sign-In)**Features**:Cross-platform mobile application.**Status**: 📝 Not Started | **Platform**: iOS & Android | **Language**: React Native + TypeScript#### [📱 Mobile App](https://github.com/MateusO97/trainer-hub-mobile)### Wave 5 - Client Application (Depends on Gateway)---```/api/v1/notifications/** → Notification Service (8088)/api/v1/ai/**         → AI Service (8087)/api/v1/tracking/**   → Tracking Service (8086)/api/v1/nutrition/**  → Nutrition Service (8085)/api/v1/meals/**      → Meal Service (8084)/api/v1/foods/**      → Food DB Service (8083)/api/v1/users/**      → User Service (8082)/api/v1/auth/**       → Auth Service (8081)```**Routes**:**Dependencies**: Auth Service (token validation)- API versioning support- Circuit breaker (Resilience4j)- Request/response logging- CORS configuration- Rate limiting (per user, per IP)- JWT token validation (via Auth Service)- API routing to backend microservices**Features**:Single entry point for all API requests with routing and authentication.**Status**: 📝 Not Started | **Port**: 8080 | **Language**: Kotlin + Spring Cloud Gateway#### [🌐 API Gateway](https://github.com/MateusO97/trainer-hub-gateway)### Wave 4 - Infrastructure (Depends on All Backend Services)---**Events**: Consumes `meal.reminder`, `weight.logged`, `goal.achieved`**Dependencies**: Auth Service, User Service- Meal reminders (scheduled jobs)- User notification preferences- Notification history & read receipts- Notification scheduling- SMS notifications (Twilio)- Email notifications (SendGrid/AWS SES)- Push notifications (iOS, Android via FCM)**Features**:Push notifications, emails, and SMS delivery.**Status**: 📝 Not Started | **Port**: 8088 | **Language**: Kotlin + Spring Boot#### [🔔 Notification Service](https://github.com/MateusO97/trainer-hub-notification-service)---**Events**: Publishes `goal.achieved`, consumes `meal.logged`, `weight.logged`**Dependencies**: Auth Service, User Service, Food DB Service, Meal Service, Tracking Service- Anomaly detection- Nutritional pattern analysis- Goal achievement predictions- Portion size estimation- Food photo recognition (ML models)- Meal recommendations (personalized suggestions)**Features**:AI-powered recommendations and food photo recognition.**Status**: 📝 Not Started | **Port**: 8087 | **Language**: Python + FastAPI#### [🤖 AI Service](https://github.com/MateusO97/trainer-hub-ai-service)### Wave 3 - Advanced Features (Depends on Waves 1 & 2)---**Events**: Publishes `weight.logged`, consumes `meal.logged`**Dependencies**: Auth Service, User Service- Progress reports & charts- Streaks & achievements- Goal progress tracking- Progress photos- Body measurements (waist, chest, arms, etc.)- Weight logging with trends**Features**:Weight tracking, body measurements, and progress reporting.**Status**: 📝 Not Started | **Port**: 8086 | **Language**: Kotlin + Spring Boot#### [📈 Tracking Service](https://github.com/MateusO97/trainer-hub-tracking-service)---**Events**: Consumes `meal.logged`**Dependencies**: Auth Service, User Service, Meal Service- Micronutrient analysis- Adherence tracking- Macro distribution analysis- Weekly/monthly reports- Daily nutritional summaries- Nutritional goals calculation (BMR, TDEE, macros)**Features**:Nutritional analysis, goals calculation, and summaries.**Status**: 📝 Not Started | **Port**: 8085 | **Language**: Kotlin + Spring Boot#### [📊 Nutrition Service](https://github.com/MateusO97/trainer-hub-nutrition-service)---**Events**: Publishes `meal.logged`, `meal.reminder`**Dependencies**: Auth Service, User Service, Food DB Service- Scheduled meal reminders- Quick logging from recent meals- Meal templates & favorites- Meal plans (created by nutritionists)- Photo upload & attachment- Meal logging (breakfast, lunch, dinner, snacks)**Features**:Meal logging, planning, and tracking.**Status**: 📝 Not Started | **Port**: 8084 | **Language**: Kotlin + Spring Boot#### [🍽️ Meal Service](https://github.com/MateusO97/trainer-hub-meal-service)### Wave 2 - Core Business Logic (Depends on Wave 1)---**Dependencies**: Auth Service- Food verification system- User-created custom foods- Multiple serving units support- Nutritional information (macros, micros, vitamins, minerals)- Advanced search (name, brand, category, barcode)- Food database (USDA, TACO, custom foods)**Features**:Comprehensive food database with nutritional information.**Status**: 📝 Not Started | **Port**: 8083 | **Language**: Kotlin + Spring Boot#### [🍎 Food DB Service](https://github.com/MateusO97/trainer-hub-food-db-service)---**Dependencies**: Auth Service (token validation)- Activity level tracking- Notification settings- Goals & targets configuration- User preferences (diet type, restrictions, allergies)- User profile management (personal info, physical data)**Features**:User profiles, preferences, and settings management.**Status**: 📝 Not Started | **Port**: 8082 | **Language**: Kotlin + Spring Boot#### [👤 User Service](https://github.com/MateusO97/trainer-hub-user-service)---**Issues**: [11 functional requirements](https://github.com/MateusO97/trainer-hub-auth-service/issues)- Audit logging- Role-based access control (4 roles)- Password reset- Refresh token flow- JWT token generation (RS256)- OAuth2 (Google, Apple Sign-In)- Email + password authentication**Features**:Authentication & authorization service with OAuth2, JWT, and RBAC.**Status**: 🚧 In Development | **Port**: 8081 | **Language**: Kotlin + Spring Boot#### [🔐 Auth Service](https://github.com/MateusO97/trainer-hub-auth-service)### Wave 1 - Foundational Services (No Dependencies)## 🏗️ Backend Microservices---- [FASE-2-PLAN.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/FASE-2-PLAN.md) - 12-week implementation plan- [API-CONTRACTS.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/docs/API-CONTRACTS.md) - Service communication contracts- [REPOSITORIES.md](https://github.com/MateusO97/trainer-hub-docs/blob/master/REPOSITORIES.md) - Complete ecosystem overview**Key Documents**:- RFCs and technical specifications- Phase 2 implementation roadmap- API contracts & communication patterns- Engineering standards & guidelines- Architecture decisions (ADRs)**Central documentation repository**### [📖 trainer-hub-docs](https://github.com/MateusO97/trainer-hub-docs) ## 📚 Documentation & Standards---Quick access to all repositories in the Trainer Hub ecosystem.Plataforma inteligente de planejamento e acompanhamento de dietas com IA.

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
