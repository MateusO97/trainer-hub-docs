# TrAIner Hub - Documentação

Plataforma inteligente de planejamento e acompanhamento de dietas com IA.

## Quick Links

### Documentação de Arquitetura
- [01 - Visão do Produto](docs/01-VISION.md)
- [02 - Arquitetura de Microsserviços](docs/02-ARCHITECTURE.md)
- [03 - Stack Tecnológico](docs/03-TECH-STACK.md)
- [04 - Design de Banco de Dados](docs/04-DATABASE-DESIGN.md)
- [05 - Responsabilidades de Microsserviços](docs/05-MICROSERVICES.md)
- [06 - Fluxo de Dados](docs/06-DATA-FLOW.md)
- [07 - Estratégia de Message Broker](docs/07-MESSAGING-STRATEGY.md)
- [08 - Segurança](docs/08-SECURITY.md)
- [09 - Roadmap](docs/09-ROADMAP.md)

### Engineering Standards
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

### Phase 2 - Implementation
- [📋 FASE-2 Plan](docs/FASE-2-PLAN.md) - 12-week roadmap
- [📊 FASE-2 Dashboard](docs/FASE-2/README.md) - Progress tracking
- [🔐 Auth Service Spec](docs/FASE-2/AUTH-SERVICE.md) - First service
- [⚙️ Microservice Scaffolding Skill](docs/SKILLS/MICROSERVICE-SCAFFOLDING.skill.md)

### RFCs (Request for Comments)
- [RFC-001: Sincronização de Macros](rfc/RFC-001-MACRO-SYNC.md)
- [RFC-002: Pipeline de IA para Alimentos](rfc/RFC-002-AI-FOOD-PIPELINE.md)
- [RFC-003: Cálculo de Macros](rfc/RFC-003-MACRO-CALCULATION.md)

## Estrutura de Repositórios

Todos os microsserviços têm repositórios separados:
- trainer-hub-auth-service
- trainer-hub-user-service
- trainer-hub-meal-plan-service
- trainer-hub-meal-service
- trainer-hub-food-service
- trainer-hub-nutrition-service
- trainer-hub-tracking-service
- trainer-hub-notification-service
- trainer-hub-ai-service
- trainer-hub-gateway
- trainer-hub-mobile

## Microsserviços Identificados

### 10 Serviços
1. **auth-service** - Autenticação e autorização (OAuth2, JWT)
2. **user-service** - Gerenciamento de perfis, preferências, dados do usuário
3. **meal-plan-service** - Planos alimentares, rotinas, refeições planejadas
4. **meal-service** - Registro de refeições consumidas, histórico
5. **food-service** - CRUD de alimentos, busca, cache, integração com APIs externas
6. **nutrition-service** - Cálculos de macros, análises nutricionais
7. **tracking-service** - Monitoramento diário, relatórios, gráficos
8. **notification-service** - Notificações, lembretes, alertas
9. **ai-service** - Orquestração de modelos de IA para sugestões e otimizações
10. **gateway-service** - API Gateway, roteamento, rate limiting

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
