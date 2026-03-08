# Development Workflow: Hands-On Guide

**Document ID**: DEV-WORKFLOW-001  
**Version**: 1.0  
**Created**: March 8, 2026  
**Owner**: Engineering Lead & Onboarding

---

## 📋 Executive Summary

**Este é um guia prático passo-a-passo** de como executar tarefas comuns no desenvolvimento de TrAIner Hub:

- Como iniciar uma feature nova
- Como fazer commit
- Como criar pull request  
- Como fazer code review
- Como conseguir ajuda

---

## 🚀 Pré-requisitos (One-Time Setup)

### 1. Clone o Repositório

```bash
# SSH (recomendado)
git clone git@github.com:MateusO97/trainer-hub-docs.git
cd trainer-hub-docs

# Ou HTTPS (menos ideal, pede password)
git clone https://github.com/MateusO97/trainer-hub-docs.git
```

### 2. Configurar Git Localmente

```bash
# Seu nome e email (usado em commits)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.dev"

# Verificar configuração
git config --global --list | grep user
```

### 3. Instalar Ferramentas

```bash
# Java JDK 21
java -version

# Gradle (via Homebrew)
brew install gradle
gradle --version

# Docker (para testes com TestContainers)
docker --version

# Git Hooks (automático ao clonar)
npm install
npx husky install
```

### 4. Criar Feature Branch Inicial

```bash
# Sincronizar com remote
git fetch origin

# Verificar branches disponíveis
git branch -r

# Checkout develop (base para novas features)
git checkout develop
git pull origin develop  # Sempre sincronizar antes de criar feature

echo "✅ Ready to create feature!"
```

---

## 📝 Tarefa 1: Começar Feature Nova

### Cenário
Vous assignment do Jira: **MEALS-001: Implementar POST /meals endpoint**

### Passo 1: Criar Feature Branch

```bash
# 1. Certifique-se que está em develop atualizado
git checkout develop
git pull origin develop

# 2. Criar feature branch (nunca crie direto em develop!)
git checkout -b feature/MEALS-001-add-meal-logging

# 3. Verificar que está correto
git branch -a
# * feature/MEALS-001-add-meal-logging  ← asterisco = current branch
#   develop
#   master
#   origin/develop
#   origin/master

echo "✅ Feature branch criado!"
```

### Passo 2: Implementar Código

```bash
# Abrir IDE/editor
code .

# Estrutura a adicionar:
# src/main/kotlin/meals/MealController.kt
# src/main/kotlin/meals/MealService.kt
# src/main/kotlin/meals/MealRequest.kt
# src/test/kotlin/meals/MealServiceTest.kt

# Exemplo: criar arquivo controller
cat > src/main/kotlin/meals/MealController.kt << 'EOF'
@RestController
@RequestMapping("/api/v1/meals")
class MealController(private val mealService: MealService) {
    
    @PostMapping
    fun createMeal(
        @RequestBody request: CreateMealRequest
    ): MealResponse = mealService.createMeal(request)
}
EOF
```

### Passo 3: Executar Testes Localmente

```bash
# Testes unit
./gradlew test

# Testes integration
./gradlew integrationTest

# Tudo junto
./gradlew test integrationTest

# Verificar coverage
./gradlew jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

### Passo 4: Verificar Code Style

```bash
# Lint Kotlin code
./gradlew ktlint

# Auto-fix se possível
./gradlew ktlintFormat

# Verificar formatação
./gradlew ktlint
```

### Passo 5: Primer Commit

```bash
# Ver arquivos alterados
git status

# Staging (adicionar ao commit)
git add src/main/kotlin/meals/MealController.kt  # Arquivo específico
git add src/                                     # Toda a pasta

# Ou (não recomendado):
git add .  # TUDO (cuidado!)

# Verificar o que vai ser commitado
git diff --cached

# Fazer commit (mensagem por Conventional Commits)
git commit -m "feat(meals): add POST /meals endpoint for meal logging"

# Se errar a mensagem:
git commit --amend -m "feat(meals): new message here"

# Verificar log
git log --oneline -3
```

---

## 🔄 Tarefa 2: Work In Progress (Iterativo)

Enquanto trabalha na feature, fazer commits progressivos:

```bash
# Após trabalhar some time:
git status  # Ver mudanças

git add .
git commit -m "feat(meals): implement validation for meal quantity"

# Depois:
git add src/test
git commit -m "test(meals): add unit tests for MealService"

# Depois:
git add docs/
git commit -m "docs(api): update meal endpoint documentation"

# Ver histórico
git log --oneline -5
# f3a9f2e docs(api): update meal endpoint documentation
# d8e7c7a test(meals): add unit tests for MealService
# c2b1a0f feat(meals): implement validation for meal quantity
# a1e9b3c feat(meals): add POST /meals endpoint for meal logging
```

**Regra**: Commit to máximo **1 vez por dia** ou quando finalizou uma unidade lógica.

---

## 🚨 Tarefa 3: Sync com Develop (Se Develop evoluiu)

Enquanto você trabalha, talvez alguém tenha merged outra feature em develop.

```bash
# Verificar se develop mudou
git fetch origin

