# Conventional Commits & Commit Standards

**Document ID**: COMMIT-STANDARDS-001  
**Version**: 1.0  
**Created**: March 8, 2026  
**Owner**: DevOps / QA Lead

---

## 📋 Executive Summary

Este documento padroniza **mensagens de commit** usando **Conventional Commits**, permitindo:

✅ Histórico legível e consultável  
✅ Automatic changelog generation  
✅ Semantic versioning automático (MAJOR.MINOR.PATCH)  
✅ CI/CD triggers baseados em tipo de commit  
✅ Integração com issue tracking  

---

## 🎯 Formato Padrão

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Linha Simples (Recomendada)
Para commits triviais (sem mudanças complexas):

```
feat(auth): add JWT token refresh mechanism
```

### Completo (Quando necessário)
Para features/fixes com contexto importante:

```
feat(meals): implement fast-path for food search

- Add Redis cache layer (TTL 7 days)
- Implement PostgreSQL full-text search
- Fallback to OpenAI if local DB miss
- P95 latency: 50ms → 15ms improvement

Closes #MEALS-001
BREAKING CHANGE: POST /meals now requires "date" field
```

---

## 🏷️ Type: Categoria do Commit

| Type | Descrição | Exemplo | Changelog | Versão |
|------|-----------|---------|-----------|--------|
| **feat** | Nova funcionalidade | `feat(auth): add 2FA` | ✅ Sim | MINOR ↑ |
| **fix** | Correção de bug | `fix(auth): prevent token replay` | ✅ Sim | PATCH ↑ |
| **refactor** | Refatoração (sem alteração de funcionalidade) | `refactor(db): optimize user queries` | ❌ Não | - |
| **perf** | Otimização de performance | `perf(search): cache food results` | ✅ Sim | PATCH ↑ |
| **docs** | Apenas documentação | `docs(api): update endpoint examples` | ❌ Não | - |
| **style** | Formatação, sem alterar lógica | `style: reformat meal service` | ❌ Não | - |
| **test** | Testes sem alteração de código | `test(meals): add integration tests` | ❌ Não | - |
| **chore** | Dependências, tooling, config | `chore(deps): upgrade Kotlin to 1.9.2` | ❌ Não | - |
| **ci** | Alterações em CI/CD | `ci: add security scan to workflow` | ❌ Não | - |

---

## 🎯 Scope: Área Afetada

**Backend**:
```
feat(auth)       → Auth service changes
feat(users)      → User service
feat(meals)      → Meal service
feat(nutrition)  → Nutrition service
feat(food)       → Food database/search
feat(ai)         → AI integration
feat(notifications) → Notification service
feat(db)         → Database schema
feat(middleware) → Cross-cutting concerns
```

**Mobile**:
```
feat(mobile-auth)    → Auth UI/flow
feat(mobile-ui)      → General UI components
feat(mobile-meals)   → Meal logging screens
feat(mobile-offline) → Offline sync
```

**DevOps/Infrastructure**:
```
feat(docker)     → Docker setup
feat(k8s)        → Kubernetes
feat(ci)         → GitHub Actions
feat(monitoring) → Prometheus/logging
```

---

## 📝 Subject Line (Max 50 caracteres)

**Regras**:
- ✅ Imperativo: "add", "fix", "update" (não "added", "fixes", "updated")
- ✅ Minúsculas (exceto nomes próprios)
- ✅ Sem ponto final (.)
- ✅ Específico e descritivo
- ❌ Sem jargão interno
- ❌ Sem referências a branches ou PRs

**Exemplos**:

```
✅ Bom:
feat(auth): implement OAuth2 authorization code flow
fix(meals): prevent duplicate food entries
perf(search): add PostgreSQL full-text indexing

❌ Ruim:
feat(auth): add auth stuff
fix: some bug fixes
WIP: testing new feature
Update from develop branch
```

---

## 📄 Body (Opcional, Mas Recomendado)

**usar quando**:
- Mudança não óbvia ou complexa
- Necessita contexto histórico
- Tem trade-offs explicados
- Refere múltiplas issues

