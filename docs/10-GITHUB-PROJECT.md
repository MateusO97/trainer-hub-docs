# GitHub Project Setup Guide

**Document ID**: GITHUB-PROJECT-001  
**Version**: 1.0  
**Created**: January 13, 2025  
**Owner**: DevOps / Project Management  

---

## 📋 Overview

This document provides step-by-step instructions for setting up a GitHub Project Board for the TrAIner Hub Fase 1 development, enabling visual task tracking and progress monitoring across all deliverables.

---

## 🚀 Prerequisites

✅ GitHub Repository created: `MateusO97/trainer-hub-docs`  
✅ All 12 documentation deliverables generated and committed  
✅ GitHub CLI installed (for command-line setup)  
⚠️ *Note: Token scope limitation currently requires manual web UI setup for projects*

---

## 📊 Project Board Structure

### Board Configuration

**Board Name**: `TrAIner Hub - Fase 1 Development`  
**Type**: Table view + Board (Kanban) view  
**Repository**: `MateusO97/trainer-hub-docs`  

### Columns / Statuses

The project will have 5 columns (left to right):

1. **📋 Backlog** - Tasks not yet started
2. **🔄 In Progress** - Active tasks (max 3 concurrent)
3. **👀 In Review** - Awaiting approval/feedback
4. **✅ Done** - Completed and merged
5. **❌ Blocked** - Awaiting external dependencies

---

## 🔧 Setup Instructions (Web UI)

Since GitHub CLI project commands require elevated token scopes, we'll use the web interface:

### Step 1: Create the Project

1. Go to: `https://github.com/MateusO97/trainer-hub-docs`
2. Click **"Projects"** tab (top navigation)
3. Click **"New project"** button
4. **Project name**: `TrAIner Hub - Fase 1 Development`
5. **Project template**: Select **"Table"** 
6. **Repository**: `trainer-hub-docs` (connect to this repo)
7. Click **"Create project"**

### Step 2: Configure Columns

After project creation, you'll see a table view. Add custom fields:

1. Click **"Add field"** button (right side)
2. Add these fields in order:

| Field Name | Type | Values |
|------------|------|--------|
| **Status** | Single select | Backlog, In Progress, In Review, Done, Blocked |
| **Priority** | Single select | Critical, High, Medium, Low |
| **Assignee** | Assignees | (auto-populated from org members) |
| **Fase** | Single select | 1.1, 1.2, 1.3, ... 1.14 |
| **Estimated Hours** | Number | (leave empty on creation) |
| **Due Date** | Date | (optional, set per task) |

### Step 3: Create Issues for Each Task

Create GitHub Issues for trackable items (optional but recommended):

#### **1.1 - Vision Document**
- **Title**: `[Fase 1.1] Create Vision Document (VISION.md)`
- **Label**: `documentation`, `fase-1`
- **Milestone**: `Fase 1 - MVP Foundation`
- **Assignee**: Product Manager
- **Status**: ✅ Done

#### **1.2 - Architecture Document**
- **Title**: `[Fase 1.2] Create Architecture Document (ARCHITECTURE.md)`
- **Label**: `documentation`, `architecture`, `fase-1`
- **Assignee**: Tech Lead (Backend)
- **Status**: ✅ Done

#### **1.3 - Tech Stack Document**
- **Title**: `[Fase 1.3] Create Tech Stack Document (TECH-STACK.md)`
- **Label**: `documentation`, `technology`, `fase-1`
- **Assignee**: Tech Lead (Backend)
- **Status**: ✅ Done

#### **1.4 - Database Design Document**
- **Title**: `[Fase 1.4] Create Database Design Document (DATABASE-DESIGN.md)`
- **Label**: `documentation`, `database`, `fase-1`
- **Assignee**: Database Architect
- **Status**: ✅ Done

#### **1.5 - Microservices Specification**
- **Title**: `[Fase 1.5] Create Microservices Specification (MICROSERVICES.md)`
- **Label**: `documentation`, `architecture`, `fase-1`
- **Assignee**: Tech Lead (Backend)
- **Status**: ✅ Done

#### **1.6 - Data Flow Diagrams**
- **Title**: `[Fase 1.6] Create Data Flow Diagrams (DATA-FLOW.md)`
- **Label**: `documentation`, `architecture`, `fase-1`
- **Assignee**: Solutions Architect
- **Status**: ✅ Done