# Ver diferença
git log --oneline develop..origin/develop

# Atualizar sua feature branch:
# OPÇÃO A: Merge (mais seguro)
git merge origin/develop

# OPÇÃO B: Rebase (mais limpo, mas cuidado!)
git rebase origin/develop

# Se houver conflitos:
# 1. Abrir arquivos com "<<<<<<" e ">>>>>>>"
# 2. Editar manualmente para manter ambas mudanças
# 3. git add .
# 4. git commit (se merge) OU git rebase --continue (se rebase)

git push origin feature/MEALS-001-add-meal-logging
```

---

## 📤 Tarefa 4: Push para o Repository

Quando terminou de trabalhar (feature pronta para review):

```bash
# 1. Sincronizar com origin (últimas mudanças remotas)
git fetch origin

# 2. Push sua feature branch
git push origin feature/MEALS-001-add-meal-logging

# Output esperado:
# remote: Resolving deltas: 100% (5/5), done.
# To github.com:MateusO97/trainer-hub-docs.git
#  * [new branch]      feature/MEALS-001-add-meal-logging -> feature/MEALS-001-add-meal-logging

# 3. Verificar no GitHub
open https://github.com/MateusO97/trainer-hub-docs/tree/feature/MEALS-001-add-meal-logging
```

---

## 🔍 Tarefa 5: Criar Pull Request

### Via GitHub Web (Recomendado)

```
1. Go to: github.com/MateusO97/trainer-hub-docs
2. Ver notificação "Compare & pull request" (aparece automático)
3. Clicar "Create pull request"
4. Preencher template:

   Title: [MEALS] Add POST /meals endpoint for meal logging
   
   Body:
   ### 🎯 Objetivo
   Implement REST endpoint to log consumed meals with auto-calculated macros.
   
   ### 📝 Descrição
   - POST /meals accepts foodId, quantity, unit, mealDate
   - Calls MacroCalculator service for nutrition calculation
   - Persists to PostgreSQL meals table
   - Returns MealResponse with ID and calculated macros
   
   ### 📋 Checklist
   - [x] Testes unitários adicionados
   - [x] Testes integração com DB
   - [x] Cobertura > 80%
   - [x] Code review ready
   
   ### 🔗 Issues
   Closes #MEALS-001
```

### Via GitHub CLI (Alternativo)

```bash
gh pr create --title "[MEALS] Add POST /meals endpoint" \
             --body "Implement meal logging endpoint with validation" \
             --base develop \
             --head feature/MEALS-001-add-meal-logging
```

---

## ⏳ Tarefa 6: Aguardar Code Review

Após criar PR, GitHub Actions automático executa:

```
✅ Tests passing
✅ Coverage > 80%
✅ Ktlint passing
✅ Build success
✅ Security scan OK
```

**Reviewers** recebem notificação no Slack/GitHub:

```
[GitHub] MateusO97 opened PR #123:
[MEALS] Add POST /meals endpoint for meal logging

Waiting for review...
```

**Tempo típico**: < 24h

---

## 💬 Tarefa 7: Responder a Feedback do Review

Se reviewer pediu changes:

```bash
# 1. Abrir arquivo que reviewer mencionou
# 2. Fazer a alteração sugerida
# 3. Commit (sem recriar pull request!)

git add src/meals/MealController.kt
git commit -m "refactor(meals): improve error handling per review feedback"

# 4. Push (GitHub atualiza PR automático)
git push origin feature/MEALS-001-add-meal-logging

# 5. Deixar comment no GitHub:
# "Thanks for the feedback! I've addressed the concerns. Please re-review."
```

**Nota**: Não crie novo PR, apenas faça novo commit no mesmo branch!

---

## ✅ Tarefa 8: PR Aprovado & Merge

Quando tiver **2 approvals** (ou 1 em develop):

```bash
# VIA GITHUB UI (recomendado):
1. Abrir PR
2. Clicar "Squash and merge" (empacotar commits)
3. Confirmar

# OU VIA CLI:
gh pr merge 123 --squash --auto
```

**Output esperado**:
```
Pull request #123 has been merged!

feature/MEALS-001-add-meal-logging → develop
  (squashed into 1 commit)
```

---

## 🧹 Tarefa 9: Cleanup Após Merge

```bash
# 1. Voltar para develop
git checkout develop

# 2. Sincronizar (pull seu merge)
git pull origin develop

# 3. Deletar feature branch (remoto)
# GitHub auto-deleta após merge, ou:
git push origin --delete feature/MEALS-001-add-meal-logging

# 4. Deletar local
git branch -d feature/MEALS-001-add-meal-logging

# 5. Verificar que sumiu
git branch -a  # não deve mais aparecer

