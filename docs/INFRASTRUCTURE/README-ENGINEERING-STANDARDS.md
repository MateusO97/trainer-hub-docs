# Engineering Standards Library - Complete Index & Onboarding Guide

**Document ID**: ENGINEERING-STANDARDS-INDEX-001  
**Version**: 1.0  
**Created**: March 8, 2026  
**Owner**: DevOps / HR Engineering Team

---

## 🚀 Welcome to TrAIner Hub Engineering!

This document is your **roadmap to all engineering standards** for TrAIner Hub development. Whether you're joining the team or reviewing standards, start here.

---

## 📚 Complete Standards Library (Fase 2+)

### 🏗️ Infrastructure & Process Layer

| Document | Purpose | Read If | Time |
|----------|---------|---------|------|
| **GIT-WORKFLOW.md** | Git Flow branching strategy, release flows | Starting new feature, creating releases | 20 min |
| **COMMIT-STANDARDS.md** | Conventional Commits, message formats | Writing commit messages | 15 min |
| **PR-STANDARDS.md** | Pull request process, code review guide | Submitting PRs or reviewing code | 25 min |
| **ISSUE-TEMPLATES.md** | How to create issues (Bug, Feature, RFC) | Reporting bugs or requesting features | 15 min |
| **TESTING-STRATEGY.md** | Test pyramid, unit/integration/E2E patterns | Writing tests | 30 min |
| **DEVELOPMENT-WORKFLOW.md** | Hands-on step-by-step guides | Actually doing work (commits, PRs, etc) | 20 min |
| **CODING-STANDARDS.md** | Code style, architecture, Kotlin idioms | Writing code | 25 min |

### 📋 Architecture & Design (from Fase 1)

| Document | Purpose | Read If |
|----------|---------|---------|
| **01-VISION.md** | Product vision, personas, KPIs | Understanding product strategy |
| **02-ARCHITECTURE.md** | System architecture, 10 microservices | Understanding system design |
| **03-TECH-STACK.md** | Technology choices (Kotlin, Spring, React Native) | Joining project, confused about tech |
| **04-DATABASE-DESIGN.md** | PostgreSQL/MongoDB schema, indexing | Working with database |
| **05-MICROSERVICES.md** | Service specs, endpoints, DTOs | Implementing new endpoints |
| **06-DATA-FLOW.md** | User journeys, sequence diagrams | Understanding flows |
| **07-MESSAGING-STRATEGY.md** | RabbitMQ topology, event-driven design | Working with async processing |
| **08-SECURITY.md** | OAuth2, JWT, RBAC, encryption | Security implementation |
| **RFC-001**: Macro Sync, **RFC-002**: AI Food, **RFC-003**: Macros | Technical decisions with deep dives | Understanding complex features |
| **09-ROADMAP.md** | 24-week timeline, phases, resource allocation | Planning, understanding schedule |

---

## 🎯 Onboarding Paths

### Path 1: New Backend Developer (Kotlin/Spring Boot)

**Duration**: 2-3 days

1. **Day 1: Setup & Architecture**
   - Clone repo: `git clone git@github.com:MateusO97/trainer-hub-docs.git`
   - Read: **01-VISION.md** (30 min) → understand what we're building
   - Read: **02-ARCHITECTURE.md** (30 min) → system design
   - Read: **03-TECH-STACK.md** (20 min) → our tech choices
   - Setup: Java 21, Gradle, Docker, Git
   - Read: **DEVELOPMENT-WORKFLOW.md** (20 min) → how we work

2. **Day 2: Code & Standards**
   - Read: **CODING-STANDARDS.md** (25 min) → code style
   - Read: **04-DATABASE-DESIGN.md** (20 min) → database
   - Read: **05-MICROSERVICES.md** (30 min) → services & endpoints
   - Practice: Create feature branch, write hello-world endpoint, submit PR

3. **Day 3: Workflows & Testing**
   - Read: **GIT-WORKFLOW.md** (20 min) → branching
   - Read: **COMMIT-STANDARDS.md** (15 min) → commit messages
   - Read: **TESTING-STRATEGY.md** (30 min) → how to test
   - Read: **PR-STANDARDS.md** (25 min) → pull request process

### Path 2: New Mobile Developer (React Native)

**Duration**: 2-3 days

1. **Day 1: Product & Architecture**
   - Read: **01-VISION.md** (30 min)
   - Read: **02-ARCHITECTURE.md** (30 min) with focus on API contracts
   - Read: **05-MICROSERVICES.md** (20 min) for REST endpoint specs
   - Read: **06-DATA-FLOW.md** (25 min) → user journeys
   - Setup: Node.js, React Native, Expo, iOS/Android emulators

