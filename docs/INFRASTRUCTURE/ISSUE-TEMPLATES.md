# Issue Templates & AI-Optimized Standards

**Document ID**: ISSUE-TEMPLATES-001  
**Version**: 2.0 (AI-Optimized)
**Created**: March 8, 2026  
**Updated**: March 8, 2026 (AI-friendly format)
**Owner**: Product / Engineering  

---

## 📋 Executive Summary

Este documento define **templates de issues otimizados para resolução por IA**, garantindo:

✅ **Estrutura clara e sem ambiguidade** - Campos estruturados, não livres  
✅ **Contexto completo** - Toda informação que IA precisa para resolver  
✅ **Critérios verificáveis** - Acceptance criteria mensuráveis e testáveis  
✅ **Prompts explícitos** - Instruções diretas para execução por IA  
✅ **Auto-catálogação** - Metadados estruturados em YAML  
✅ **Validação automática** - Checklists que IA pode validar  

---

## 🤖 GUIA PARA IA: COMO RESOLVER CADA TIPO DE ISSUE

### Fluxo Universal de Resolução

1. **Ler Metadados YAML** → Entender tipo, contexto, prioridade
2. **Interpretar Objective & Scenario** → O que fazer
3. **Coletar Acceptance Criteria** → Como saber que está certo
4. **Executar Passos** → Implementation Steps (estruturados)
5. **Validar Resultado** → Checklist de validação
6. **Criar PR** → Commit com mensagem Conventional Commits
7. **Solicitar Review** → Link para reviewer humano se necessário

---

## 🎯 Tipos de Issues & Templates

### 1️⃣ 🚀 Feature Request (AI-Optimized)

**Usar para**: Nova funcionalidade, melhoria de produto

**Resolução por IA**: ~2-5 dias (dependendo complexidade)

```yaml
---
name: 🚀 Feature Request
about: Nova funcionalidade com user story estruturado
title: "[FEATURE] <area>: <user goal>"
assignees: []
labels: ["feature", "needs-triage"]
milestone: ""
---
```

### 📋 TEMPLATE (Copie e preencha todos os campos)

```
## 🎯 OBJECTIVE (Obrigatório)
<!-- IA lê isto para entender O QUE fazer -->

As a [USER_ROLE: nutritionist|trainer|user|admin]
I want [ACTION: specific, measurable action]
So that [BENEFIT: business value achieved]

Example:
As a nutritionist
I want to bulk import foods from CSV file
So that I save 2+ hours setting up database with 5000+ foods

---

## 📊 CONTEXT (Obrigatório)

### Current State
[Describe what exists today and why it's insufficient]

Example: "Currently nutritionists manually add foods one by one, taking ~1h per 100 foods"

### Desired State  
[Describe what should exist after implementation]

Example: "Nutritionist uploads foods.csv, system validates and imports in < 5 seconds"

### Business Impact
- **User savings**: [e.g., 2+ hours per setup]
- **Frequency**: [e.g., 5 times/month across all nutritionists]
- **Metric**: [e.g., 10 extra users can onboard weekly]

---

## 🎨 ACCEPTANCE CRITERIA (IA valida cada um)

**FUNCTIONAL** (o que fazer):
- [ ] `POST /api/v1/foods/import/csv` endpoint accepts multipart CSV file
- [ ] Validates CSV has 5 columns: name, calories, protein_g, carbs_g, fat_g (in this order)
- [ ] Returns 400 with detailed error if validation fails (row number + field + issue)
- [ ] File size limit: reject > 10MB with message "File too large (10MB max)"
- [ ] Duplicate detection: if food_name exists, skip or error? → [Choose one]

**TECHNICAL** (como implementar):
- [ ] Service: FoodImportService with methods parseCSV(), validateRow(), importBatch()
- [ ] Transaction: All or nothing (no partial imports)
- [ ] Database: Batch insert via JDBC (not N+1 queries)
- [ ] Logging: Log imported count, skipped count, errors (one entry per line)

**PERFORMANCE** (requisitos não-funcionais):
- [ ] P95 latency: < 5 seconds for 1000-row CSV
- [ ] P99 latency: < 10 seconds for 1000-row CSV
- [ ] Support: 10 concurrent import requests
- [ ] Memory: < 100MB for 10MB file

**TESTING** (Coverage ≥ 80%):
- [ ] Unit tests: Happy path (500 foods), edge cases (empty file, wrong format)
- [ ] Integration tests: DB persistence, duplicate handling
- [ ] E2E tests: Full upload flow + validation errors

**SECURITY** (non-negotiable):
- [ ] CSV injection protection (sanitize values before DB insert)
- [ ] File size validation BEFORE parsing (DOS prevention)
- [ ] User authorization: Only nutritionist+ can import
- [ ] Audit log: Record who imported, when, how many foods

**DOCUMENTATION** (README update):
- [ ] API docs: POST /foods/import/csv with example curl command
- [ ] CSV format guide: column names, data types, validation rules

---

## 🔄 SCENARIO (AI simulates user flow)

**Happy Path** (deve funcionar assim):
1. Nutritionist uploads foods.csv
2. System validates structure (5 columns)
3. System shows "✓ 500 foods will be imported, 10 duplicates skipped"
4. Nutritionist clicks "Confirm Import"
5. System imports in background, shows progress (if long)
6. Returns "✓ 500 foods imported, 10 skipped (duplicates)"
7. Nutritionist can immediately use imported foods in meals

**Error Path 1** - Wrong file format:
1. Nutritionist uploads foods.txt (wrong format)
2. System rejects: "File must be CSV format (.csv)"

**Error Path 2** - Missing columns:
1. Nutritionist uploads CSV with only 3 columns
2. System shows: "Invalid CSV format. Required 5 columns: name, calories, protein_g, carbs_g, fat_g (line 1 has 3)"

**Error Path 3** - Large file:
1. Nutritionist uploads 15MB file
2. System rejects: "File too large (10MB max). Your file is 15MB"

---

## 🏗️ IMPLEMENTATION STEPS (IA executa na ordem)

### Step 1: Create Service Class
**File**: src/main/kotlin/com/trainerhubamd/foods/service/FoodImportService.kt
**What**: Parse CSV, validate rows, persist to DB
**Code skeleton**:
\`\`\`kotlin
class FoodImportService(
    private val foodRepo: FoodRepository,
    private val logger: Logger
) {
    fun importCSV(file: MultipartFile): ImportResult {
        val foods = parseCSV(file)  // Returns List<FoodDTO>
        validateFoods(foods)         // Throws exception if invalid
        return persistFoods(foods)   // Returns count + errors
    }
}
\`\`\`

### Step 2: Create Controller Endpoint
**File**: src/main/kotlin/com/trainerhubamd/foods/controller/FoodImportController.kt
**Endpoint**: POST /api/v1/foods/import/csv
**What**: Accept file, call service, return result
**Response**: 
\`\`\`json
{
  "status": "success|error",
  "imported": 500,
  "skipped": 10,
  "errors": ["Row 5: food_name is required", "Row 10: calories must be number"]
}
\`\`\`

### Step 3: Add Validation Tests
**File**: src/test/kotlin/FoodImportServiceTest.kt
**What**: Test CSV parsing, validation, edge cases
**Test cases**:
- Happy path: 500 valid rows → 500 persisted
- Empty file → Error
- Missing columns → Error
- Invalid data type (calories="abc") → Error with row number
- 10MB file → Success
- 11MB file → Error (too large)

### Step 4: Add Security Checks
**File**: src/main/kotlin/com/trainerhubamd/foods/security/FoodImportSecurity.kt
**What**: 
- Check user role ≥ NUTRITIONIST
- Sanitize CSV values (remove SQL injection chars)
- Log audit trail

### Step 5: Create Database Migration
**File**: src/main/resources/db/migration/V2.1__add_food_import_audit_log.sql
**What**: Create audit_log table to track imports
\`\`\`sql
CREATE TABLE food_import_audit (
    id UUID PRIMARY KEY,
    nutritionist_id UUID NOT NULL,
    file_name VARCHAR(255),
    imported_count INT,
    skipped_count INT,
    errors TEXT,
    created_at TIMESTAMP
);
\`\`\`

### Step 6: Update API Documentation
**File**: README.md or docs/API.md
**What**: Add CSV format guide & example
\`\`\`
## Food Import CSV Format

Expected columns (ORDER MATTERS):
1. food_name (string, required, max 255 chars)
2. calories (number, required, 0-9999)
3. protein_g (number, required, 0-999)
4. carbs_g (number, required, 0-999)
5. fat_g (number, required, 0-999)

Example foods.csv:
\`\`\`csv
Apple,95,0.5,25,0.3
Banana,105,1.3,27,0.3
Chicken Breast,165,31,0,3.6
\`\`\`

---

## ✅ VALIDATION CHECKLIST (IA valida antes de submeter PR)

- [ ] All acceptance criteria implemented
- [ ] Code coverage ≥ 80% (unit + integration tests)
- [ ] Validation errors show row number + field + issue
- [ ] Performance verified: 1000-row CSV < 5 seconds
- [ ] Security: CSV injection + authorization + audit log
- [ ] Ktlint passes: \`./gradlew ktlintFormat\`
- [ ] All tests pass: \`./gradlew test integrationTest\`
- [ ] No SQL N+1 queries (batch insert only)
- [ ] Documentation updated (API docs + CSV format)
- [ ] Commit message: \`feat(foods): add CSV bulk import endpoint\`
- [ ] Branch name: \`feature/FOODS-001-csv-import\`

---

## 🔗 RELATED CONTEXT (IA lê para entender contexto)

**Related Database Tables**:
- \`foods\` table: id, name, calories, protein_g, carbs_g, fat_g, created_by
- \`food_import_audit\` table: see Step 5

**Related Services**:
- FoodService: existing service for single food operations
- NutritionService: validates macros after import

**Related APIs**:
- POST /meals/food-add: adds single food to meal
- GET /foods: list all foods

---

## 💬 PROMPT FOR AI TO START WORK

\`\`\`
You are resolving issue [FEATURE] foods: bulk CSV import

CONTEXT:
- User: nutritionist wants to import 1000+ foods from CSV
- Goal: Support bulk import, show progress, validate format, prevent errors
- Time: Should complete in < 5 days

YOUR TASK:
1. Read docs/INFRASTRUCTURE/CODING-STANDARDS.md for Kotlin patterns
2. Create 6 files in order (Step 1-6 above)
3. Each file: implement, test, validate
4. Commit progress: git commit -am "feat(foods): add CSV import step X/6"
5. After Step 6: Create PR with title "[FOODS] Add CSV bulk import endpoint"
6. PR description: List each acceptance criterion + checkmark if done

VALIDATION:
- './gradlew test integrationTest' must pass with 0 failures
- CSV parsing must handle 1000 rows in < 5 seconds
- All error paths tested
- Code coverage ≥ 80%

START: Read acceptance criteria, then implement Step 1
\`\`\`

---

## 📌 LABELS TO APPLY

\`\`\`
feature, needs-triage, area:foods, priority:high, effort:medium
\`\`\`
```