echo "✅ Feature merged e cleanup feito!"
```

---

## 🔍 Tarefa 10: Code Review (Como Reviewer)

Quando pedido para fazer code review:

```bash
# 1. Receber notificação no Slack/GitHub
# 2. Ir para https://github.com/MateusO97/trainer-hub-docs/pulls
# 3. Clicar em PR para revisar

# 4. Começar a revisar:
   - Clicar em "Files changed"
   - Verificar cada arquivo
   - Deixar comentários (hover na linha de código)

# 5. Tipos de comentários:
   - Single comment (only visibility to author)
   - Start a review (agrupa comments)

# 6. Depois de revisar por completo:
   - Clicar "Review changes" (botão verde, canto superior)
   - Escolher: Approve / Request changes / Comment
   - Enviar
```

**Checklist rápido** enquanto está revendo:

```
☐ Código faz sentido?
☐ Testes adequados?
☐ Performance OK?
☐ Documentação atualizada?
☐ Sem security issues?
☐ Segue padrões do projeto?
```

---

## 🐛 Tarefa Extra: Bugfix (Similar a Feature)

```bash
# Recebeu issue: "Auth token leaks in logs"

# 1. Criar bugfix branch (mesmo que feature)
git checkout develop
git pull origin develop
git checkout -b bugfix/AUTH-042-jwt-token-leak

# 2. Implementar fix
# (deletar log de token, usar placeholder)

# 3. Commit com tipo "fix"
git commit -m "fix(auth): remove JWT token from logs to prevent leaks"

# 4. Testes (importante em bugfix!)
./gradlew test

# 5. Push
git push origin bugfix/AUTH-042-jwt-token-leak

# 6. PR (mesmo processo)
gh pr create --title "[AUTH] Remove JWT from logs" ...

# 7. Merge e cleanup (mesmo processo)
```

---

## 🔥 Tarefa Extra: Hotfix (Crítico em Produção)

Se um bug crítico é encontrado em produção:

```bash
# 1. Bugfix branch de MASTER (não develop!)
git checkout master
git pull origin master
git checkout -b hotfix/CRIT-001-auth-broken

# 2. Fazer fix mínimo
git commit -m "fix(auth): restore JWT validation"

# 3. Test & PR
./gradlew test
gh pr create --base master ...

# 4. Merge para master
# 5. IMPORTANTE: Merge também para develop!
git checkout develop
git merge master
git push origin develop
```

---

## ❓ Troubleshooting Comum

### Problema: "Detached HEAD state"

```bash
# Você ficou em um commit específico, não em branch
git status
# HEAD detached at abc123

# Solução: voltar para branch
git checkout develop
git checkout -b feature/novo-nome
```

### Problema: Deletei arquivo errado

```bash
# Se ainda não commitou:
git restore nome-arquivo.txt  # Volta para estado anterior

# Se já commitou:
git revert HEAD  # Cria novo commit desfazendo
```

### Problema: Fazer commit em branch errado

```bash
# Fez commit em master por acidente
git log --oneline -3  # vê que seu commit está em master

# Solução:
git reset --soft HEAD~1  # Remove commit, mantém arquivo
git checkout -b feature/MEALS-001-novo  # Cria branch correto
git commit -m "feat(meals): ..."  # Re-commit em branch certo
```

### Problema: Merge conflict

```bash
# Aparece "CONFLICT" após pull ou merge
git status  # vê "both modified: arquivo.kt"

# 1. Abrir arquivo
# 2. Procurar por: <<<<<<< HEAD ... ======= ... >>>>>>>
# 3. Editar manualmente para manter versão correta
# 4. Deletar marcadores de conflito

git add arquivo.kt
git commit -m "merge: resolve conflicts in MealService"
git push origin feature/MEALS-001-add-meal-logging
```

---

## 📚 Quick Commands Reference

| Tarefa | Comando |
|--------|---------|
| Ver brancheslocais | `git branch` |
| Ver branches remotos | `git branch -r` |
| Ver histórico | `git log --oneline -10` |
| Ver mudanças não commitadas | `git status` |
| Ver diff | `git diff` |
| Criar branch | `git checkout -b feature/NAME` |
| Mudar de branch | `git checkout branch-name` |
| Fazer commit | `git commit -m "msg"` |
| Push | `git push origin branch-name` |
| Pull | `git pull origin branch-name` |
| Deletar branch | `git branch -d branch-name` |
| Deletar remoto | `git push origin --delete branch-name` |
| Rebase | `git rebase origin/develop` |
| Merge | `git merge origin/develop` |
| Ver logs de todos os branches | `git log --all --oneline --graph` |

---

## 🆘 Precisa de Ajuda?

```bash
# Se não sabe o que fazer:
git status           # Entender estado atual
git log --oneline    # Ver histórico
git diff             # Ver mudanças

# Comando específico:
git [comando] --help # Ex: git commit --help

# No Slack:
@devops-team "preciso de ajuda com merge conflict"
@tech-lead "como faco rebase?"

# GitHub Discussions
github.com/MateusO97/trainer-hub-docs/discussions
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-08 | Initial hands-on workflow guide with step-by-step tasks |
