# FASE 2: Implementação dos Microserviços

**Status**: Iniciando  
**Data**: Março 8, 2026  
**Owner**: Arquitetura + Tech Lead  

---

## 📋 Resumo Executivo

Fase 2 vai implementar os **10 microserviços** definidos em Fase 1, seguindo:
- ✅ Arquitetura do **02-ARCHITECTURE.md**
- ✅ Padrões de código do **CODING-STANDARDS.md**
- ✅ Fluxo git do **GIT-WORKFLOW.md**
- ✅ Templates de issue do **ISSUE-TEMPLATES.md** (AI-optimized)
- ✅ Estratégia de testing do **TESTING-STRATEGY.md**

**Resultado final**: 10 serviços Kotlin Spring Boot 3.2+, 100% testados, deployáveis em produção

---

## 🎯 Sequência de Implementação (Dependency Order)

### Wave 1: Foundation (Semanas 1-3)
Serviços que são bases para outros. Sem dependências internas.

| # | Serviço | Prioridade | Dependências | Estimativa | Owner |
|----|---------|-----------|--------------|-----------|-------|
| 1️⃣ | **Auth Service** | CRÍTICA | Nenhuma | 2 weeks | Backend Lead |
| 2️⃣ | **User Service** | CRÍTICA | Auth | 2 weeks | Backend |
| 3️⃣ | **Food Database Service** | ALTA | Nenhuma | 2 weeks | Backend |

**Por que esta ordem?**
- Auth é dependency de 100% dos outros (OAuth2 + JWT + RBAC)
- User depende de Auth (autenticação)
- Food Database é standalone e pode ser paralelo com Auth

### Wave 2: Core Features (Semanas 4-6)
Features principais que dependem de Wave 1

| # | Serviço | Prioridade | Dependências | Estimativa | Owner |
|----|---------|-----------|--------------|-----------|-------|
| 4️⃣ | **Meal Service** | CRÍTICA | Auth, User, Food | 3 weeks | Backend |
| 5️⃣ | **Nutrition Service** | ALTA | Auth, Meal, Food | 2.5 weeks | Backend |
| 6️⃣ | **Tracking Service** | ALTA | Auth, User, Meal | 2.5 weeks | Backend |

### Wave 3: Advanced (Semanas 7-9)
Features avançadas + integrações externas

| # | Serviço | Prioridade | Dependências | Estimativa | Owner |
|----|---------|-----------|--------------|-----------|-------|
| 7️⃣ | **AI Service** | MÉDIA | Food, Nutrition | 3 weeks | ML Engineer |
| 8️⃣ | **Notification Service** | MÉDIA | Auth, User, Meal | 2 weeks | Backend |
| 9️⃣ | **Gateway Service** | CRÍTICA | Auth, all services | 2 weeks | Backend/DevOps |

### Wave 4: Mobile Support (Semanas 10-12)
React Native mobile app

| # | Serviço | Prioridade | Dependências | Estimativa | Owner |
|----|---------|-----------|--------------|-----------|-------|
| 🔟 | **Mobile App** | ALTA | Gateway, all services | 4 weeks | Mobile Lead |

---

## 📊 Timeline Detalhado

```
Week 1-3 (Foundation)
├─ Auth Service (backend team 1)
├─ User Service (backend team 2)  
├─ Food DB Service (backend team 1 parallel)
└─ Review & refine

Week 4-6 (Core Features)
├─ Meal Service (backend team 1)
├─ Nutrition Service (backend team 2)
├─ Tracking Service (backend + nutritionist)
└─ Integration testing

Week 7-9 (Advanced)
├─ AI Service (ML engineer)
├─ Notification Service (backend team)
├─ Gateway Service (infrastructure)
└─ E2E testing across services

Week 10-12 (Mobile)
├─ React Native mobile app setup
├─ Integration with Gateway
├─ User acceptance testing
└─ Beta release

Total: 12 weeks (3 months) to MVP
```

---

## 🛠️ Como Implementar Cada Serviço

### Template Padrão (Para cada serviço)

**Passo 1**: Criar issue feature (ISSUE-TEMPLATES.md)
```
[FEATURE] auth: implement OAuth2 + JWT authentication

OBJECTIVE: Implement OAuth2 flow with JWT token generation for all users
ACCEPTANCE CRITERIA:
  - [ ] POST /auth/login accepts email+password or OAuth provider
  - [ ] Returns JWT token + refresh token in response
  - [ ] Token valid for 1 hour, refresh for 7 days
  - [ ] All tests passing (≥80% coverage)
  - [ ] API docs updated

ACCEPTANCE CRITERIA (... veja ISSUE-TEMPLATES.md para template completo)
```

**Passo 2**: Criar branch feature
```bash
git checkout -b feature/AUTH-001-oauth2-jwt
```

**Passo 3**: Usar SKILL para gerar scaffolding
```bash
# (Veja MICROSERVICE-SCAFFOLDING.skill.md)
# Gera: build.gradle.kts, entity classes, service, controller, testes
```

**Passo 4**: Implementar funcionalidade
- Controller + DTOs
- Service (business logic)
- Repository (database)
- Tests (unit + integration)
- Documentation

**Passo 5**: Validar contra standards
```bash
./gradlew ktlintFormat     # Code style
./gradlew test             # Tests (≥80%)
./gradlew integrationTest  # Full integration
```

