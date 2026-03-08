# Pull Request Standards & Code Review Guidelines

**Document ID**: PR-STANDARDS-001  
**Version**: 1.0  
**Created**: March 8, 2026  
**Owner**: QA Lead / Engineering Manager

---

## 📋 Executive Summary

Este documento padroniza **Pull Requests** e **Code Review** para garantir:

✅ PRs claros e auto-explicativos  
✅ Processo de review justo e educacional  
✅ Merges apenas de código de qualidade  
✅ Feedback construtivo e rápido  
✅ Histórico rastreável de decisões  

---

## 📝 PR Template Padrão

Usar template abaixo em **`.github/pull_request_template.md`**:

```markdown
## 🎯 Objetivo
<!-- Descrição clara do que esta PR faz (1 parágrafo) -->

## 📝 Descrição Detalhada
<!-- Explicar contexto, decisões, trade-offs -->

## 📋 Checklist
- [ ] Testes unitários adicionados
- [ ] Testes integração executados
- [ ] Cobertura de testes ≥ 80%
- [ ] Documentação atualizada
- [ ] Sem breaking changes (ou explicitado em BREAKING CHANGE:)
- [ ] Code style conforme padrão
- [ ] Performance aceitável (P95 < limite)
- [ ] Manual testing em staging OK
- [ ] Reviewed locally (não apenas CI/CD)

## 🔗 Issues Relacionadas
Closes #MEALS-001
Related #MEALS-042

## 📸 Screenshots / Demos
<!-- Se UI/Mobile, adicionar screenshots antes/depois -->

## ⚠️ Breaking Changes
<!-- Se houver, detalhar aqui -->

## 📊 Performance Impact
<!-- Antes/depois metrics, se relevante -->

## 🚀 Deployment Notes
<!-- Qualquer coisa que ops precise saber -->
```

---

## 🎯 PR Title Format

**Formato**: `[<area>] <description>`

```
✅ Bom:
[AUTH] Implement OAuth2 authorization code flow
[MEALS] Add batch import CSV functionality
[INFRA] Upgrade Kotlin to 1.9.2
[CI] Add security scanning to pipeline

❌ Ruim:
Add OAuth stuff
WIP: some changes
Fix bugs
Update from develop
```

**Areas**:
- `AUTH` - Autenticação, autorização
- `MEALS` - Meal logging service
- `FOOD` - Food database, search
- `NUTRITION` - Nutrition tracking
- `AI` - AI integrations
- `MOBILE` - Mobile app
- `INFRA` - Infrastructure, CI/CD
- `DOCS` - Documentation
- `PERF` - Performance optimization
- `SECURITY` - Security fixes

---

## 📏 PR Size Guidelines

| Tamanho | LOC | Tempo de Review | Frequência |
|---------|-----|-----------------|-----------|
| **Tiny** | < 100 | 10-15 min | ✅ Encorajado |
| **Small** | 100-300 | 20-30 min | ✅ Ideal |
| **Medium** | 300-600 | 45-60 min | ⚠️ Aceitável |
| **Large** | 600-1000 | 2h+ | ❌ Rare |
| **Huge** | > 1000 | Multiple sessions | ❌ **Split em PRs** |

**Regra**: PRs > 400 LOC devem ser splitadas ou explicitadas por quê.

```bash
# ❌ Ruim: Uma mega-PR com tudo
feature/ai-coaching: 1500+ linhas
├── AI service implementation
├── Database schema changes
├── Mobile UI
├── Tests
└── Documentação

# ✅ Bom: Série de PRs lógicas
PR #1: [AI] Implement prompting engine + tests (200 LOC)
PR #2: [AUTH] Add coach role + RBAC (150 LOC)
PR #3: [DATA] Add coach_recommendations table (100 LOC)
PR #4: [MOBILE] Add coaching UI screens (250 LOC)
```

---

## ⏱️ Review SLA & Timing

| Tipo | Reviewer | Tempo Esperado | Critério |
|------|----------|----------------|----------|
| **Bugfix crítico** | On-call | < 2h | 1 approval |
| **Hotfix produção** | Tech Lead | < 4h | 2 approvals |
| **Feature pequena** | Peer | < 24h | 2 approvals |
| **Feature grande** | Peer + Senior | < 48h | 2 approvals |
| **Documentação** | Peer | < 24h | 1 approval |
| **Refactor complexo** | Tech Lead | < 48h | 2 approvals |
| **Infra/DevOps** | DevOps Lead | < 24h | 1 approval |

