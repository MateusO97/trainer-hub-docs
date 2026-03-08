# Issue Templates & Tracking Standards

**Document ID**: ISSUE-TEMPLATES-001  
**Version**: 1.0  
**Created**: March 8, 2026  
**Owner**: Product / Project Management

---

## 📋 Executive Summary

Este documento define **templates de issues** e padrões para rastreamento de trabalho no GitHub, assegurando:

✅ Descrições consistentes e claras  
✅ Auto-categorização por tipo  
✅ Rastreabilidade em PRs e commits  
✅ Priorização clara  
✅ Integração com workflows  

---

## 🎯 Issue Types & Templates

### 1️⃣ Feature Request

**Usar para**: Nova funcionalidade, melhoria de produto

**Location**: `.github/ISSUE_TEMPLATE/feature.md`

```markdown
---
name: 🚀 Feature Request
about: Suggest a new feature or enhancement
title: "[FEATURE] "
labels: ["feature", "triage"]
---

## 🎯 User Story
<!-- Descrever em formato de user story -->

As a [user type], I want [action], so that [benefit]

Example:
As a **nutritionist**, I want to **bulk import** foods from CSV, so that I can **save time setting up the database**

## 📝 Description
<!-- Detailed explanation of the feature -->

## 🎨 Acceptance Criteria

- [ ] **Criterion 1**: Clear, testable condition
- [ ] **Criterion 2**: Another measurable requirement
- [ ] **Criterion 3**: Performance requirement (if applicable)

Example:
- [ ] CSV import accepts 5 columns: food_name, calories, protein, carbs, fat
- [ ] File size limit: 10MB per upload
- [ ] Validation errors displayed inline with row numbers
- [ ] Import completes in < 5 seconds for 1000 rows

## 📊 Performance Requirements
<!-- If applicable -->

- **Target P95 latency**: < 5s for 1000-row CSV
- **Maximum file size**: 10 MB
- **Concurrent imports**: Support 10 simultaneous uploads

## 🔗 Related Issues / PRs
<!-- Link related issues or PRs -->

- Related: #MEALS-001
- Blocks: #MEALS-042

## 📎 Additional Context
<!-- Screenshots, mockups, links to design, etc -->

[Add screenshot, design mockup, or link to discussion]

## 🏷️ Labels to Apply
- feature
- enhancement
- [area: meals, auth, nutrition, etc]
- priority: [critical, high, medium, low]
```

### 2️⃣ Bug Report

**Usar para**: Relatar comportamento incorreto em funcionalidade existente

**Location**: `.github/ISSUE_TEMPLATE/bug.md`

```markdown
---
name: 🐛 Bug Report
about: Report a bug or issue
title: "[BUG] "
labels: ["bug", "triage"]
---

## 🐛 Description
<!-- Clear description of the bug -->

## 🔄 Steps to Reproduce

1. Open [screen/page]
2. Click [button]
3. Enter [data]
4. Observe [unexpected behavior]

## ✅ Expected Behavior
<!-- What should happen -->

The application should display success message and persist the data.

## ❌ Actual Behavior
<!-- What actually happens -->

The application shows generic error message and no data is saved.

## 📸 Screenshots / Videos
<!-- Attach evidence of the bug -->

## 🌍 Environment

- **App Version**: v1.0.5
- **Platform**: iOS / Android / Web
- **OS Version**: iOS 17.2 / Android 14
- **Device**: iPhone 15 / Pixel 6
- **Network**: WiFi / 4G / Offline

## 🔍 Error Logs

```
<Paste relevant error logs, stack traces, or network errors>
```

## 🔁 Frequency

- [ ] Always reproducible
- [ ] Sometimes (percentage: ___)
- [ ] Rarely

## 💥 Impact

- [ ] Blocker (feature unusable)
- [ ] Critical (data loss / security)
- [ ] Major (significant degradation)
- [ ] Minor (cosmetic / rare)

## 🔗 Related Issues
<!-- Link to similar issues -->

- Related: #AUTH-042
- Duplicate of: #MEALS-001

## 🏷️ Labels to Apply
- bug
- [area: meals, auth, etc]
- priority: [critical, high, medium, low]
```

