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

### Fase 1: Planejamento Estratégico e Arquitetura (1-2 semanas)
Documentação completa, validação de arquitetura, decisões técnicas.

### Fase 2: Preparação e Estrutura de Repositórios (1 semana)
Setup de repos para cada microsserviço, documentação específica.

### Fase 3: Desenvolvimento Incremental (8-12 semanas)
Desenvolvimento dos microsserviços em ordem de dependência.

### Fase 4: Deploy e Lançamento (2-3 semanas)
Infraestrutura, CI/CD, monitoramento, testes finais.

## Contato e Perguntas

Abra issues em GitHub para discussões arquiteturais.

---

**Última atualização**: Março 2026