**Workflow de Resposta**:
```
Criou PR → Notificação Slack
  ↓
Reviewers assignados automaticamente
  ↓
< 24h: Feedback inicial (changes requested ou approved)
  ↓
Author responde + amends
  ↓
< 48h: Aprovação final + merge
```

---

## ✅ Code Review Checklist

**Para cada PR, reviewer verifica**:

### 1. Qualidade de Código
- [ ] Código é legível e bem estruturado
- [ ] Sem código duplicado (DRY principle)
- [ ] Nomes de variáveis/funções são claros
- [ ] Sem magic numbers ou hardcodes
- [ ] Comentários explicam POR QUE (não COMO)
- [ ] Error handling está presente
- [ ] Edge cases tratados

### 2. Testes
- [ ] Testes existem (unit + integration)
- [ ] Cobertura ≥ 80% (ou explicado por quê)
- [ ] Testes não são triviais (realmente testam lógica)
- [ ] Edge cases testados
- [ ] Mocks apropriados (não testan dependências externas)
- [ ] Test names são descritivos
- [ ] Testes passando em CI/CD

### 3. Performance & Security
- [ ] Sem queries N+1
- [ ] Sem memory leaks óbvios
- [ ] Sem exposição de informações sensitivas
- [ ] Validação de input presente
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS/CSRF proteção, se necessário
- [ ] Senhas/tokens não hardcoded

### 4. Documentação
- [ ] Código complexo tem comentários explicativos
- [ ] README/docs atualizado (se aplicável)
- [ ] API endpoints documentados (se backend)
- [ ] Breaking changes explicitados
- [ ] Exemplos de uso, se necessário

### 5. Architecture & Design
- [ ] Segue padrões do projeto (Clean Architecture, etc)
- [ ] Coerente com design existente
- [ ] Sem aumentar complexidade desnecessariamente
- [ ] SOLID principles aplicados
- [ ] Sem circular dependencies
- [ ] Responde às issues mencionadas

### 6. CI/CD & Deployment
- [ ] Build passing (✅ no GitHub Actions)
- [ ] Todos os testes passando
- [ ] Lint/code style OK
- [ ] Security scans OK (no vulnerabilities)
- [ ] Coverage report OK
- [ ] Deployment ready (migrations, configs, etc)

---

## 🗣️ Review Comment Types

### ✅ Approval Comment (2+ necessários)

```
Looks good! Minor suggestions addressed nicely.
The macro calculation logic is sound and well-tested.
Approved ✓
```

### 💭 Suggestion (nice-to-have)

```
💭 Suggestion: Consider using `flatMap` instead of `map` + `flatten` for readability.
```

**Author pode ignorar se tiver boa razão.**

### ⚠️ Comment (resolve antes de merge)

```
⚠️ This could be simplified:
```
`mealData.filter { it.quantity > 0 }.map { it.macros }.combineLatest(...)`

Better approach:
```
mealData
  .filter { it.quantity > 0 }
  .map { it.macros }
  .combineLatest(...)
```

**Author: Pode refutar se explicar bem.**

### 🚫 Request Changes (bloqueia merge)

```
🚫 This test is missing edge case validation.
Please add test for negative quantity (which should fail).

Also, the error message "Invalid meal" is too generic.
Return specific error codes for debugging.
```

**Author: Deve resolver antes de solicitar novo review.**

---

## 💬 Review Comment Best Practices

### ✅ Bom Feedback
```
"Consider using `const` instead of `let` since this variable isn't reassigned.
This prevents accidental mutations and aligns with our style guide."

"The email validation regex might be too restrictive. 
RFC 5321 allows + in local part (gmail+tag@example.com).
Please test with real-world emails."

"Nice solution! Just a note: we can improve performance by using 
indexed queries for user lookups. Consider adding a composite index 
on (created_at, status) per PERF-008."
```

### ❌ Ruim Feedback
```
"This is wrong."
"Why did you do this?"
"This doesn't make sense."
"You need to refactor this."
"This violates the style guide." (sem sugerir alternativa)
```

**Regra d'Ouro**: Feedback deve ser:
- Específico (não vago)
- Construtivo (sugere melhorias)
- Educacional (explica o raciocínio)
- Respeitoso (tone amigável)

---

## 🔄 Responding to Feedback

### Author: Acknowledging & Asking for Clarification

