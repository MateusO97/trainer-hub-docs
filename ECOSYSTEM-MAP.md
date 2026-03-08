# 🗺️ Trainer Hub - Ecosystem Map

Visual representation of the complete Trainer Hub architecture and repository structure.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        📚 TRAINER HUB ECOSYSTEM                           │
│                     https://github.com/MateusO97                         │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌────────────────┐
                              │   📖 Docs Hub  │
                              │  trainer-hub-  │
                              │     docs       │
                              └────────┬───────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
         ┌──────────▼──────────┐   ┌──▼──────────┐   ┌──▼──────────┐
         │  📐 Architecture    │   │ ⚙️ Standards │   │ 🚀 Phase 2  │
         │  - Vision           │   │ - Git        │   │ - Roadmap   │
         │  - Tech Stack       │   │ - Testing    │   │ - Auth Spec │
         │  - Database         │   │ - Linting    │   │ - Skills    │
         │  - Security         │   │ - UI/UX      │   │             │
         └─────────────────────┘   └──────────────┘   └─────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         🏗️ MICROSERVICES LAYER                           │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  📱 CLIENT LAYER                                                          │
└───────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────┐
                        │   📱 Mobile App     │
                        │  trainer-hub-mobile │
                        │  React Native       │
                        │  iOS & Android      │
                        └──────────┬──────────┘
                                   │
                                   │ HTTP/JSON
                                   │
┌──────────────────────────────────▼───────────────────────────────────────┐
│  🌐 API GATEWAY LAYER                                                     │
└───────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────┐
                        │   🌐 API Gateway    │
                        │  trainer-hub-gateway│
                        │  Spring Cloud       │
                        │  Port: 8080         │
                        └──────────┬──────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      │                            │                            │
┌─────▼─────────────────────────────────────────────────────────▼─────────┐
│  🔐 BACKEND MICROSERVICES (Kotlin/Spring Boot)                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  WAVE 1 - Foundational Services (No Dependencies)                       │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  🔐 Auth        │    │  👤 User        │    │  🍎 Food DB     │
    │  Service        │    │  Service        │    │  Service        │
    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
    │ Port: 8081      │    │ Port: 8082      │    │ Port: 8083      │
    │ JWT + OAuth2    │    │ Profiles        │    │ Food Database   │
    │ RBAC            │    │ Preferences     │    │ Nutrition Info  │
    │ 🚧 In Dev       │    │ 📝 Not Started  │    │ 📝 Not Started  │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
            │                       │                       │
            │                       └───────┬───────────────┘
            │                               │
            └───────────────┬───────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────────┐
│  WAVE 2 - Core Business Logic (Depends on Wave 1)                       │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  🍽️ Meal        │    │  📊 Nutrition   │    │  📈 Tracking    │
    │  Service        │    │  Service        │    │  Service        │
    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
    │ Port: 8084      │    │ Port: 8085      │    │ Port: 8086      │
    │ Meal Logging    │    │ Goals Calc      │    │ Weight Tracking │
    │ Meal Plans      │    │ Daily Summary   │    │ Progress Report │
    │ 📝 Not Started  │    │ 📝 Not Started  │    │ 📝 Not Started  │
    └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
             │                      │                       │
             └──────────┬───────────┴───────────┬───────────┘
                        │                       │
┌───────────────────────▼───────────────────────▼───────────────────────────┐
│  WAVE 3 - Advanced Features (Depends on Waves 1 & 2)                     │
└───────────────────────────────────────────────────────────────────────────┘

         ┌─────────────────────┐         ┌─────────────────────┐
         │  🤖 AI Service      │         │  🔔 Notification    │
         │                     │         │  Service            │
         ├─────────────────────┤         ├─────────────────────┤
         │ Port: 8087          │         │ Port: 8088          │
         │ Python + FastAPI    │         │ Push + Email + SMS  │
         │ ML Models           │         │ Reminders           │
         │ Food Recognition    │         │ Scheduled Jobs      │
         │ Recommendations     │         │ 📝 Not Started      │
         │ 📝 Not Started      │         └─────────────────────┘
         └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📦 DATA LAYER                                                            │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  🗄️ PostgreSQL   │    │  🔥 Redis       │    │  🐰 RabbitMQ    │
    │  Primary DB     │    │  Cache + Queue  │    │  Event Bus      │
    │  Per Service    │    │  Shared         │    │  Async Msgs     │
    └─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📡 EVENT-DRIVEN COMMUNICATION (RabbitMQ)                                │
└─────────────────────────────────────────────────────────────────────────┘

    🍽️ Meal Service ──────► meal.logged ──────► 📊 Nutrition Service
              │                                       📈 Tracking Service
              │                                       🤖 AI Service
              │
              └──────────► meal.reminder ─────────► 🔔 Notification Service

    📈 Tracking Service ──► weight.logged ─────► 🤖 AI Service
                                                  🔔 Notification Service

    🤖 AI Service ────────► goal.achieved ─────► 🔔 Notification Service
                                                  👤 User Service

