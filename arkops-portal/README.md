# ArkOps Portal

ArkOps Portal is the frontend SaaS control plane for the ArkOps AI commerce operations platform.

The MVP goal is to let an internal beta tenant complete the full control-loop workflow:

```text
log in
-> add a store
-> bind the store through MuleRun connectToken
-> create an Agent task
-> review execution timeline, screenshots, logs, and events
-> approve or reject high-risk actions
-> audit the final result
```

## Fixed Frontend Stack

The frontend technology stack is fixed for the MVP:

- React
- TypeScript
- Vite
- Ant Design
- React Router
- TanStack Query

The frontend should be implemented as a single-page application. It should call the ArkOps SaaS backend through typed API clients and should not call MuleRun APIs directly.

## MVP Page Scope

The first version should focus on the SaaS control-plane workflow rather than marketing pages or analytics-heavy dashboards.

### Core Pages

| Route | Page | MVP purpose |
| --- | --- | --- |
| `/login` | Login | User authentication entry point |
| `/dashboard` | Dashboard | Operational system overview |
| `/stores` | Store List | Store authorization status overview |
| `/stores/new` | Add Store | Create a store and generate a connectToken |
| `/stores/:storeId` | Store Detail | View binding status, re-auth, revoke, recent tasks |
| `/tasks` | Task List | Browse Agent tasks by status, store, agent type |
| `/tasks/new` | Create Task | Create a task for a selected store and Agent type |
| `/tasks/:taskId` | Task Detail | Run timeline, step events, screenshots, logs, artifacts |
| `/approvals` | Approval List | Review pending high-risk actions |
| `/approvals/:approvalId` | Approval Detail | Approve or reject proposed Agent actions |
| `/audit-logs` | Audit Logs | Search execution, approval, and system events |
| `/settings/members` | Members | Tenant users, roles, invitations |
| `/settings/notifications` | Notifications | Webhook, Feishu, DingTalk, WeCom notification settings |
| `/settings/billing` | Billing & Quota | Plan, resource usage, quota limits |

### Highest Priority Screens

Build these first:

1. Dashboard
2. Store List and Store Detail
3. Create Task
4. Task Detail Timeline
5. Approval List and Approval Detail

These screens prove the ArkOps MVP control loop.

## Store Authorization States

The Portal must clearly display store authorization status:

```text
pending_login
connected
login_required
expired
revoked
```

MVP store binding should use the MuleRun beta flow:

```text
ArkOps generates connectToken
-> user manually opens MuleRun Login Bootstrap Agent
-> user enters connectToken in MuleRun
-> user logs in to the marketplace inside MuleRun browser sandbox
-> MuleRun calls ArkOps session binding API
-> ArkOps marks store as connected
```

## Task and Run States

The Portal should treat Agent execution as a timeline.

Recommended MVP states:

```text
draft
queued
running
waiting_approval
succeeded
failed
canceled
```

Timeline event types:

```text
run_started
step_started
step_completed
approval_required
login_required
run_succeeded
run_failed
```

## Suggested Directory Structure

```text
arkops-portal/
  README.md
  public/
  src/
    app/
      router.tsx
      providers.tsx
      layout/
    api/
      client.ts
      stores.ts
      tasks.ts
      approvals.ts
      auditLogs.ts
    components/
      AppShell/
      StatusBadge/
      EmptyState/
      Timeline/
    features/
      auth/
      dashboard/
      stores/
      tasks/
      approvals/
      auditLogs/
      settings/
    pages/
      LoginPage.tsx
      DashboardPage.tsx
      StoreListPage.tsx
      StoreDetailPage.tsx
      TaskListPage.tsx
      TaskDetailPage.tsx
      ApprovalListPage.tsx
      ApprovalDetailPage.tsx
    styles/
      tokens.css
      global.css
    types/
      domain.ts
      api.ts
```

## UX Principles

- Build an operational SaaS console, not a marketing landing page.
- Prioritize dense but readable information.
- Use Ant Design tables, forms, tags, drawers, modals, tabs, timelines, and descriptions.
- Make status, risk level, and required user action visually obvious.
- Keep Agent execution explainable through timeline events, screenshots, logs, and approval records.
- Do not expose MuleRun API keys or raw secrets in frontend code.

## Initial Development Order

1. Scaffold Vite + React + TypeScript + Ant Design.
2. Build AppShell, navigation, route layout, and mock API layer.
3. Build Dashboard with mock data.
4. Build Store List, Store Detail, and connectToken display flow.
5. Build Task List and Task Detail Timeline.
6. Build Approval List and Approval Detail.
7. Replace mock API layer with real backend endpoints.

## Backend Boundary

The Portal should call only ArkOps backend APIs:

```text
Portal -> ArkOps Backend -> MuleRun / Agent Runtime
```

The frontend must not call MuleRun directly. MuleRun session binding, runtime events, approvals, artifacts, and audit logs should all be represented through ArkOps backend APIs.

