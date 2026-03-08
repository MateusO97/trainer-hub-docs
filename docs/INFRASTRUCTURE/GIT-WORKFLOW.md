# Git Workflow & Branching Strategy

**Document ID**: GIT-WORKFLOW-001  
**Version**: 1.0  
**Created**: March 8, 2026  
**Owner**: DevOps / Engineering Lead  
**Status**: Active

---

## 📋 Executive Summary

Este documento define o **Git Workflow padrão** para desenvolvimento de TrAIner Hub, baseado em **Git Flow com modificações para CI/CD moderno**, garantindo:

✅ Histórico limpo e rastreável  
✅ Releases previsíveis e versionadas  
✅ Desenvolvimento paralelo seguro  
✅ Hotfixes isolados de features  
✅ Integração contínua automática  

---

## 🌳 Branch Structure

```
master (main)
├── release/v1.0.0          [Release branch - preparação]
├── hotfix/user-auth-bug     [Hotfix - correções críticas]
│
develop (integração contínua)
├── feature/meal-tracking    [Feature 1]
├── feature/ai-suggestions   [Feature 2]
├── feature/nutritionist-api [Feature 3]
├── chore/upgrade-kotlin     [Código, deps, config]
└── docs/api-documentation  [Documentação]
```

### Branch Naming Convention

**Formato**: `<type>/<jira-id>-<short-description>`

```
✅ Correto                          ❌ Incorreto
─────────────────────────────────  ──────────────────────
feature/MEALS-001-add-meal-logging  feature/add-meal
bugfix/AUTH-042-jwt-refresh-leak    fix/jwt-bug
hotfix/CRIT-001-db-connection       hotfix/database
chore/DEVOPS-015-upgrade-gradle     chore/upgrade
docs/DOC-001-api-reference          documentation
refactor/PERF-008-optimize-queries  refactor-queries
test/TEST-001-add-integration-tests test-coverage
```

**Type Options**:
- `feature/` - Nova funcionalidade
- `bugfix/` - Correção de bug em desenvolvimento
- `hotfix/` - Correção crítica em produção
- `refactor/` - Refatoração sem mudança de comportamento
- `chore/` - Dependências, tooling, config
- `docs/` - Documentação
- `test/` - Testes sem código de produção
- `perf/` - Otimizações de performance

---

## 🚀 Workflow Detalhado

### 1️⃣ Iniciar Feature Nova

```bash
# 1. Sincronizar com develop (latest)
git checkout develop
git pull origin develop

# 2. Criar feature branch
git checkout -b feature/MEALS-001-add-meal-logging

# 3. Implementar + commitar (ver COMMIT-STANDARDS.md)
# ... trabalhar ...
git commit -m "feat(meals): add POST /meals endpoint"

# 4. Push para PR review
git push origin feature/MEALS-001-add-meal-logging
```

**Duração esperada**: 1-5 dias (até 100 linhas de mudança)  
**Reviewer**: 1-2 engenheiros sênior  

---

### 2️⃣ Submit Pull Request (Feature)

Criar PR com template padrão (ver PULL-REQUEST-STANDARDS.md):

```markdown
## 🎯 Objetivo
Implementar criação de refeições (meals) com validação de macros.

## 📝 Descrição
- POST /meals com dados: foodId, quantity, mealDate
- Integração com Nutrition Service para cálculo de macros
- Validação de quantity > 0
- Audit log da criação

## 🔗 Issue
Closes #MEALS-001

## ✅ Checklist
- [ ] Testes unitários adicionados (>80% coverage)
- [ ] Testes integração com DB
- [ ] Documentação API atualizada
- [ ] Manual testing em staging
- [ ] Sem breaking changes
```

**Auto-checks** (GitHub Actions):
- ✅ Lint + code formatter
- ✅ Testes unitários
- ✅ Coverage > 80%
- ✅ Build success
- ✅ Security scan

---

### 3️⃣ Code Review Process

**Timing**: < 24h para merge  
**Reviewers**: Min 2 approvals (1 senior)  
**Comentários**: Suggestions → Commits → Resolved  