### 2️⃣ 🐛 Bug Report (AI-Optimized)

**Usar para**: Relatar comportamento incorreto em funcionalidade existente

**Resolução por IA**: ~1-3 dias (dependendo criticalidade)

```yaml
---
name: 🐛 Bug Report
about: Relatório de bug com passos exatos para reproduzir
title: "[BUG] <feature>: <observable issue>"
labels: ["bug", "needs-triage"]
---
```

### 📋 TEMPLATE (Copie e preencha todos os campos)

```
## 🐛 OBSERVABLE BUG (Obrigatório)
<!-- IA lê isto para entender O QUE está errado -->

**What user sees**:
[Describe exact observable behavior, not interpretation]

Example: "Screen shows error message 'Something went wrong' with no data saved"

**What user expects**:
[Describe what should happen instead]

Example: "Screen should show 'Meal saved successfully' and meal appears in list"

---

## 🔧 REPRODUCTION (IA testa esta sequência exata)

### Prerequisites (antes de começar)
- [ ] App version: [e.g., v1.0.5, NOT "latest"]
- [ ] Device: [e.g., iPhone 15, Pixel 6, macOS 14.2]
- [ ] OS version: [e.g., iOS 17.2, Android 14, macOS 14.2]
- [ ] Network: [WiFi / 4G / Offline / VPN]
- [ ] User role: [User / Nutritionist / Admin]
- [ ] Account type: [Has X meals / Fresh account / Admin setup]
- [ ] Test data: [Do I need special data to reproduce? e.g., "Meal with 5000+ calories"]

### Exact Reproduction Steps (execute in this order)
1. [Action 1: specific button/input, not vague]
   - E.g., "Tap 'Add Meal' button in top-right"
2. [Action 2]
   - E.g.: "Enter 'Chicken' in Food Name field"
3. [Action 3]
   - E.g.: "Tap 'Add to Meal' button"
4. [Observe]
   - E.g.: "Screen shows error message: 'Something went wrong'"

**Test it**: Can AI reproduce by following these steps exactly? If not, steps are incomplete.

---

## 🎯 IMPACT ASSESSMENT (IA prioritá fix na ordem certa)

**Severity** (choose one):
- [ ] 🔴 **BLOCKER**: Feature completely unusable (e.g., app crash, data loss)
- [ ] 🟠 **CRITICAL**: Major functionality broken (e.g., can't save meals at all)
- [ ] 🟡 **MAJOR**: Feature partially broken (e.g., can't save meals > 5000 cal)
- [ ] 🟢 **MINOR**: Edge case or cosmetic (e.g., button alignment wrong)

**Frequency**:
- [ ] Always reproducible (100% of attempts)
- [ ] Usually (> 80% of attempts)
- [ ] Sometimes (20-80% of attempts)
- [ ] Rare (< 20% of attempts)

**Users Affected**:
- Estimate: [e.g., "5 nutritionists", "all iOS users"]
- Data Loss Risk: [Yes / No]
- Security Risk: [Yes / No]

---

## 🔍 ROOT CAUSE HYPOTHESIS (IA formulates this)

**What component likely has the bug?**
- [ ] Frontend (UI logic, state management)
- [ ] API endpoint (validation, response format)
- [ ] Service layer (business logic)
- [ ] Database (queries, constraints)
- [ ] Infrastructure (network, deployment)

**Why do you think this?**
[E.g., "Error message is generic, suggests server-side issue. Check API logs."]

---

## 🐛 DEBUG INFORMATION (required for AI to investigate)

### Error Message (exact text)
\`\`\`
[Paste exact error text from screen, alert box, or logs]
\`\`\`

### Network Error (if API call failed)
\`\`\`
[Curl command that reproduces, or network request details]
Example:
POST /api/v1/meals HTTP/1.1
Host: api.traineramdcom
Content-Type: application/json

{"food_name": "Chicken", "calories": 165}

Response: 500 Internal Server Error
{"error": "Something went wrong"}
\`\`\`

### Error Logs (from server/app)
**Where to find**:
- iOS: Settings > Trainer Hub > Diagnostics > Export Logs
- Android: Enable Developer Mode > Check system logs
- Backend: \`tail -f logs/application.log | grep ERROR\`

**Paste log snippet** (last 20 lines around error):
\`\`\`
[2026-03-08 14:32:15] ERROR: NullPointerException at FoodService.kt:45
[2026-03-08 14:32:15]  at FoodController.saveMeal() (FoodController.kt:123)
...
\`\`\`

### Screenshots/Videos (if visual bug)
[Attach screenshot showing exact state]

---

## 💡 INVESTIGATION CHECKLIST (IA segue)

- [ ] Can I reproduce bug by following reproduction steps EXACTLY?
  - ✅ Yes → Proceed to Root Cause Analysis
  - ❌ No → Request more details (ask reporter to be more specific)

- [ ] Is this a data inconsistency (something in wrong state)?
  - ✅ Yes → Check database state + recent changes
  - ❌ No → Check application logs + network requests

- [ ] Does this bug affect multiple versions/platforms?
  - ✅ Yes → Likely shared service/database issue
  - ❌ No → Likely platform-specific (iOS/Android/Web)

---

## 🔨 FIX DEVELOPMENT (AI follows this)

### Diagnosis
1. Reproduce bug locally
2. Check error logs (backend)
3. Check network requests (DevTools)
4. Identify root cause (code, database, data)
5. Write test that reproduces bug (fail first)

### Implementation
1. Fix the bug in code
2. Run test → should PASS now
3. Run full test suite: \`./gradlew test\`
4. Test manually on target platform
5. Create PR with title: \`fix(foods): prevent null pointer in saveMeal when...\`

### Validation
- [ ] Reproduction steps no longer produce bug
- [ ] New test case added (prevents regression)
- [ ] Full test suite passes: \`./gradlew test integrationTest\` (0 failures)
- [ ] No new warnings/errors in logs
- [ ] Related functionality still works

---

## ✅ RESOLUTION CHECKLIST (IA submits when complete)

- [ ] Bug reproduced on [version X.Y.Z] 
- [ ] Root cause identified: [component name + description]
- [ ] Fix implemented in [file: src/...]
- [ ] Regression test added: [test file + method name]
- [ ] All tests pass: \`./gradlew test\` = 0 failures
- [ ] Manual verification: reproduction steps now PASS
- [ ] Commit message: \`fix(foods): prevent NPE in saveMeal by null-checking input\`
- [ ] PR created: \`[BUG] Fix null pointer when saving meal without calories\`
- [ ] PR links to this issue: "Closes #XXXX"

---

## 💬 PROMPT FOR AI TO START INVESTIGATION

\`\`\`
You are investigating bug [BUG] meal save fails with "Something went wrong"

CONTEXT:
- User: nutritionist on iOS 17.2 v1.0.5
- Reproduction: Tap "Add Meal" → Enter "Chicken" → Tap "Add to Meal" → Error appears
- Blocker: Users can't save meals at all on iOS

YOUR TASK:
1. Setup local environment to match: iOS 17.2, v1.0.5
2. Follow exact reproduction steps from issue
3. If you can reproduce:
   a. Check server logs for error message
   b. Inspect network request/response
   c. Identify root cause (null pointer? validation? data?)
   d. Write test that demonstrates bug
   e. Fix code to pass test
   f. Verify full test suite passes
   g. Create PR
4. If you can't reproduce:
   a. Ask for more details in comment
   b. List what you tried

START: Read the bug report, then try to reproduce on your machine
\`\`\`

---

## 📌 LABELS TO APPLY

\`\`\`
bug, needs-triage, area:[foods|meals|auth|etc], priority:[blocker|critical|major|minor]
\`\`\`
```