#### **1.7 - Messaging Strategy Document**
- **Title**: `[Fase 1.7] Create Messaging Strategy (MESSAGING-STRATEGY.md)`
- **Label**: `documentation`, `architecture`, `fase-1`
- **Assignee**: Tech Lead (Backend)
- **Status**: ✅ Done

#### **1.8 - Security Document**
- **Title**: `[Fase 1.8] Create Security & Auth Document (SECURITY.md)`
- **Label**: `documentation`, `security`, `fase-1`
- **Assignee**: Security Lead
- **Status**: ✅ Done

#### **1.9 - RFC-001: Macro Synchronization**
- **Title**: `[Fase 1.9] RFC-001: Event-Driven Macro Sync Strategy (RFC-001-macro-sync.md)`
- **Label**: `rfc`, `architecture`, `fase-1`
- **Assignee**: Tech Lead (Backend)
- **Status**: ✅ Done

#### **1.10 - RFC-002: AI Food Pipeline**
- **Title**: `[Fase 1.10] RFC-002: AI Food Resolution Pipeline (RFC-002-ai-food-pipeline.md)`
- **Label**: `rfc`, `ai`, `fase-1`
- **Assignee**: ML Engineer
- **Status**: ✅ Done

#### **1.11 - RFC-003: Macro Calculation**
- **Title**: `[Fase 1.11] RFC-003: Macro Calculation Algorithm (RFC-003-macro-calculation.md)`
- **Label**: `rfc`, `architecture`, `fase-1`
- **Assignee**: Tech Lead (Backend)
- **Status**: ✅ Done

#### **1.12 - Product Roadmap**
- **Title**: `[Fase 1.12] Create Product Roadmap with Timeline (ROADMAP.md)`
- **Label**: `documentation`, `planning`, `fase-1`
- **Assignee**: Product Manager
- **Status**: ✅ Done

#### **1.13 - GitHub Project Setup**
- **Title**: `[Fase 1.13] Setup GitHub Project Board for Fase 1 (GITHUB-PROJECT.md)`
- **Label**: `documentation`, `project-management`, `fase-1`
- **Assignee**: DevOps Lead
- **Status**: ✅ In Review

#### **1.14 - Mobile Tech Decision Validation**
- **Title**: `[Fase 1.14] Validate Mobile Tech Stack Decision (MOBILE-DECISION.md)`
- **Label**: `documentation`, `mobile`, `fase-1`
- **Assignee**: Mobile Tech Lead
- **Status**: 📋 Backlog

---

## 📌 Add Tasks to Project

### Option A: Web UI (Recommended)
1. Go to your project board
2. Click **"Add item"** at the bottom of your Status column
3. Type issue number (e.g., `#123`) or create inline task
4. Fill in **Status**, **Priority**, **Fase**, **Assignee** fields
5. Click **"Add"**

### Option B: Command Line (if token scope issue resolved)
```bash
gh project item-create \
  --owner MateusO97 \
  --project-number 1 \
  --id 123456  # GitHub Issue ID
```

---

## 🎯 Sample Board Layout (After Setup)

```
Project: TrAIner Hub - Fase 1 Development

BACKLOG                 | IN PROGRESS        | REVIEW            | DONE
─────────────────────────────────────────────────────────────────────
[1.14] Mobile Tech      | (empty)            | [1.13] GitHub      | [1.1] Vision
       Decision                             Project             [1.2] Architecture
                                                                 [1.3] Tech Stack
                                                                 [1.4] Database
                                                                 [1.5] Microservices
                                                                 [1.6] Data Flows
                                                                 [1.7] Messaging
                                                                 [1.8] Security
                                                                 [1.9] RFC-001
                                                                 [1.10] RFC-002
                                                                 [1.11] RFC-003
                                                                 [1.12] Roadmap
```

---

## 🔔 Automation & Workflow

### GitHub Actions Integration

Create automation to update project status based on commits:

#### **Auto-Close Issues on Commit**

Create `.github/workflows/auto-close-on-commit.yml`:

```yaml
name: Auto-close issues on commit
on: [push]

jobs:
  close-issue:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Close issue if mentioned in commit
        uses: peter-evans/close-issue-on-commit@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          keywords: "Closes|Fixes|Resolves"
          close-issue-message: "Closed via commit"
```

#### **Update Project Status Automatically**

GitHub Projects automatically:
- ✅ **Add items** when linked issues are created
- ✅ **Update status** when issues are opened/closed/reopened
- ✅ **Track pull requests** related to issues

---

## 📊 Tracking Metrics

### Weekly Review Checklist