```bash
# Após feedback, fazer amendments locais
git add .
git commit --amend --no-edit      # Sem novo hash, mantém histórico limpo
git push origin feature/MEALS-001-add-meal-logging --force-with-lease
```

**Critérios de aprovação**:
- ✅ Testes passando (100% CI/CD green)
- ✅ Code style conforme padrão (ESLint/Ktlint)
- ✅ Cobertura de testes ≥ 80%
- ✅ Documentação atualizada
- ✅ Sem duplicação de lógica
- ✅ Performance aceitável (P95 < 500ms)

---

### 4️⃣ Merge para Develop

```bash
# Após 2+ approvals:
# 1. No GitHub UI, clicar "Squash and merge" (1 commit limpo)
# 2. OU via CLI (manter histórico):

git checkout develop
git pull origin develop
git merge --ff-only feature/MEALS-001-add-meal-logging
# Ou sem fast-forward:
git merge --no-ff -m "Merge feature/MEALS-001..." feature/MEALS-001-add-meal-logging

git push origin develop

# 3. Cleanup remoto
git push origin --delete feature/MEALS-001-add-meal-logging

# 4. Cleanup local
git branch -d feature/MEALS-001-add-meal-logging
```

**Merge Strategy**:
- **Squash** (1 feature = 1 commit): Preferido para squash-friendly features
- **No Fast-Forward** (preserva histórico): Preferido para mudanças complexas
- **Rebase** (rearranjar): ❌ Proibido (não usar)

---

## 🔄 Release Flow

### Preparar Release (Fase 2 → 3)

```bash
# 1. Criar release branch de develop
git checkout -b release/v1.0.0 develop

# 2. Atualizar versão em todos os arquivos
# package.json, build.gradle.kts, AndroidManifest.xml, etc.
# Usar semantic versioning: MAJOR.MINOR.PATCH
git add .
git commit -m "chore(release): bump to v1.0.0"

# 3. Criar tag anotada
git tag -a v1.0.0 -m "TrAIner Hub MVP - Fase 1 Release"

# 4. Push release branch + tags
git push origin release/v1.0.0
git push origin v1.0.0
```

*Release Branch*: Apenas bugfixes críticos, sem features novas  
*Timing*: 2-4 semanas antes de go-live para testing  

### Finalizar Release (QA Passou)

```bash
# 1. Merge para master
git checkout master
git pull origin master
git merge --no-ff release/v1.0.0 -m "Release v1.0.0"

# 2. Merge back para develop (importante!)
git checkout develop
git merge --no-ff master

# 3. Push all
git push origin master develop

# 4. Cleanup
git push origin --delete release/v1.0.0
git branch -d release/v1.0.0

# 5. Deploy (GitHub Actions auto-triggers)
# Pipeline: master → Build → Test → Deploy AWS
```

---

## 🆘 Hotfix Flow

**Quando usar**: Bug crítico em produção (ex: autenticação quebrada)

```bash
# 1. Criar hotfix de master
git checkout -b hotfix/CRIT-001-jwt-verification-bug master

# 2. Fazer fix mínimo + teste
git commit -m "fix(auth): validate JWT signature on every request"

# 3. Testes + QA approval
# GitHub Actions: Unit tests, integration tests

# 4. Merge para master
git checkout master
git merge --no-ff hotfix/CRIT-001-jwt-verification-bug
git tag -a v1.0.1 -m "Hotfix: JWT verification"

# 5. Merge back para develop
git checkout develop
git merge --no-ff master

# 6. Deploy (production + staging)
git push origin master develop
```

**SLA**: 
- Identificado → Mergeado: < 4h
- Mergeado → Em produção: < 15 min

---

## 📊 Branch Lifecycle

```
feature/MEALS-001
├── Criado: developer cria branch de develop
├── Desenvolvendo (1-5 dias)
│   └── Progressivo: git push origin feature/MEALS-001
├── Ready para PR (todo testado localmente)
│   └── Criar PR em GitHub
├── Code Review (< 24h)
│   ├── Changes requested → developer amenda
│   └── Approved by 2+ reviewers
├── Merge para develop (squash ou merge commit)
│   └── CI/CD automático (build, test, deploy staging)
├── Delete remote
│   └── GitHub auto-deletes após merge (ou manual)
└── Delete local
    └── git branch -d feature/MEALS-001
```