**Formato**:
```
feat(meals): add batch meal import from CSV

- Parse CSV with 5 columns: food, quantity, unit, date, notes
- Validate macro totals don't exceed daily goals
- Show import preview before confirming
- Rollback on any validation error (atomic)
- P95 latency: 2s for 100-row CSV

Closes #MEALS-042
Related #MEALS-001 (original meal logging feature)
```

**Guidelines**:
- Explain O QUE e POR QUE (não COMO → em código comments)
- Use bullet points para múltipons pontos
- Limpe a 72 caracteres (soft wrap)
- Sépare do subject com linha em branco

---

## 🔗 Footer (Quando Aplicável)

### Referência de Issues
```
Closes #MEALS-001
Closes #MEALS-001, #AUTH-042
```

### Referência de PRs
```
Closes MateusO97/trainer-hub#123
```

### Breaking Changes
```
BREAKING CHANGE: POST /meals endpoint now requires "date" field.
Migrate: always provide ISO 8601 date

BREAKING CHANGE: Removed deprecated GET /user/macros endpoint.
Use GET /user/nutrition instead.
```

### Co-authors
```
Co-authored-by: João Santos <joao@trainer-hub.dev>
Co-authored-by: Maria Silva <maria@trainer-hub.dev>
```

---

## 🚀 Exemplos Práticos

### Exemplo 1: Feature Simples
```
feat(meals): add POST /meals endpoint for logging consumed meals
```

### Exemplo 2: Feature Complexa
```
feat(ai): implement cascading food resolution pipeline

- Try local cache (Redis, TTL 7d)
- Fallback to local PostgreSQL database
- Fallback to Nutritionix API (free tier, 500ms timeout)
- Fallback to USDA FoodData Central (no cost, 2s timeout)
- Final fallback: OpenAI GPT-4o (async, ~30s, $0.05 per call)
- Heuristic defaults if all sources fail

Performance: P95 < 100ms (cache hit), P95 < 500ms (external)
Cost: ~$125/month at 50k DAU

Closes #AI-001
BREAKING CHANGE: All food searches now return confidence scores (0-100)
```

### Exemplo 3: Bugfix
```
fix(auth): prevent JWT token replay attacks via nonce validation

- Store consumed nonces in Redis (TTL 24h)
- On token validation, check if nonce already used
- Return 401 if nonce duplicate detected
- Fixes critical security issue

Closes #SEC-015
```

### Exemplo 4: Refactor
```
refactor(db): optimize user query by adding composite index on (created_at, status)

- Improves query latency from 450ms to 120ms (P95)
- Added query explain() analysis in comments
- Verified no breaking changes

Closes #PERF-008
```

### Exemplo 5: Dependência
```
chore(deps): upgrade Spring Boot from 3.1.5 to 3.2.1

- Includes security patches (CVE-2023-XXXXX)
- All tests passing
- Verified compatibility with current dependencies

No BREAKING CHANGE
```

---

## ⚙️ Git Commit Hooks (Automático)

### Pre-commit Hook (local validation)

Arquivo: `.husky/pre-commit`

```bash
#!/bin/sh

# Lint commit message
npx commitlint --edit "$1"

# Run local tests
./gradlew test

# Check code style
./gradlew ktlint

exit 0
```

**Instalação**:
```bash
npm install husky commitlint @commitlint/config-conventional
npx husky install
```

### Commit Message Template

Arquivo: `.gitmessage`

```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# Type: feat, fix, refactor, perf, docs, style, test, chore, ci
# Example subjects:
#   feat(auth): implement OAuth2 authorization code flow
#   fix(meals): prevent duplicate food entries
#   docs(api): update endpoint examples
#
# Example body:
#   - Add JWT token refresh mechanism after 1h
#   - Rotate refresh tokens every 7 days
#   - Closes #AUTH-001
```

**Usar**:
```bash
git config --local commit.template .gitmessage
```

---

## 📊 Commit Frequency & Size

### Commit Size Guidelines