Every Friday 4 PM UTC, review:

- [ ] **Completion Rate**: How many tasks moved to "Done" this week?
  - Target: 70% of planned tasks
  
- [ ] **In Progress Count**: Is WIP staying under 3?
  - Red flag: 5+ items in progress (context switching)
  
- [ ] **Blocked Items**: Any tasks stuck?
  - Action: Unblock immediately or re-schedule
  
- [ ] **Burndown**: Are we tracking to phase timeline?
  - Plot: Remaining tasks vs. deadline

- [ ] **Quality**: Any tasks returned to in-progress from review?
  - Red flag: 3+ rework cycles (QA issue)

---

## 🚨 Troubleshooting

### Issue: "Token scope missing [project]"

**Symptoms**: 
```
GitHub CLI error: authentication token missing required scopes [project read:project write:project]
```

**Root Cause**: 
GitHub's `gh` CLI requires explicit project scopes that aren't included in default personal access tokens.

**Solution**:
1. Go to: `https://github.com/settings/tokens`
2. Click your existing token
3. Under **Scopes**, check these boxes:
   - ☑️ `project` (read/write)
   - ☑️ `repo` (already selected)
   - ☑️ `admin:org_hook` (for org projects)
4. Click **Update token**
5. Re-authenticate: `gh auth login --reset && gh auth login`

**Alternative** (Recommended): Use web UI (doesn't have this issue)

---

### Issue: Items Not Appearing in Project

**Solutions**:
1. ✅ **Link issue to project**: 
   - Open issue → Click "Projects" sidebar → Select project
   
2. ✅ **Refresh project page**: 
   - Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

3. ✅ **Check issue creation date**: 
   - Some filters hide old issues; set "All" status

---

## 📱 Mobile View

GitHub Projects support mobile viewing:
1. Go to your project on mobile: `https://github.com/MateusO97/trainer-hub-docs/projects/1`
2. Swipe left/right to navigate columns
3. Tap item to view details or update status

---

## 🔗 Integration with Outros Tools

### Integration with Slack (Optional)

Install GitHub Slack app for notifications:

```
/github subscribe MateusO97/trainer-hub-docs projects
```

Notifications include:
- ✅ New project items
- ✅ Status changes
- ✅ Reviews requested

### Integration with Linear (Future)

For advanced planning (Fase 2+):
- Linear can sync with GitHub issues
- Linear dashboard for product management
- Better timeline/roadmap visualization

---

## 📋 Checklist: Project Setup Complete

- [ ] Project board created: "TrAIner Hub - Fase 1 Development"
- [ ] Custom fields configured (Status, Priority, Fase, Assignee, Hours, Due Date)
- [ ] All 14 tasks (1.1-1.14) created as GitHub Issues
- [ ] Issues linked to project
- [ ] Team members invited and assigned roles
- [ ] Weekly review scheduled (Friday 4 PM UTC)
- [ ] Slack integration enabled (optional)
- [ ] First status update completed (all tasks visible on board)

---

## 📚 References

- **GitHub Projects Docs**: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- **GitHub CLI Reference**: https://cli.github.com/manual/
- **Issue Linking**: https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue
- **Project Automation**: https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project

---

## Manual Setup Instructions

If web UI setup is needed, follow these steps:

### 1. Navigate to Project Creation

```
https://github.com/MateusO97/trainer-hub-docs/projects
→ Click "New project"
→ Choose "Table" template
→ Name: "TrAIner Hub - Fase 1 Development"
→ Click "Create"
```

### 2. Configure Fields

Once project opens:

```
Right sidebar → "Add field" → Select:
  - Status (single select)
  - Priority (single select)
  - Assignee (person)
  - Fase (single select: 1.1-1.14)
  - Estimated Hours (number)
  - Due Date (date)
```

### 3. Create Issues in Batch

Use GitHub Web UI or CLI:

```bash
# Create issue template
for i in {1..14}; do
  gh issue create \
    --title "[Fase 1.$i] Task $i" \
    --body "Deliverable for Fase 1, task $i" \
    --label "documentation,fase-1" \
    --repo MateusO97/trainer-hub-docs
done
```

### 4. Link Issues to Project

For each issue:
```
Issue page → Right sidebar → "Projects" 
→ Click "TrAIner Hub - Fase 1 Development" 
→ Set Status = appropriate column
```

---

**Setup Time**: ~20 minutes  
**Maintenance**: 5 minutes/week (status updates)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-13 | Initial GitHub Project setup guide with troubleshooting |