2. **Day 2: Code & Mobile Specifics**
   - Read: **CODING-STANDARDS.md** (focus on TypeScript/JavaScript sections)
   - Read: **11-MOBILE-DECISION.md** from Fase 1 → why React Native
   - Read: **DEVELOPMENT-WORKFLOW.md** (20 min)
   - Setup: Create React Native app scaffold, connect to mock API

3. **Day 3: Testing & Workflows**
   - Read: **TESTING-STRATEGY.md** (20 min) → E2E testing for mobile
   - Read: **GIT-WORKFLOW.md**, **COMMIT-STANDARDS.md**, **PR-STANDARDS.md**
   - Practice: Create feature branch, build login screen, submit PR

### Path 3: Tech Lead / Architect

**Duration**: 1 day (full overview)

1. **All documents in order** (2-3 hours):
   - Fase 1 documents: 01-11
   - Infrastructure layer: All INFRASTRUCTURE/ docs
   - Focus: Decisions, trade-offs, architecture

2. **Review depth**:
   - Architecture decisions: Deep (understand rationale)
   - Coding details: Moderate (spot-check patterns)
   - Workflows: Surface (governance understanding)

### Path 4: DevOps / SRE

**Duration**: 1 day

1. **Essential readings**:
   - **09-ROADMAP.md** (infrastructure section)
   - **03-TECH-STACK.md** (Docker, CI/CD, monitoring)
   - **GIT-WORKFLOW.md** (branching strategy for deployment)
   - **TESTING-STRATEGY.md** (CI pipeline integration)
   - **07-MESSAGING-STRATEGY.md** (infrastructure concerns)

2. **Setup**:
   - Docker, Kubernetes, GitHub Actions
   - AWS account, monitoring tools

---

## 🔄 Daily Workflows by Role

### Backend Developer Daily Checklist

**Start of day**:
- [ ] `git checkout develop && git pull origin develop`
- [ ] Check assigned issues in GitHub
- [ ] Read recent PRs (learn from team)

**During development**:
- [ ] Create feature branch: `git checkout -b feature/AREA-XXX-description`
- [ ] Write code following **CODING-STANDARDS.md**
- [ ] Run tests locally: `./gradlew test`
- [ ] Commit progressively with **COMMIT-STANDARDS.md** format
- [ ] Push: `git push origin feature/AREA-XXX-description`

**PR submission**:
- [ ] Use **PR-STANDARDS.md** template
- [ ] Link issues: "Closes #AREA-XXX"
- [ ] Request 2 reviewers minimum
- [ ] Wait for GitHub Actions ✅

**Code review**:
- [ ] Review 2-3 other PRs daily
- [ ] Use checklist from **PR-STANDARDS.md**
- [ ] Leave constructive comments

**End of day**:
- [ ] Push any uncommitted work
- [ ] Update issue status in GitHub

---

## 📊 Standards Compliance Checklist

**Before submitting PR**, ensure:

- [ ] Code follows **CODING-STANDARDS.md** (Clean Architecture, SOLID)
- [ ] Tests added per **TESTING-STRATEGY.md** (>80% coverage)
- [ ] Commit messages use **COMMIT-STANDARDS.md** (Conventional Commits)
- [ ] Branch naming follows **GIT-WORKFLOW.md** (feature/AREA-XXX-desc)
- [ ] PR uses template from **PR-STANDARDS.md**
- [ ] No secrets in code (passwords, tokens, API keys)
- [ ] Ktlint/formatting passing: `./gradlew ktlintFormat`
- [ ] All tests passing: `./gradlew test`
- [ ] Security scan OK (GitHub Actions must pass)

**Before creating issue**:

- [ ] Search for duplicates first
- [ ] Use appropriate template from **ISSUE-TEMPLATES.md**
- [ ] Include all required fields (title, description, labels)
- [ ] Estimate effort (if task)
- [ ] Link related issues

---

## 🎓 Learning Resources by Topic