**Lifetime esperado**:
- Curta feature: 1-3 dias (pronto → merge)
- Média feature: 3-7 dias (com feedback loops)
- Longa feature (épica): 2-3 semanas (em sub-branches)

---

## ✅ Checklist: Git Hygiene

**Antes de Push**:
- [ ] Seu branch está atualizado com develop (`git pull origin develop`)
- [ ] Commits têm mensagens claras (Conventional Commits)
- [ ] Sem commits "Fix typo", "WIP", "Debug" (squash antes de PR)
- [ ] Local tests passando (`npm test` ou `./gradlew test`)

**Antes de Merge**:
- [ ] GitHub Actions tudo verde (✅)
- [ ] Min 2 approvals de code review
- [ ] Conflitos resolvidos (merge base updated)
- [ ] PR description preenchida completamente

**Cleanup Pós-Merge**:
- [ ] Feature branch deletada (remote + local)
- [ ] Checkout volta para develop
- [ ] `git pull origin develop` para sincronizar local

---

## 🚨 Problemas Comuns & Soluções

### Problema: Branch desatualiza com develop

```bash
# Solução 1: Rebase (preferido, mantém histórico limpo)
git fetch origin
git rebase origin/develop
git push origin feature/MEALS-001 --force-with-lease  # ⚠️ use com cuidado

# Solução 2: Merge (mais seguro)
git fetch origin
git merge origin/develop
git push origin feature/MEALS-001
```

### Problema: Commit "squashing" manual

```bash
# Combinar últimos 3 commits em 1:
git rebase -i HEAD~3

# No editor, mudar:
# pick HASH1 First commit
# squash HASH2 Second commit
# squash HASH3 Third commit
# Salvar e desolver conflitos if any

git push origin feature/MEALS-001 --force-with-lease
```

### Problema: Merge acidental para master

```bash
# Se NÃ foram pushados ainda:
git reset --soft HEAD~1  # Desfaz merge, mantém código

# Se já foi pushado (revert):
git revert -m 1 HASH_COMMIT_MERGE
git push origin master
```

### Problema: Deletar branch errado

```bash
# Recuperar (reflog):
git reflog  # Encontre o commit
git checkout -b feature/MEALS-001 abc1234  # Recupera branch
git push origin feature/MEALS-001
```

---

## 📐 Protected Branches Rules

**master** (produção):
- ✅ Requer 2 code reviews
- ✅ Requer CI/CD pass (testes, build, security)
- ✅ Dismiss approvals após push (força re-review)
- ✅ Require branches to be up to date
- ❌ Allow force pushes

**develop** (staging):
- ✅ Requer 1 code review
- ✅ Requer CI/CD pass
- ✅ Require branches to be up to date
- ❌ Allow force pushes

**release/** (release prep):
- ✅ Requer 1 code review
- ✅ Requer CI/CD pass
- ✅ Allow hotfixes to be pushed directly

---

## 🔐 SSH Keys & Authentication

```bash
# Gerar chave SSH (uma vez)
ssh-keygen -t ed25519 -C "seu-email@trainer-hub.dev"
# Salvar em ~.ssh/trainer-hub_ed25519

# Adicionar ao GitHub
# Settings → SSH Keys → New SSH Key
# Colar sua public key

# Testar conexão
ssh -T git@github.com
# Should output: "Hi MateusO97! You've successfully authenticated..."

# Configure git para usar SSH
git config --global url.ssh://git@github.com/.insteadOf https://github.com/
```

---

## 📚 References

- [Conventional Commits](https://www.conventionalcommits.org/) - Padrão de mensagens
- [Semantic Versioning](https://semver.org/) - Versionamento
- [GitHub Flow vs Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows) - Comparação
- [Rebasing vs Merging](https://www.atlassian.com/git/tutorials/merging-vs-rebasing) - Trade-offs

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-08 | Initial Git Flow with branching strategy, release, hotfix workflows |