### 3️⃣ RFC (Request for Comments)

**Usar para**: Decisões arquiteturais, grandes refactors, trade-offs técnicos

**Location**: `.github/ISSUE_TEMPLATE/rfc.md`

```markdown
---
name: 📋 RFC (Request for Comments)
about: Propose significant architectural or design changes
title: "[RFC] "
labels: ["rfc", "architecture"]
---

## 📋 Proposal Title
<!-- Clear, concise title of the proposal -->

## 🎯 Objective
<!-- What problem does this solve? Why now? -->

## 📝 Problem Statement
<!-- Background and motivation -->

## 💡 Proposed Solution
<!-- Detailed explanation of the proposed approach -->

## 🎨 Design / Architecture

```
[Diagram, flowchart, or architecture sketch]
```

### Option A: [Alternative 1]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]

### Option B: [Alternative 2]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]

## 📊 Trade-offs & Rationale

| Aspect | Option A | Option B | Chosen |
|--------|----------|----------|--------|
| Performance | Good | Excellent | Option B |
| Complexity | Low | Medium | Option A |
| Maintainability | High | Medium | Option A |
| **Score** | 8/10 | 8/10 | Tie |

**Decision**: Choosing **Option A** because simplicity is more important for MVP timeline.

## 🔧 Implementation Plan

1. Phase 1: [Subtask 1]
2. Phase 2: [Subtask 2]
3. Phase 3: [Subtask 3]

## ⏱️ Timeline
- **Design Review**: [Date]
- **Implementation**: 4-6 weeks
- **Testing**: 1 week
- **Deployment**: [Target date]

## 🚨 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| [Risk 1] | High | High | [Mitigation] |
| [Risk 2] | Medium | Low | [Mitigation] |

## 🎓 References & Prior Art
<!-- Links to similar solutions, external resources -->

- [Reference 1]
- [Reference 2]

## 👥 Stakeholders

- [ ] Tech Lead: [Name]
- [ ] Product: [Name]
- [ ] QA: [Name]

## 🏷️ Labels to Apply
- rfc
- architecture
- [area: meals, auth, infra, etc]
```

### 4️⃣ Task / Chore

**Usar para**: Trabalho técnico, refactoring, dependency updates

**Location**: `.github/ISSUE_TEMPLATE/task.md`

```markdown
---
name: ✅ Task / Chore
about: Technical work, refactoring, or maintenance
title: "[TASK] "
labels: ["chore", "triage"]
---

## 📝 Description
<!-- Clear description of the task -->

Upgrade Kotlin from 1.8.0 to 1.9.2 and verify compatibility with all services.

## 🎯 Acceptance Criteria

- [ ] Kotlin upgraded in all services
- [ ] All tests passing (unit + integration)
- [ ] Ktlint passing
- [ ] No deprecation warnings
- [ ] PR reviewed and merged

## 🔄 Implementation Steps

1. Update build.gradle.kts in root project
2. Update kotlin-gradle-plugin to 1.9.2
3. Run ./gradlew build to check compatibility
4. Resolve any deprecation warnings
5. Test on macOS, Linux, and Windows

## ⏱️ Estimated Effort

- **Development**: 4h
- **Testing**: 2h
- **Review**: 1h
- **Total**: 7h

## 🔗 Related Issues / PRs
<!-- Link to related work -->

## 🏷️ Labels to Apply
- chore
- [type: dependency, refactor, docs]
- [area: backend, mobile, infra]
- priority: [low, medium, high]
```

### 5️⃣ Documentation

**Usar para**: Documentation updates, API docs, guides

**Location**: `.github/ISSUE_TEMPLATE/documentation.md`

```markdown
---
name: 📚 Documentation
about: Documentation improvements
title: "[DOCS] "
labels: ["documentation"]
---

## 📖 Documentation Type

- [ ] API documentation
- [ ] Developer guide
- [ ] User guide
- [ ] Architecture decision record
- [ ] Process documentation

## 📝 What needs to be documented?

<!-- Clear description of documentation gap -->

## 🎯 Acceptance Criteria

- [ ] Document is comprehensive and clear
- [ ] Examples provided for complex topics
- [ ] Links to related documentation
- [ ] Spell check completed
- [ ] Reviewed by stakeholder

## 📎 Additional Context

<!-- Links to related documentation, screenshots, etc -->

## 🏷️ Labels to Apply
- documentation
- [topic: api, guide, howto, etc]
```