### Git & Version Control
1. **GIT-WORKFLOW.md** - Detailed Git Flow strategy
2. **DEVELOPMENT-WORKFLOW.md** - Practical git commands
3. External: [Atlassian Git Tutorials](https://www.atlassian.com/git)

### Code Quality & Testing
1. **TESTING-STRATEGY.md** - Test pyramid, patterns
2. **CODING-STANDARDS.md** - Architecture, patterns
3. External: [Google Engineering Practices](https://google.github.io/eng-practices/)

### Pull Request & Review Process
1. **PR-STANDARDS.md** - Complete PR guide
2. **COMMIT-STANDARDS.md** - Message standards
3. **DEVELOPMENT-WORKFLOW.md** - Step-by-step guide

### Product & Architecture
1. **01-VISION.md** - Product strategy
2. **02-ARCHITECTURE.md** - System design
3. **05-MICROSERVICES.md** - Service contracts
4. **RFC-* .md** - Deep dives on key decisions

### Backend Development (Kotlin/Spring)
1. **CODING-STANDARDS.md** - Kotlin idioms, Spring patterns
2. **04-DATABASE-DESIGN.md** - Database schema
3. **03-TECH-STACK.md** - Technology setup
4. External: [Kotlin Docs](https://kotlinlang.org/docs/), [Spring Boot Guides](https://spring.io/guides)

### Mobile Development (React Native)
1. **11-MOBILE-DECISION.md** - Why React Native
2. **CODING-STANDARDS.md** - TypeScript patterns
3. **06-DATA-FLOW.md** - User journeys
4. External: [React Native Docs](https://reactnative.dev/), [Expo Docs](https://docs.expo.dev/)

---

## 🚨 Most Important Documents (Must Read)

**Absolute must** for every developer:

1. **DEVELOPMENT-WORKFLOW.md** - How to actually do your job
2. **GIT-WORKFLOW.md** - Branching strategy
3. **COMMIT-STANDARDS.md** - Message format
4. **PR-STANDARDS.md** - Review process
5. **CODING-STANDARDS.md** - Code patterns

---

## 🔗 Cross-References Quick Map

**If you're...**

| Situation | Start with | Then read |
|-----------|-----------|----------|
| Writing core feature | CODING-STANDARDS + TESTING-STRATEGY | 05-MICROSERVICES |
| Joining team | DEVELOPMENT-WORKFLOW | Your role's path above |
| Reviewing PR | PR-STANDARDS | CODING-STANDARDS |
| Creating issue | ISSUE-TEMPLATES | Relevant INFRASTRUCTURE doc |
| Implementing API | 05-MICROSERVICES | 06-DATA-FLOW |
| Database work | 04-DATABASE-DESIGN | CODING-STANDARDS |
| Fixing security bug | 08-SECURITY | TESTING-STRATEGY |
| Planning release | 09-ROADMAP | GIT-WORKFLOW |

---

## 📝 Document Status & Updates

| Document | Version | Last Updated | Next Review |
|----------|---------|--------------|------------|
| GIT-WORKFLOW | 1.0 | 2026-03-08 | 2026-06-08 |
| COMMIT-STANDARDS | 1.0 | 2026-03-08 | 2026-06-08 |
| PR-STANDARDS | 1.0 | 2026-03-08 | 2026-06-08 |
| TESTING-STRATEGY | 1.0 | 2026-03-08 | 2026-06-08 |
| DEVELOPMENT-WORKFLOW | 1.0 | 2026-03-08 | 2026-06-08 |
| CODING-STANDARDS | 1.0 | 2026-03-08 | 2026-06-08 |
| ISSUE-TEMPLATES | 1.0 | 2026-03-08 | 2026-06-08 |

**Review Frequency**: Quarterly (or when standards change)

---

## 🎯 Success Metrics

**After reading these standards, you should be able to**:

- [ ] Create feature branch with correct naming
- [ ] Write commit message in Conventional Commits format
- [ ] Write unit + integration tests with > 80% coverage
- [ ] Submit PR with complete template and description
- [ ] Review PRs using provided checklist
- [ ] Code follows Clean Architecture + SOLID principles
- [ ] Build applications on Kotlin/Spring Boot or React Native
- [ ] Understand system architecture and 10 microservices
- [ ] Create issues with proper template and labels
- [ ] Deploy via Git Flow workflow (feature → develop → master)

---

## 💬 Questions?

- **Technical**: Ask in PR comments or GitHub Discussions
- **Process**: Ask @tech-lead or @devops-lead on Slack
- **Onboarding**: Ask @hr-engineering or your assigned mentor
- **Architecture**: Start an RFC in GitHub Issues

**Response SLA**:
- Process questions: < 4h
- Technical questions: < 24h
- Architecture discussions: < 48h

---

## 📞 Key Contacts

| Role | Slack | Responsibility |
|------|-------|-----------------|
| **Tech Lead** | @tech-lead | Architecture, API design |
| **DevOps Lead** | @devops-lead | Infrastructure, CI/CD |
| **QA Lead** | @qa-lead | Testing strategy, coverage |
| **Product Manager** | @product-manager | Features, priorities |
| **Your Mentor** | @your-mentor | Daily questions, onboarding |

---

## 🎓 Continuous Learning

- **Weekly tech talks**: Every Thursday 4pm UTC (Slack calendar)
- **Monthly architecture reviews**: Code walkthroughs, design discussions
- **Quarterly standards updates**: Gather feedback, improve docs
- **Knowledge sharing**: Doc PRs encouraged for learnings!

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-08 | Initial complete index, onboarding paths, reference map |

---

**Last Updated**: March 8, 2026  
**Next Review**: June 8, 2026  
**Owner**: DevOps / Engineering Manager  
**Status**: ✅ Active - Ready for Fase 2 Development