### 3️⃣ 📋 RFC - Request for Comments (AI-Optimized)

**Usar para**: Decisões arquiteturais, grandes refactors, trade-offs técnicos

**Resolução por IA**: ~5-10 dias (design review + implementation)

```yaml
---
name: 📋 RFC (Request for Comments)
about: Design decision com análise estruturada de trade-offs
title: "[RFC] <architecture>: <decision description>"
labels: ["rfc", "needs-triage"]
---
```

### 📋 TEMPLATE (Copie e preencha todos os campos)

```
## 🎯 OBJECTIVE (Obrigatório)
<!-- IA entende O QUE está sendo decidido e POR QUÊ -->

**Problem**: [What pain point / bottleneck / gap exists?]
Example: "Current JWT token refresh is manual, users get logged out without warning"

**Why Now**: [Why is this urgent / important?]
Example: "Mobile app usability complaint #1 from users (50+ complaints/month)"

**Target Metric**: [How will we know if solution is good?]
Example: "User logout complaints < 5/month after fix"

---

## 💡 PROPOSED SOLUTION & ALTERNATIVES (Structured for IA decision-making)

### Option A: [Name + 1 sentence]
**Mechanism**: [How it works]
Example: "Auto-refresh token 5 min before expiry via background timer"

**Advantages**:
- User never sees 401 (seamless UX)
- Simple to implement (< 8h)
- No server changes needed

**Disadvantages**:
- Requires background task on mobile (battery drain risk)
- Refreshes even if app in background (wasted API calls)
- Edge case: app changes token while offline

**Complexity**: LOW (estimate: 8h development)
**Risk Level**: LOW

---

### Option B: [Name + 1 sentence]
**Mechanism**: [How it works]
Example: "Server extends token TTL on every API call"

**Advantages**:
- Token always lives as long as active user
- No client-side background tasks
- Handles offline scenarios

**Disadvantages**:
- Server must track token usage patterns
- Slight latency per API call (set header in response)
- More complex: requires token middleware refactor

**Complexity**: MEDIUM (estimate: 15h development)
**Risk Level**: MEDIUM

---

### Option C: [Name + 1 sentence]
**Mechanism**: [How it works]
Example: "User manually refreshes token (explicit button)"

**Advantages**:
- Minimal code change
- No background tasks, server impact

**Disadvantages**:
- Poor UX (user gets 401 error)
- Defeats purpose of long session

**Complexity**: VERY LOW
**Risk Level**: NONE (but UX suffers)

---

## 📊 TRADE-OFF ANALYSIS (IA uses this to make decision)

| Criteria | Weight | Option A | Option B | Option C | Comment |
|----------|--------|----------|----------|----------|---------|
| UX Quality | 30% | 10/10 | 10/10 | 3/10 | Options A+B both solve UX |
| Implementation Complexity | 20% | 9/10 | 5/10 | 10/10 | A is fastest |
| Server Load | 20% | 4/10 | 6/10 | 9/10 | B increases API calls |
| Battery Impact (mobile) | 20% | 5/10 | 9/10 | 9/10 | A background task risk |
| Maintenance Burden | 10% | 8/10 | 5/10 | 9/10 | A simpler going forward |
| **WEIGHTED SCORE** | **100%** | **7.7/10** | **7.2/10** | **5.8/10** | **Winner** |

**RECOMMENDATION**: Option A (Auto-refresh)
**Rationale**: Best UX with fastest implementation, lower maintenance. Monitor battery impact in production.

---

## 🔧 IMPLEMENTATION PLAN (IA executes step by step)

### Phase 1: Design & Review (1-2 days)
- [ ] Create RFC as GitHub issue
- [ ] Tech Lead reviews + approves
- [ ] Product reviews for UX alignment
- [ ] Document decision in ADR (Architecture Decision Record)

### Phase 2: Implementation (3-5 days)
- [ ] Task 1: Create TokenRefreshScheduler service
- [ ] Task 2: Integrate into Auth service
- [ ] Task 3: Test on iOS + Android
- [ ] Task 4: Performance testing (battery, API load)

### Phase 3: Deployment (1-2 days)
- [ ] Deploy to staging
- [ ] Smoke test on real devices
- [ ] Deploy to production
- [ ] Monitor metrics (logout rate, API load)

**Total Timeline**: 5-9 days

---

## ⚠️ RISKS & MITIGATION PLAN (IA prepares for failure)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Excessive API calls drain server | MEDIUM | HIGH | Implement backoff: 1 refresh max per minute |
| Battery drain on mobile | MEDIUM | MEDIUM | Use OS-level background task limits, add telemetry |
| Token lost if app killed while refreshing | LOW | LOW | Store both old + new token, validate state |
| Offline scenario causes orphaned tokens | LOW | MEDIUM | Handle offline gracefully, retry on reconnect |

---

## 📊 SUCCESS METRICS (IA validates after deployment)

- [ ] User logout complaints drop from 50/month → < 5/month
- [ ] API token refresh call rate < 1% of total API calls
- [ ] Mobile battery drain < 2% increase vs baseline
- [ ] Zero data loss incidents related to token refresh
- [ ] Auto-refresh success rate > 99%

---

## 💬 PROMPT FOR AI TO IMPLEMENT THIS RFC

\`\`\`
You are implementing RFC [RFC] JWT auto-refresh on token expiry

CONTEXT:
- Goal: Users never see 401 Unauthorized (session stays alive)
- Approach: Auto-refresh token 5 min before expiry
- Timeline: 5-9 days
- Success: < 5 logout complaints/month (vs current 50/month)

YOUR TASK (in order):
1. Create TokenRefreshScheduler service (Phase 2, Task 1)
   - Schedule timer: every 5 min, check if token < 5min to expiry
   - If yes: call /api/v1/auth/refresh endpoint
   - If no: skip (no API call waste)

2. Integrate into Auth service (Phase 2, Task 2)
   - Start scheduler on app launch
   - Stop on logout
   - Handle network errors gracefully

3. Test (Phase 2, Task 3)
   - Unit tests: scheduler triggers at right time
   - Integration tests: actual token refresh via API
   - E2E tests: login → wait 55 min → ensure no 401

4. Measure battery impact (Phase 2, Task 4)
   - Track CPU usage per refresh
   - Compare baseline vs with-refresh
   - Document findings

5. Create PR: "feat(auth): implement auto JWT token refresh"
   - Link this RFC: "Closes #XXXX (RFC)"
   - Checklist: all acceptance criteria done

VALIDATION:
- ./gradlew test integrationTest = 0 failures
- Battery drain < 2% (measure before/after)
- Works on iOS 17+ and Android 14+

START: Review how current token refresh works, then implement scheduler
\`\`\`

---

## 📌 LABELS TO APPLY

\`\`\`
rfc, needs-triage, area:auth, priority:high, effort:medium
\`\`\`
```