```
Good catch! I wasn't aware of that pattern.
Let me refactor to use indexed queries.
```

```
Interesting suggestion. Can you clarify the benefits of 
`flatMap` vs `map.flatten`? I want to understand the trade-offs.
```

### Reviewer: Re-reviewing Changes

Após author fazer changes:
1. Clicar "Re-request review" no GitHub
2. Ou deixar comment `@reviewer ready for re-review`
3. Verificar se mudanças resolvem concerns
4. Se sim → Approve
5. Se não → Request changes novamente

---

## 👥 Reviewer Assignment

**Automático (via GitHub CODEOWNERS)**:

Arquivo: `.github/CODEOWNERS`

```
# Format: path @reviewer1 @reviewer2

# Auth service
src/services/auth/ @auth-team-lead @dev-team-senior

# Meal service
src/services/meal/ @backend-team

# Mobile
src/mobile/ @mobile-lead @mobile-devs

# Tests
src/test/ @qa-lead

# DevOps
.github/ @devops-lead
docker* @devops-lead
```

**Manual (se necessário)**:
1. Abrir PR
2. Clicar "Reviewers" no lado direito
3. Selecionar 1-2 reviewers
4. GitHub notifica automaticamente via Slack

---

## 🚀 Merge Strategy

### Squash & Merge (Recomendado)
```
feature/MEALS-001 com 5 commits:
├── WIP: setup models
├── feat(meals): add endpoint
├── test: add unit tests
├── docs: update API docs
└── fix: lint issue

↓ Squash & Merge (1 commit limpo)

master
├── feat(meals): add POST /meals endpoint [SQUASHED 5 commits]
```

**Quando usar**: Features com múltiplos commits "messy" ou WIP

**GitHub UI**: PR → "Squash and merge" → auto-message do último commit

### Create a Merge Commit (Prése histórico completo)
```
Preserva todos os 5 commits no histórico:
  ├── WIP: setup models
  ├── feat(meals): add endpoint
  ├── test: add unit tests
  ├── docs: update API docs
  └── fix: lint issue
```

**Quando usar**: PRs bem estruturadas, want trace completo

**GitHub UI**: PR → "Create a merge commit"

### Rebase and Merge (❌ Proibido)
```
❌ Não usar porque:
- Cria novo hash para commits (confunde blame/bisect)
- Perde o contexto de PR
- Dificulta rollback
```

---

## 🔄 Continuous Integration Checks

Todos passando antes de merge:

```
Branch protection rules (develop):
✅ Require status checks to pass:
  ├── ✅ build (./gradlew build)
  ├── ✅ test (./gradlew test)
  ├── ✅ ktlint (code style)
  ├── ✅ coverage (>80%)
  ├── ✅ security-scan (Snyk)
  └── ✅ docs-build (valid markdown)

✅ Require code reviews: 1 (develop), 2 (master)
✅ Require branches to be updated
✅ Dismiss stale approvals when new commits pushed
```

---

## 📊 PR Metrics & Monitoring

**Dashboard (accessible via GitHub):**
- Average review time: Target < 24h
- PR size distribution: 80% small PRs
- Merge rate: >95% approved PRs merged
- Revert rate: < 1% of PRs reverted

**Queries úteis**:
```
# Count PRs by author
gh pr list --repo MateusO97/trainer-hub --state merged

# Find slow-to-merge PRs
gh pr list --repo MateusO97/trainer-hub --state merged --json createdAt,mergedAt

# Find PRs with most comments (heavy reviews)
gh pr list --repo MateusO97/trainer-hub --state merged --json comments
```

---

## 🚨 When to Reject a PR

- [ ] Failing CI/CD checks
- [ ] < 2 approvals (for master)
- [ ] Code coverage dropped
- [ ] Security issues found
- [ ] Breaking changes unexplained
- [ ] Incomplete/incomplete docs
- [ ] Conflicts with master/develop
- [ ] Author hasn't responded to feedback in >48h

**Message exemplo**:
```
Unable to merge at this time:
- Security scan found 2 vulnerabilities (update dependencies)
- Coverage dropped from 85% to 78% (add tests)
- Request changes from @reviewer-name still pending

Please address and request re-review.
```

---

## 📚 References

- [GitHub PR Template](https://github.blog/2016-02-17-issue-and-pull-request-templates/)
- [Best Practices for Code Review](https://google.github.io/eng-practices/review/)
- [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-08 | Initial PR standards with template, review checklist, merge strategies |
