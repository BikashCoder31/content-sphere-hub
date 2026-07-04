# Content Sphere Hub - Status Tracking Rules

> **Purpose:** Define how to track feature and task status correctly  
> **Version:** 1.0  
> **Created:** July 4, 2026

---

## 1. Core Rule

**Do NOT use completion ticks (✅) for planned features.**

A tick should only be used when the feature is:
1. **Implemented** in code
2. **Tested** (unit tests, integration tests, or manual verification)
3. **Reviewed** (code review passed)
4. **Documented** (API docs, user docs updated)
5. **Working** in the expected environment

---

## 2. Status Values

Use these status values in all tracking documents:

| Status | Meaning | Tick Allowed? | Color |
|--------|---------|---------------|-------|
| **Not Started** | Planned but no implementation yet | ❌ No | Gray |
| **In Progress** | Currently being implemented | ❌ No | Blue |
| **Blocked** | Cannot continue due to dependency or issue | ❌ No | Red |
| **Deferred** | Intentionally moved to a later phase | ❌ No | Yellow |
| **Completed** | Implemented, tested, reviewed, documented | ✅ Yes | Green |

---

## 3. Feature Table Format

### ✅ Correct Format

```markdown
| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Email/Password Registration | MVP | Not Started | Standard signup with validation |
| JWT Authentication | MVP | Not Started | Access + refresh token flow |
| Google OAuth | Phase 2 | Not Started | Social login |
```

### ❌ Incorrect Format (Do NOT use)

```markdown
| ✅ Email/Password Registration | MVP | Standard signup |
| ✅ JWT Authentication | MVP | Access + refresh token flow |
```

This makes features look completed before any implementation.

---

## 4. Task Table Format

### ✅ Correct Format

```markdown
| ID | Task | Status |
|----|------|--------|
| 1.1 | Create User model | Not Started |
| 1.2 | Create auth service | In Progress |
| 1.3 | Create login endpoint | Blocked |
| 1.4 | Create register endpoint | Completed |
```

### ❌ Incorrect Format

```markdown
| ID | Task |
|----|------|
| ✅ 1.1 | Create User model |
| ✅ 1.2 | Create auth service |
```

---

## 5. When to Update Status

### Not Started → In Progress
- When you begin active work on the task
- Update immediately when starting

### In Progress → Completed
Only when ALL of these are true:
- [ ] Code is written and committed
- [ ] Feature works end-to-end
- [ ] Tests pass (or manual verification documented)
- [ ] No known bugs
- [ ] Documentation updated (if applicable)

### In Progress → Blocked
- When external dependency prevents progress
- Document the blocker clearly
- Include what is needed to unblock

### Any Status → Deferred
- When consciously deciding to postpone
- Document why and when it will be revisited

---

## 6. Sprint Status

### Sprint Status Values

| Status | Meaning |
|--------|---------|
| **Not Started** | Sprint work has not begun |
| **In Progress** | Sprint is active, tasks being worked on |
| **Completed** | All sprint tasks are done per Definition of Done |
| **Blocked** | Sprint cannot proceed due to blocker |

### Sprint Completion

A sprint is **Completed** only when:
1. All required deliverables exist
2. All acceptance criteria are met
3. No tasks are In Progress or Blocked
4. Sprint summary is written

---

## 7. Progress Calculation

### Feature Progress
```
Completed Features / Total Features × 100
```

### Sprint Progress
```
Completed Tasks / Total Tasks × 100
```

### Overall Progress
```
Completed Sprints / Total Sprints × 100
```

---

## 8. Tracking Files

Keep these files updated:

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `IMPLEMENTATION_PLAN.md` | Sprint tasks and status | Every work session |
| `CMS_DESIGN_DOCUMENT_v3_1.md` | Feature status | After sprint completion |
| `README.md` | Quick status overview | After major milestones |

---

## 9. Status Review Checklist

Before marking anything as **Completed**, verify:

- [ ] Code exists and is committed
- [ ] Code compiles without errors
- [ ] Feature works as specified
- [ ] Tests exist and pass
- [ ] No regression in existing features
- [ ] Documentation is updated
- [ ] Change is deployed to dev/staging

---

## 10. Common Mistakes to Avoid

### ❌ Mistake 1: Premature Completion
Marking a feature as done after writing code but before testing.

### ❌ Mistake 2: Optimistic Status
Marking In Progress when work hasn't actually started.

### ❌ Mistake 3: Ignoring Blockers
Keeping status as In Progress when actually blocked.

### ❌ Mistake 4: Inconsistent Updates
Not updating status when state changes.

### ❌ Mistake 5: Vague Status
Using custom status values instead of the defined set.

---

## 11. Example: Correct Status Flow

```
Day 1: Task "Create User Model"
  - Start work → Status: In Progress
  
Day 2: Task "Create User Model"
  - Model code written
  - Still need to add indexes
  - Status: In Progress (still working)
  
Day 3: Task "Create User Model"
  - Indexes added
  - Tests written and pass
  - Code reviewed
  - Status: Completed ✅
```

---

## 12. Documentation Updates

When a sprint completes:

1. Update `IMPLEMENTATION_PLAN.md`:
   - Mark sprint as Completed
   - Update all task statuses
   - Add sprint summary notes

2. Update `CMS_DESIGN_DOCUMENT_v3_1.md`:
   - Update feature statuses that were completed
   - Only add tick to truly completed features

3. Update `README.md`:
   - Update overall progress
   - Update "Current Status" section

---

*Status Tracking Rules Version: 1.0*  
*Created: July 4, 2026*