### 4️⃣ ✅ Task / Chore (AI-Optimized)

**Usar para**: Trabalho técnico, refactoring, dependency updates, manutenção

**Resolução por IA**: ~1-3 dias (dependendo estimativa)

```yaml
---
name: ✅ Task / Chore
about: Trabalho técnico estruturado com passos exatos
title: "[TASK] <area>: <work description>"
labels: ["chore", "needs-triage"]
---
```

### 📋 TEMPLATE (Copie e preencha todos os campos)

```
## 📝 OBJECTIVE (Obrigatório)
<!-- IA entende O QUÊ fazer exatamente -->

**What**: Upgrade Kotlin from 1.8.0 to 1.9.2 across all services

**Why**: 
- Security: 3 CVE fixes in Kotlin 1.9+
- Performance: 15% improvement in compile time
- Feature: Sealed classes improvements needed for auth module

**Benefit**:
- All services use same version (consistency)
- Faster local dev builds
- Access to new language features

---

## ✅ ACCEPTANCE CRITERIA (IA valida cada um)

### Build & Compatibility
- [ ] Root build.gradle.kts updated to kotlin-gradle-plugin 1.9.2
- [ ] All 10 services compile without errors (\`./gradlew build\`)
- [ ] No deprecation warnings (run \`./gradlew build | grep "deprecat"\`)
- [ ] Target JVM: 21 (compatible with Kotlin 1.9.2)

### Testing
- [ ] All unit tests pass: \`./gradlew test\` = 0 failures
- [ ] All integration tests pass: \`./gradlew integrationTest\` = 0 failures
- [ ] Code coverage maintained ≥ 80%
- [ ] No new test failures introduced

### Quality
- [ ] Ktlint passes: \`./gradlew ktlintFormat\`
- [ ] No dependency conflicts (gradle dependency check clean)
- [ ] Kotlin 1.8 syntax removed, using 1.9 idioms where applicable
- [ ] IDE inspections: 0 errors

### Validation on Multiple Platforms
- [ ] Builds successfully on macOS (Intel + Apple Silicon)
- [ ] Builds successfully on Linux (Ubuntu 22.04)
- [ ] Builds successfully on Windows (Git Bash)
- [ ] Works with JDK 21 only (update docs)

---

## 🔄 STEP-BY-STEP IMPLEMENTATION (IA follows exactly)

### Step 1: Backup & Prepare (15 min)
**What**: Ensure no uncommitted changes, create branch
**Commands**:
\`\`\`bash
git status  # Must be clean
git checkout -b chore/INFRA-001-upgrade-kotlin-19

# Document current versions
./gradlew --version
java -version
\`\`\`

### Step 2: Update Root build.gradle.kts (10 min)
**File**: build.gradle.kts (root)
**Change**: kotlin-gradle-plugin version 1.8.0 → 1.9.2
**Code**:
\`\`\`kotlin
plugins {
    kotlin("jvm") version "1.9.2"  // was "1.8.0"
    kotlin("kapt") version "1.9.2" // was "1.8.0"
}

kotlin {
    jvmToolchain(21)  // Ensure JDK 21
}
\`\`\`
**Verify**: \`grep "kotlin.*1.9.2" build.gradle.kts\`

### Step 3: Update All Submodule build.gradle.kts Files (30 min)
**Files**: Each service's build.gradle.kts (foods/, auth/, meals/, etc.)
**Check**: \`find . -name "build.gradle.kts" -type f\`
**Update**: Any Kotlin version references to 1.9.2
**Each file**:
\`\`\`bash
# For each service
cd services/foods
# Update version in build.gradle.kts
# Check for kotlin plugin versions, bump to 1.9.2
\`\`\`

### Step 4: Clean & Rebuild (45 min)
**What**: Full rebuild to catch any compatibility issues
**Commands**:
\`\`\`bash
./gradlew clean
./gradlew build --refresh-dependencies
\`\`\`
**Expected**: BUILD SUCCESSFUL (or list specific errors to fix)
**If errors**: Fix each service's source code for Kotlin 1.9 compatibility

### Step 5: Run All Tests (60 min)
**Command**: \`./gradlew test integrationTest\`
**Expected**: All tests PASS
**If failures**: 
- Identify failing tests
- Fix code for Kotlin 1.9 compatibility
- Re-run until all pass

### Step 6: Remove Deprecation Warnings (30 min)
**Check**: \`./gradlew build 2>&1 | grep -i deprecat\`
**For each warning**:
- Find deprecated API usage
- Replace with new 1.9 equivalent
- Re-run tests

### Step 7: Update Documentation (10 min)
**File**: docs/SETUP.md or README.md
**Add**:
\`\`\`markdown
## Development Requirements

- JDK 21 (required for Kotlin 1.9.2)
- Gradle 8.0+
- IDE: IntelliJ IDEA 2023.1+ (with Kotlin 1.9.2 plugin)
\`\`\`

### Step 8: Commit (5 min)
**Command**:
\`\`\`bash
git add .
git commit -m "chore(infra): upgrade Kotlin from 1.8.0 to 1.9.2

- Update kotlin-gradle-plugin in root and all services
- All tests passing (0 failures)
- No deprecation warnings
- Target JVM: 21
- Improves build time by ~15%"
\`\`\`

---

## ⏱️ TIME ESTIMATE

| Step | Duration | Notes |
|------|----------|-------|
| 1: Backup | 15 min | Quick setup |
| 2: Root Gradle | 10 min | Single file |
| 3: Submodule Gradle | 30 min | ~10 services, parallel possible |
| 4: Clean Build | 45 min | Full rebuild (longest) |
| 5: Run Tests | 60 min | Unit + integration tests |
| 6: Fix Warnings | 30 min | Usually quick fixes |
| 7: Docs | 10 min | Update setup guide |
| 8: Commit | 5 min | Final commit |
| **TOTAL** | **~3-4 hours** | Can be optimized in parallel |

---

## ✅ VALIDATION CHECKLIST (IA checks before submitting)

- [ ] No uncommitted changes: \`git status\` = clean
- [ ] Branch created: \`git branch --list | grep kotlin\`
- [ ] All services compile: \`./gradlew build\` = SUCCESS
- [ ] Unit tests pass: \`./gradlew test\` = 0 failures
- [ ] Integration tests pass: \`./gradlew integrationTest\` = 0 failures
- [ ] Code coverage maintained: ≥ 80% (check coverage report)
- [ ] No deprecation warnings: \`grep -i deprecat build-output.log\` = empty
- [ ] Documentation updated: README/SETUP.md mentions JDK 21 requirement
- [ ] Kotlin version verified: \`./gradlew --version | grep Kotlin\` shows 1.9.2
- [ ] Works locally on your machine: builds + all tests pass
- [ ] Commit message follows Conventional Commits format
- [ ] Ready for PR: branch pushed, commits clean, tests green

---

## 💬 PROMPT FOR AI TO START TASK

\`\`\`
You are completing task [TASK] Upgrade Kotlin from 1.8.0 to 1.9.2

CONTEXT:
- All 10 backend services use Kotlin 1.8.0
- Need to upgrade to 1.9.2 for security + performance
- Must maintain ≥80% test coverage
- Timeline: 1 day

YOUR TASK (follow Step 1-8 exactly in order):
1. Create branch: chore/INFRA-001-upgrade-kotlin-19
2. Update build.gradle.kts files (root + each service)
3. Run full build to catch compatibility issues
4. Fix any Kotlin 1.8 → 1.9 incompatibilities
5. Run all tests (unit + integration) = 0 failures
6. Update documentation with JDK 21 requirement
7. Create commit with detailed message
8. Push and create PR: "[TASK] Upgrade Kotlin to 1.9.2"

VALIDATION (before submitting PR):
- ./gradlew test = 0 failures
- ./gradlew integrationTest = 0 failures
- Code coverage ≥ 80%
- No deprecation warnings
- Builds on macOS, Linux, Windows

START: Create branch, then follow Step 1
\`\`\`

---

## 📌 LABELS TO APPLY

\`\`\`
chore, needs-triage, area:infra, effort:small, priority:medium
\`\`\`
```