┌─────────────────────────────────────────────────────────────────────────┐
│  🛠️ INFRASTRUCTURE & DEVOPS                                              │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  🐙 GitHub      │    │  🐳 Docker      │    │  ☸️ Kubernetes   │
    │  Source Control │    │  Containers     │    │  Orchestration  │
    │  CI/CD Actions  │    │  Compose (Dev)  │    │  Production     │
    └─────────────────┘    └─────────────────┘    └─────────────────┘

    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  📊 Prometheus  │    │  📈 Grafana     │    │  🔍 Jaeger      │
    │  Metrics        │    │  Dashboards     │    │  Tracing        │
    └─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🔐 SECURITY & COMPLIANCE                                                │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────┐
    │  • JWT Tokens (RS256 signature)                                 │
    │  • OAuth2 (Google, Apple Sign-In)                               │
    │  • Service-to-Service API Keys                                  │
    │  • RBAC (4 roles: USER, NUTRITIONIST, TRAINER, ADMIN)          │
    │  • Rate Limiting (1000 req/hour per user)                       │
    │  • HTTPS/TLS everywhere                                         │
    │  • CORS configuration                                           │
    │  • Audit logging (all auth events)                              │
    └─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📊 IMPLEMENTATION STATUS                                                │
└─────────────────────────────────────────────────────────────────────────┘

    Wave 1 (Weeks 1-2):   █████░░░░░░░░░ 33% (Auth Service in dev)
    Wave 2 (Weeks 3-5):   ░░░░░░░░░░░░░   0% (Not started)
    Wave 3 (Weeks 6-8):   ░░░░░░░░░░░░░   0% (Not started)
    Wave 4 (Weeks 9-10):  ░░░░░░░░░░░░░   0% (Not started)
    Wave 5 (Weeks 11-15): ░░░░░░░░░░░░░   0% (Not started)

    Overall Progress:     ████░░░░░░░░░  7% (1 of 11 services started)

┌─────────────────────────────────────────────────────────────────────────┐
│  📚 REPOSITORY LINKS                                                     │
└─────────────────────────────────────────────────────────────────────────┘

    📖 Documentation:
       https://github.com/MateusO97/trainer-hub-docs

    🔐 Backend Microservices:
       https://github.com/MateusO97/trainer-hub-auth-service        🚧
       https://github.com/MateusO97/trainer-hub-user-service        📝
       https://github.com/MateusO97/trainer-hub-food-db-service     📝
       https://github.com/MateusO97/trainer-hub-meal-service        📝
       https://github.com/MateusO97/trainer-hub-nutrition-service   📝
       https://github.com/MateusO97/trainer-hub-tracking-service    📝
       https://github.com/MateusO97/trainer-hub-ai-service          📝
       https://github.com/MateusO97/trainer-hub-notification-service 📝

    🌐 Infrastructure:
       https://github.com/MateusO97/trainer-hub-gateway             📝

    📱 Client:
       https://github.com/MateusO97/trainer-hub-mobile              📝

    Legend: 🚧 In Development | 📝 Not Started | ✅ Complete

┌─────────────────────────────────────────────────────────────────────────┐
│  🔗 QUICK ACCESS                                                         │
└─────────────────────────────────────────────────────────────────────────┘

    📋 All Repositories:
       https://github.com/MateusO97?tab=repositories&q=trainer-hub

    📖 Complete Documentation:
       README.md         - Overview
       NAVIGATION.md     - Quick navigation guide
       REPOSITORIES.md   - Detailed repository info
       API-CONTRACTS.md  - Service communication contracts

    🚀 Implementation Guides:
       docs/FASE-2-PLAN.md              - 12-week roadmap
       docs/FASE-2/AUTH-SERVICE.md      - Auth Service spec
       docs/INFRASTRUCTURE/             - All standards

┌─────────────────────────────────────────────────────────────────────────┐
│  👥 TEAM & CONTACT                                                       │
└─────────────────────────────────────────────────────────────────────────┘

    Maintainer: Mateus de Oliveira Barbosa
    GitHub:     @MateusO97
    License:    MIT License (all repositories)

───────────────────────────────────────────────────────────────────────────

                    Built with ❤️ for nutritionists and users
                          seeking healthier lifestyles

───────────────────────────────────────────────────────────────────────────
```

## Navigation Tips

1. **Start Here**: [README.md](README.md) for project overview
2. **Architecture**: [docs/01-VISION.md](docs/01-VISION.md) for system design
3. **Implementation**: [docs/FASE-2-PLAN.md](docs/FASE-2-PLAN.md) for roadmap
4. **Standards**: [docs/INFRASTRUCTURE/](docs/INFRASTRUCTURE/) for guidelines
5. **APIs**: [docs/API-CONTRACTS.md](docs/API-CONTRACTS.md) for contracts

## Service Dependencies

```
Auth Service (no deps)
    ↓
User Service, Food DB Service (depend on Auth)
    ↓
Meal Service, Nutrition Service, Tracking Service (depend on User + Food DB)
    ↓
AI Service, Notification Service (depend on all above)
    ↓
Gateway Service (depend on all backend services)
    ↓
Mobile App (depend on Gateway)
```

## Development Flow

1. **Clone repositories** (see [NAVIGATION.md](NAVIGATION.md))
2. **Read standards** (Engineering Standards section)
3. **Check API contracts** (API-CONTRACTS.md)
4. **Implement service** (follow Phase 2 plan)
5. **Create PR** (follow PR standards)
6. **Code review** (minimum 1 approval)
7. **CI/CD passes** (linting + tests)
8. **Merge & deploy**

---

**Last Updated**: 2024-03-08