---

## 📊 Issue Status Workflow

```
OPEN
  ├── Needs Triage
  │   ├── Approved → Backlog
  │   └── Rejected → Closed (won't fix)
  │
  ├── Backlog
  │   └── → Assigned (sprint planning)
  │
  ├── In Progress
  │   └── → PR Created
  │
  └── PR Created
      ├── → In Review
      └── → Closed (after PR merged)
```

### Labels Standard

| Category | Values |
|----------|--------|
| **Type** | bug, feature, rfc, chore, documentation |
| **Area** | auth, meals, food, nutrition, ai, infra, mobile |
| **Priority** | critical, high, medium, low |
| **Status** | triage, backlog, in-progress, in-review, blocked |
| **Effort** | small (< 2h), medium (2-5h), large (5-20h) |

---

## 🎯 Creating Good Issues

### ✅ Good Issue Example

```
Title: [BUG] JWT token not refreshing after 1 hour

Description:
User logs in, token works fine for < 1h.
After 1h, all requests return 401 Unauthorized.
Refresh token should be called automatically, but isn't.

Steps to Reproduce:
1. Login to app
2. Wait 1 hour (or advance system clock)
3. Try any action (eat meal, view dashboard)
4. Observe: 401 response, session ends

Expected: App silently refreshes token, action continues
Actual: User logged out without warning

Environment: iOS 17.2, v1.0.5
Priority: Critical (blocks usage)
```

### ❌ Bad Issue Example

```
Title: Token not working

Description: Token issue when logged in too long

Steps: Use app for a while then something breaks

Actual behavior: doesn't work

Expected behavior: should work
```

---

## 🔗 Linking Issues to Code

### In Commit Messages

```bash
git commit -m "feat(auth): implement JWT refresh mechanism

- Auto-refresh when token < 5 min to expiry
- Use refresh token via POST /auth/refresh
- Persist new token to secure storage

Closes #AUTH-042
Related #AUTH-001"
```

### In Pull Requests

```markdown
## 🔗 Issues

Closes #AUTH-042
Closes #AUTH-001

Related: #SEC-015
Blocks: #AI-001
```

### Auto-closing PRs

When PR is merged with "Closes #XXXX" in title/description:
→ GitHub auto-closes the issue

---

## 📋 Issue Checklist Template

**For issue creators**:

- [ ] Issue title is clear and specific
- [ ] Issue type (bug, feature, rfc, task) selected
- [ ] All required fields filled
- [ ] Screenshots/logs attached (if applicable)
- [ ] Labels applied (type, area, priority)
- [ ] Related issues linked
- [ ] No duplicate (search existing issues first)

**For reviewers/triagers**:

- [ ] Issue is understandable as-is
- [ ] Acceptance criteria are testable
- [ ] Effort estimated
- [ ] Assigned to sprint / backlog
- [ ] Notified relevant stakeholders

---

## 📈 Metrics & Tracking

**GitHub Insights** (via GitHub Projects dashboards):

- Avg issue resolution time: Target < 7 days
- Open issue count: Keep < 50
- Critical issues: Must resolve < 48h
- Feature requests vs bugs ratio: Target 40% features, 60% bugs

**Query issues**:
```bash
# Find all open critical issues
gh issue list --label critical --state open

# Find issues assigned to you
gh issue list --assignee @me --state open

# Find issues in a milestone
gh issue list --milestone "Fase 2"

# Find issues without labels
gh issue list --state open --search "label:triage"
```

---

## 📚 References

- [GitHub Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates)
- [Writing Good Issues](https://opensource.guide/how-to-write-for-github-communities/)
- [Labels Best Practices](https://github.com/torvalds/linux/blob/master/README)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-08 | Initial issue templates for Feature, Bug, RFC, Task, Documentation |