### 5️⃣ 📚 Documentation (AI-Optimized)

**Usar para**: Documentation updates, API docs, architecture guides, troubleshooting

**Resolução por IA**: ~1-2 dias (depende da complexidade)

```yaml
---
name: 📚 Documentation
about: Documentation with exact format + examples required
title: "[DOCS] <topic>: <what needs documenting>"
labels: ["documentation", "needs-triage"]
---
```

### 📋 TEMPLATE (Copie e preencha todos os campos)

```
## 📖 OBJECTIVE (Obrigatório)
<!-- IA entende O QUÊ documentar -->

**Current State**: [What documentation exists today, if any?]
Example: "Token refresh is mentioned in README, but no step-by-step guide"

**Documentation Gap**: [What's missing or unclear?]
Example: "Developers don't know how to implement token refresh in their apps"

**Target Audience**: [Who will read this?]
Example: "Mobile developers, new to project, first time implementing auth"

**Success Metric**: [How will we know docs are good?]
Example: "New dev can implement token refresh in < 2h without asking questions"

---

## 📚 DOCUMENTATION TYPE (Choose one)

- [ ] **API Documentation** (endpoint specs, request/response, examples)
- [ ] **Developer Guide** (how to implement feature locally)
- [ ] **User Guide** (how end-users use feature)
- [ ] **Architecture Decision Record** (why we chose this approach)
- [ ] **Troubleshooting** (common problems + solutions)
- [ ] **Process Guide** (how to do something: deploy, release, etc.)

**Selected**: [e.g., "Developer Guide for Token Refresh"]

---

## 🎨 CONTENT STRUCTURE (IA formats documentation this way)

### Section 1: Overview (100-200 words)
**What**: 1-paragraph explanation of topic, why it matters
**Audience**: All developers
**Content**:
```
Token refresh is the mechanism that keeps user sessions alive without manual login.
When a token expires (default: 1 hour), the app automatically requests a new one,
ensuring seamless UX. This guide explains how to implement and test token refresh.
```

### Section 2: Prerequisites (Checklist)
**What**: What dev needs before following guide
**Content**:
```
- [ ] Local dev environment setup complete (see SETUP.md)
- [ ] Understand JWT tokens (see ../01-AUTH.md)
- [ ] Access to test account with auth enabled
- [ ] API running on localhost:8080
```

### Section 3: Step-by-Step Implementation (Numbered)
**What**: Exact steps with code examples
**Each step format**:
1. [Action in plain language]
2. [Code snippet if applicable]
3. [How to verify it works]

**Example**:
```
**Step 1**: Create TokenRefreshScheduler service
- File: src/main/kotlin/com/trainerhubamd/auth/TokenRefreshScheduler.kt
- Code:
\`\`\`kotlin
class TokenRefreshScheduler(private val authService: AuthService) {
    fun startRefresh() { /* implementation */ }
}
\`\`\`
- Verify: Class compiles, no IDEerrors

**Step 2**: Inject into AuthManager
- File: src/main/kotlin/com/trainerhubamd/auth/AuthManager.kt
- Change: Add \`TokenRefreshScheduler\` to constructor
- Verify: Tests pass for AuthManager
```