| Tamanho | Commits | Exemplo |
|---------|---------|---------|
| **Tiny** | 1-10 linhas | `style: fix indentation`, `docs: typo fix` |
| **Small** | 10-50 linhas | `fix(auth): validate JWT`, `feat(meals): add REST endpoint` |
| **Medium** | 50-200 linhas | `feat(meals): add batch import`, `refactor(db): optimize queries` |
| **Large** | 200-500 linhas | `feat(ai): implement food pipeline`, Complex refactor |
| **Too Large** | 500+ linhas | ❌ **Split into multiple commits** |

### Frequência Recomendada

```
Desenvolvimento ativo: 2-3 commits/dia
Implementando feature 2-3 dias: 4-6 commits totais (progressivo)
Code review+amends: 1-2 commits finais (squashed)
```

**Regra de Ouro**: Um commit = uma unidade lógica razoável

```bash
# ❌ Ruim: Tudo em 1 commit
git add .
git commit -m "WIP: lots of changes"

# ✅ Bom: Commits lógicos progressivos
git add src/auth/
git commit -m "feat(auth): implement JWT generation"

git add src/auth/middleware/
git commit -m "feat(auth): add JWT validation middleware"

git add src/tests/auth/
git commit -m "test(auth): add unit tests for JWT logic"
```

---

## 🔍 Commitlint Configuration

Arquivo: `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'perf',
        'docs',
        'style',
        'test',
        'chore',
        'ci',
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'always', 'lower-case'],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
```

---

## 📈 Automatic Changelog Generation

Com commits padronizados, gerar changelog automaticamente:

```bash
# Instalar ferramentas
npm install commitizen cz-conventional-changelog standard-version

# Gerar changelog automático
npx standard-version

# Output:
# - CHANGELOG.md atualizado
# - package.json versão bumped
# - v1.0.0 tag criado
```

**Exemplo CHANGELOG.md gerado**:
```markdown
# Changelog

## [1.0.0] - 2026-03-15

### Features
- feat(meals): add POST /meals endpoint for logging consumed meals
- feat(auth): implement OAuth2 authorization code flow
- feat(ai): implement cascading food resolution pipeline

### Bug Fixes
- fix(auth): prevent JWT token replay attacks via nonce validation
- fix(meals): prevent duplicate food entries

### Performance
- perf(search): add PostgreSQL full-text indexing
- perf(cache): implement Redis cache layer for food data

### Breaking Changes
- **auth**: POST /meals now requires "date" field (ISO 8601)
- **api**: Removed deprecated GET /user/macros endpoint

### Documentation
- docs(api): update endpoint examples
- docs: add contributing guidelines

## [0.9.0] - 2026-02-28

### Features
- feat(auth): user registration and JWT token generation
...
```

---

## 📋 Checklist: Pre-Push

Antes de fazer `git push`:

- [ ] Commit message segue Conventional Commits
- [ ] Subject line < 50 caracteres
- [ ] Type é válido (feat, fix, etc)
- [ ] Scope é específico e relevante
- [ ] Nenhum `WIP:` ou `TODO:` no histórico
- [ ] Body tem no máximo 72 chars/linha
- [ ] Footer referencia issues relevantes
- [ ] Sem commits pessoais/privados (ex: "testing locally")
- [ ] Branch está atualizado com origin/develop

---

## 🛠️ Amending Commits

Se cometeu erro na mensagem **antes do push**:

```bash
# Amend último commit (sem novo hash)
git commit --amend --no-edit  # Mantém mensagem

# Amend com nova mensagem
git commit --amend -m "feat(auth): new message here"

# Push (requer --force-with-lease, não force bruto)
git push origin feature/MEALS-001 --force-with-lease
```

---

## 📚 References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitizen - Automated commits](http://commitizen.github.io/cz-cli/)
- [Husky - Git hooks](https://typicode.github.io/husky/)
- [Standard Version - Changelog automation](https://github.com/conventional-changelog/standard-version)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-08 | Initial Conventional Commits standard with types, scopes, examples |