**Passo 6**: Commit com Conventional Commits
```bash
git commit -m "feat(auth): implement OAuth2 + JWT authentication

- Add POST /auth/login endpoint
- Generate JWT token (1h expiry) + refresh token (7d expiry)
- Implement OAuth2 provider integration (Google, Apple)
- Add AuthenticationFilter middleware
- 89% test coverage

Closes #AUTH-001"
```

**Passo 7**: Create PR
```bash
# Via GitHub CLI ou web UI
# Title: [AUTH] Implement OAuth2 + JWT authentication
# Description: Checklist of acceptance criteria
```

**Passo 8**: Code review → Merge → Deploy

---

## 📚 Deliverables por Serviço

Cada serviço deve entregar:

### Code
- ✅ Controllers (REST endpoints)
- ✅ Services (business logic)
- ✅ Repositories (database layer)
- ✅ Entities (domain models)
- ✅ DTOs (API contracts)
- ✅ Exceptions (error handling)

### Tests
- ✅ Unit tests (service logic)
- ✅ Integration tests (with DB)
- ✅ E2E tests (controller endpoints)
- ✅ Coverage ≥ 80%

### Documentation
- ✅ API endpoints (OpenAPI/Swagger)
- ✅ Domain model diagram
- ✅ Deployment guide
- ✅ README with setup instructions

### DevOps
- ✅ Dockerfile
- ✅ docker-compose.yml
- ✅ Kubernetes manifests (optional)
- ✅ GitHub Actions CI/CD

---

## 🚀 Próximas Ações (Hoje)

### 1. Criar SKILL: Microservice Scaffolding
Arquivo: `docs/SKILLS/MICROSERVICE-SCAFFOLDING.skill.md`

Função:
- Gera estrutura padrão de microserviço
- Cria controllers, services, repositories com boilerplate
- Gera testes básicos
- Usa padrões do projeto (Clean Architecture, SOLID, ...)

Exemplo:
```bash
# Executa skill 
# Pergunta: Nome do serviço? (auth, user, meal, ...)
# Gera: /src/main/kotlin/com/trainerhubamd/{service}/
#       - controller/, service/, repository/, entity/, dto/
#       - build.gradle.kts
#       - tests/
#       - Dockerfile
#       - README.md
```

### 2. Criar ISSUE: Auth Service (Wave 1)
```
[FEATURE] auth: implement OAuth2 + JWT authentication

OBJETIVO: Sistema de autenticação robusto
- OAuth2 com Google, Apple, Email
- JWT tokens (1h access, 7d refresh)
- RBAC com 4 roles
- Audit log de login/logout
```

### 3. Iniciar implementação Auth Service
- Usar SKILL para scaffolding
- Seguir patterns de CODING-STANDARDS.md
- Commits em português (Conventional + PT)
- Validação contra standards

---

## 📌 Padrões que Iremos Seguir

**Todos os serviços devem implementar**:

✅ **Arquitetura**: Clean Architecture, 3 layers (controller → service → repo)  
✅ **Testes**: Unit (60%), Integration (30%), E2E (10%), Coverage ≥80%  
✅ **Código**: SOLID, Kotlin idioms, naming conventions, error handling  
✅ **Git**: Git Flow, feature branches, Conventional Commits  
✅ **PRs**: Checklists, code reviews, max 5 days para merge  
✅ **Docs**: API docs, README, deployment guide  
✅ **DevOps**: Docker, CI/CD, environment configs  

---

## ✅ Success Criteria for Fase 2

**Fim de Fase 2** (semana 12):
- ✅ 10 microserviços implementados
- ✅ 100% teste coverage (unit + integration)
- ✅ Todos serviços deployáveis
- ✅ Mobile app funcional
- ✅ Zero regressions
- ✅ Team trained em padrões
- ✅ Production-ready code
- ✅ Full documentation

**Métricas**:
- Build time: < 3 min
- Test suite: < 10 min
- Code coverage: ≥ 80%
- PR review time: < 24h
- Bug rate: < 1 per 100 LOC

---

## 📺 Como Começamos

**Hoje (Março 8, 2026)**:
1. ✅ Create this FASE-2-PLAN.md (você está lendo)
2. ⏳ Create MICROSERVICE-SCAFFOLDING.skill.md
3. ⏳ Create [FEATURE] Auth Service issue
4. ⏳ Start Auth Service implementation

**Em 2 horas**:
- Auth Service scaffolding gerado
- Primeiros commits feitos
- PR criado para review

**Em 2 semanas**:
- Auth Service completo + tested
- User Service iniciado
- Wave 1 completa

---

## 📖 Referências

**Documentos importantes**:
- [02-ARCHITECTURE.md](02-ARCHITECTURE.md) - System design
- [05-MICROSERVICES.md](05-MICROSERVICES.md) - Service specs
- [CODING-STANDARDS.md](INFRASTRUCTURE/CODING-STANDARDS.md) - Code patterns
- [TESTING-STRATEGY.md](INFRASTRUCTURE/TESTING-STRATEGY.md) - How to test
- [DEVELOPMENT-WORKFLOW.md](INFRASTRUCTURE/DEVELOPMENT-WORKFLOW.md) - Daily tasks
- [ISSUE-TEMPLATES.md](INFRASTRUCTURE/ISSUE-TEMPLATES.md) - How to write issues

---

## 🎯 Goals Altos

💪 **Build Trainer Hub MVP in 3 months**  
🚀 **Deploy to production by end Q2**  
📱 **Mobile app available on iOS + Android**  
✨ **Users tracking meals + macros in real-time**  
🎓 **Trainers seeing client progress instantly**  

Let's build! 💙