### Section 4: Verification Checklist
**What**: How to know it's working
**Format**: Step = Verification
```
- [ ] Step 1 complete → Run unit tests: \`./gradlew test -k TokenRefresh\`
- [ ] Step 2 complete → Start app, check logs for "Token refresh scheduled"
- [ ] All steps complete → Full flow test: login → wait → check token alive
```

### Section 5: Common Issues & Solutions
**What**: Troubleshooting
**Format**: Problem → Solution
```
**Q: "App crashes when token expires"**
A: Make sure TokenRefreshScheduler is initialized in Application.onCreate()

**Q: "Token refreshes every 5 seconds (too much)"**
A: Check scheduler interval logic. Should only refresh if token < 5min to expiry.
```

### Section 6: References & Links
**What**: Links to related docs
**Content**:
```
- Full auth flow: docs/AUTH-FLOW.md
- JWT spec: https://jwt.io/
- Testing guide: docs/TESTING.md#mocking-auth
```

---

## ✅ ACCEPTANCE CRITERIA (IA validates each)

### Content Quality
- [ ] Title + overview section explains topic in < 200 words
- [ ] Audience identified (backend / mobile / devops)
- [ ] Prerequisites listed (what they need before reading)
- [ ] All steps have code examples (no vague instructions)
- [ ] Each step has verification method (how to test it works)
- [ ] Common issues section covers ≥ 5 expected questions
- [ ] No jargon without explanation (or link to glossary)

### Structural Quality
- [ ] Uses consistent markdown formatting (headers, code blocks, lists)
- [ ] All code examples copy-paste ready (no [PLACEHOLDER] text)
- [ ] Code examples run without errors when tested
- [ ] File paths accurate (checked against actual repo)
- [ ] Command examples tested (e.g., \`./gradlew test\`)
- [ ] All links work (internal + external)

### Reading Experience
- [ ] Can be read in < 30 min for typical developer
- [ ] Includes visual aids (diagrams, screenshots, if helpful)
- [ ] Written in active voice, imperative mood
- [ ] No typos, grammar errors (spell checked)
- [ ] Tone is friendly + encouraging

### Meta
- [ ] Document title follows format: "[DOCS] topic: description"
- [ ] Includes version number (e.g., v1.0)
- [ ] Includes "last updated: DATE"
- [ ] Includes "next review: DATE + 3 months"
- [ ] Author/owner listed (who to ask for updates)

---

## 📍 DOCUMENTATION FILE LOCATION

**Determine correct folder**:
- API docs → \`docs/API/\` (e.g., \`docs/API/AUTH-ENDPOINTS.md\`)
- Developer guides → \`docs/GUIDES/\` (e.g., \`docs/GUIDES/TOKEN-REFRESH-SETUP.md\`)
- Architecture decisions → \`docs/ARCHITECTURE/\` (e.g., \`docs/ARCHITECTURE/ADR-001-jwt-refresh.md\`)
- Troubleshooting → \`docs/TROUBLESHOOTING/\` (e.g., \`docs/TROUBLESHOOTING/AUTH-ISSUES.md\`)
- Infrastructure → \`docs/INFRASTRUCTURE/\` (for internal team processes)

**File naming**: 
- Use kebab-case (lowercase, dashes):  \`token-refresh-guide.md\`
- Prefix with number if sequence: \`01-setup.md, 02-implementation.md\`
- Clear topic name: \`api-meal-endpoints.md\` (not \`doc1.md\`)

---

## 🔄 WRITING PROCESS (IA follows this)

### Draft (30 min)
- Outline sections: Overview, Prerequisites, Steps, Verification, Troubleshooting
- Write rough content (don't worry about perfection)
- Include placeholder [CODE EXAMPLES] where needed

### Code Examples (30 min)
- Copy exact code from project
- Test each example (click run, verify works)
- Remove secrets, credentials, personal data
- Add comments explaining key lines

### Polish (30 min)
- Fix typos, grammar, formatting
- Add links to related docs
- Verify links work
- Test markdown rendering (GitHub, local preview)

### Review (15 min)
- Read full document as if you're first-time reader
- Check: Can I understand?
- Check: Can I follow steps?
- Fix unclear sections

---

## ✅ VALIDATION CHECKLIST (IA checks before submitting)

- [ ] Title clear: "[DOCS] feature: what I documented"
- [ ] Overview < 200 words, explains why it matters
- [ ] Prerequisites listed and accurate
- [ ] All code examples tested and working
- [ ] Each step has "How to verify" section
- [ ] Troubleshooting covers ≥ 5 common issues
- [ ] No [PLACEHOLDER] text left (all examples filled in)
- [ ] Links work (tested click each one)
- [ ] Spelling/grammar checked (no typos)
- [ ] File path matches project structure
- [ ] Commit message: \`docs(auth): add token refresh setup guide\`
- [ ] PR title: "[DOCS] Add token refresh implementation guide"

---

## 💬 PROMPT FOR AI TO WRITE DOCUMENTATION

\`\`\`
You are writing documentation: [DOCS] token refresh: implementation guide

CONTEXT:
- Audience: Mobile + backend developers (new to project)
- Complexity: Medium (they understand auth, new to this refresh mechanism)
- Success criteria: New dev can implement in < 2h without asking questions
- Timeline: 1 day

YOUR TASK:
1. Create outline with 6 sections (Overview, Prerequisites, Steps, Verify, Issues, Links)
2. Write each section with required content:
   - Overview: 1 paragraph explaining what + why
   - Prerequisites: 3-5 things they need first
   - Steps: 5-7 numbered steps, each with code example + verification
   - Troubleshooting: 5+ Q&A pairs covering common mistakes
   - Links: references to related docs
3. Test all code examples:
   - Copy exact from project repo
   - Run locally to ensure it works
   - Verify no errors/warnings
4. Format with markdown:
   - Headers (#, ##, ###)
   - Code blocks with language (\`\`\`kotlin)
   - Checklists (- [ ])
   - Links [text](url)
5. Spell check + grammar check
6. Create PR: "[DOCS] Add token refresh implementation guide"

VALIDATION (before submitting):
- Can a new dev read this in 30 min? (If > 30 min, shorten)
- Can they copy-paste code examples? (If not clear, add comments)
- Are all steps testable? (If not, add verification method)
- Test links work? (If broken, fix)

START: Read existing token refresh code, then write overview section first
\`\`\`

---

## 📌 LABELS TO APPLY

\`\`\`
documentation, needs-triage, area:[api|guide|architecture|process], effort:small
\`\`\`
```

---

## 🔄 ISSUE RESOLUTION WORKFLOW (Para IA)

### Fluxo Automático que IA Segue

```
1. ISSUE CREATED (by human or AI agent)
   ├─ Template filled completely
   ├─ All required fields present
   └─ Acceptance criteria clear

2. IA READS & PARSES
   ├─ Understand OBJECTIVE (intent)
   ├─ Extract ACCEPTANCE CRITERIA (success definition)
   ├─ Collect CONTEXT (what exists, what should exist)
   └─ Plan IMPLEMENTATION STEPS (step-by-step)

3. IA IMPLEMENTS
   ├─ Follow steps in exact order
   ├─ Write code/docs/tests
   ├─ Commit progress: git commit (Conventional Commits)
   ├─ Validate each step
   └─ Run tests (\`./gradlew test\`)

4. IA VALIDATES
   ├─ Check all acceptance criteria ✓
   ├─ Run full test suite = 0 failures
   ├─ Verify no regressions
   └─ Code coverage ≥ 80%

5. IA SUBMITS
   ├─ Create PR with detailed description
   ├─ Link issue: "Closes #XXXX"
   ├─ Add checklist of completed criteria
   ├─ Request human review if needed
   └─ Respond to feedback in comments

6. HUMAN REVIEWS (Optional)
   ├─ Read PR description (from IA)
   ├─ Check implementation matches issue
   ├─ Request changes if needed
   └─ Approve & merge OR ask IA to fix

7. ISSUE RESOLVED
   ├─ PR merged → issue auto-closes
   ├─ Metrics updated
   └─ Done! ✓
```

---

## 📊 ISSUE CATEGORIZATION (para IA priorizar)

### By Impact (quem resolve primeiro)

| Priority | Resolution SLA | Criteria | Who | Example |
|----------|----------------|----------|-----|---------|
| 🔴 **Blocker** | < 4h | App crash, data loss, security | AI + Human | "App crashes on iOS login" |
| 🟠 **Critical** | < 24h | Feature completely broken | AI | "Can't create meals on Android" |
| 🟡 **Major** | < 5 days | Feature partially broken | AI | "Meal save fails if > 5000 cal" |
| 🟢 **Minor** | < 14 days | Edge case, slow, cosmetic | AI | "Dashboard slow on large datasets" |

### By Type (como IA deve abordar)

| Type | Approach | Typical Time | Example |
|------|----------|--------------|---------|
| 🚀 **Feature** | Design → Implement → Test → Docs | 2-5 days | CSV food import |
| 🐛 **Bug** | Reproduce → Root cause → Fix → Test | 1-3 days | Token refresh fails |
| 📋 **RFC** | Analyze options → Choose best → Plan implementation | 5-10 days | JWT refresh architecture |
| ✅ **Task** | Follow step-by-step → Validate | 1-3 days | Upgrade Kotlin 1.9 |
| 📚 **Documentation** | Outline → Write → Test → Polish | 1-2 days | Auth setup guide |

---

## 🤖 PROMPTS FOR IA BY ISSUE TYPE

### Bug Investigation Prompt

\`\`\`
You are investigating: [BUG] <issue title>

MUST DO (in order):
1. Read OBJECTIVE + IMPACT ASSESSMENT
2. Reproduce exactly by following "Exact Reproduction Steps"
3. If reproduced: Check error logs, identify root cause
4. Write test that demonstrates bug (fail first)
5. Fix code to make test pass
6. Verify full test suite passes
7. Create PR with fix

IF YOU CAN'T REPRODUCE:
- Ask for more details in comment
- List exactly what you tried
- Ask reporter to be more specific

SUCCESS = Issue no longer reproducible
\`\`\`

### Feature Implementation Prompt

\`\`\`
You are implementing: [FEATURE] <issue title>

MUST DO (in order):
1. Read OBJECTIVE to understand what user wants
2. Review ACCEPTANCE CRITERIA—these are your success definition
3. Read IMPLEMENTATION STEPS
4. Execute each step in order
5. After each step: commit progress
6. Run tests after each step
7. When all steps done: create PR
8. PR includes checklist of all acceptance criteria

SUCCESS = All acceptance criteria ✓, tests pass, PR ready
\`\`\`

### Task Execution Prompt

\`\`\`
You are completing: [TASK] <issue title>

MUST DO (exactly):
1. Read OBJECTIVE (know what + why)
2. Follow STEP-BY-STEP IMPLEMENTATION in exact order
3. Run VALIDATION CHECKLIST before submitting
4. Create commit + push + PR when complete

SUCCESS = All steps done, validation checklist ✓, PR created
\`\`\`

---

## ✅ UNIVERSAL CHECKLIST (IA valida antes de submeter PR)

**ANTES DE CRIAR PR**:
- [ ] Objective claramente entendido (sei o QUÊ fazer)
- [ ] Todas acceptance criteria implementadas (sei se terminei)
- [ ] Todos testes passam: \`./gradlew test integrationTest\` = 0 failures
- [ ] Código coverage ≥ 80% (verificar coverage report)
- [ ] Sem erros de lint: \`./gradlew ktlintFormat\` = clean
- [ ] Sem segurança issues (check SECURITY section in issue)
- [ ] Documentação atualizada (se aplicável)
- [ ] Branch criada com naming convention: \`feature/JIRA-ID-description\`
- [ ] Commits seguem Conventional Commits format
- [ ] Git history limpo (sem merge commits desnecessários)

**NA PR**:
- [ ] Título segue format: \`[AREA] verb what\` (e.g., \`[FOODS] Add CSV bulk import\`)
- [ ] Descrição inclui: OBJECTIVE + O QUE FOI IMPLEMENTADO + ACCEPTANCE CRITERIA CHECKLIST
- [ ] Links para issue: \`Closes #XXXX\`
- [ ] Links para RFCs relacionadas (se existe)
- [ ] Reviewers sugeridos (se humano review necessário)

**LABELS**:
- [ ] Type (feature, bug, rfc, chore, documentation)
- [ ] Area (auth, meals, food, etc)
- [ ] Effort (small, medium, large)
- [ ] Priority (se open issue, já deve ter label)

---

## 📌 ISSUE LIFECYCLE (exemplos reais)

### Feature: CSV Food Import (Happy Path)

```
Day 1:
  [FEATURE] foods: bulk CSV import (opens with full template)
  → IA reads objective + acceptance criteria
  
Day 2-3:
  IA implements 6 steps, commits progress

Day 3:
  IA creates PR [FOODS] Add CSV bulk import
  → PR includes checklist of acceptance criteria
  → All tests passing

Day 3-4:
  Human reviewer checks PR
  → Approves changes
  → PR merged
  
Auto:
  "Closes #XXXX" in PR title → Issue auto-closes
  → Metrics updated
  
Result:
  ✓ Feature shipped
  ✓ Tests covering functionality
  ✓ Documentation updated
```

### Bug: Token Not Refreshing (Resolution Path)

```
Day 0:
  [BUG] JWT token not refreshing after 1h (opens with reproduction steps)
  → Marked CRITICAL (users can't stay logged in)

Day 1:
  IA investigates
  → Reproduces: Login → wait 1h → observe 401
  → Checks logs: "Token refresh service not running"
  → Identifies root cause: Service not initialized
  → Writes test demonstrating bug
  
Day 1:
  IA implements fix
  → Initialize service on app startup
  → Test passes
  → Full test suite passes
  
Day 1:
  IA creates PR [BUG] Fix JWT token refresh on app startup
  → Explains root cause
  → Links to issue: "Closes #BUG-042"
  
Day 1-2:
  Human review (SLA: < 24h for critical)
  → Approves
  → Merged
  
Result:
  ✓ Users stay logged in after 1h
  ✓ Bug prevented from happening again (test coverage)
  ✓ Issue resolved
```

---

## 🔗 LINKING ISSUES TO CODE

### In Commit Messages

```bash
# Good commit
git commit -m "feat(meals): add serving size validation for user meals

- Validate serving_size > 0 and < 1000
- Return 400 with specific error message if invalid
- Add 5 unit tests for edge cases

Closes #MEALS-042
Related #UI-100"

# Bad commit (doesn't link to issue)
git commit -m "fix validation"
```

### In Pull Request

```markdown
## 🔗 Issues

Closes #MEALS-042

Related:
- #MEALS-001 (meal creation)
- #DB-015 (schema migration)

Blocks:
- #UI-100 (frontend meal form)
```

---

## 📈 METRICS (Track Issue Quality)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Avg resolution time** | < 7 days | GitHub Insights |
| **Critical bug SLA** | < 24h | Check closed issues |
| **Open issue count** | < 50 | GitHub Issues page |
| **Acceptance criteria met** | 100% | PR checklist |
| **Test coverage added** | ≥ 80% | Coverage report |
| **No regressions** | 0 | After deploy, check error rate |

---

## 🎓 QUICK REFERENCE

**When IA reads issue, look for**:
1. ✅ **OBJECTIVE** - The goal (what to build/fix)
2. ✅ **ACCEPTANCE CRITERIA** - How to know when done
3. ✅ **CONTEXT** - What exists now, what should exist
4. ✅ **STEPS** - How to implement (usually numbered)
5. ✅ **VALIDATION** - How to test/verify

**If any of these missing** → Issue is incomplete, ask for clarification

**When submitting PR**:
1. ✅ Title format: \`[AREA] verb description\`
2. ✅ Description: OBJECTIVE + CHECKLIST OF CRITERIA
3. ✅ Links: "Closes #XXXX" for auto-closing
4. ✅ Tests: All passing (\`./gradlew test\` = 0 failures)
5. ✅ Coverage: ≥ 80% maintained

---

## 📚 Learn More

- [GitHub Issues Docs](https://docs.github.com/en/issues)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [PR Best Practices](docs/PR-STANDARDS.md)
- [Testing Guide](docs/TESTING-STRATEGY.md)
- [Coding Standards](docs/CODING-STANDARDS.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-03-08 | AI-optimized templates with explicit prompts, structured formats, validation checklists |
| 1.0 | 2026-03-08 | Initial issue templates for Feature, Bug, RFC, Task, Documentation |
