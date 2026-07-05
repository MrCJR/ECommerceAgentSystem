# AllMall Portal Frontend

This directory contains the React + TypeScript frontend for the AllMall SaaS management console.

The current implementation has been updated according to `product-design.md`. It focuses on the frontend page structure, mock data, navigation, and user-facing management workflows. Backend APIs and database implementation have not started yet.

> Note: the package and directory are still named `arkops-portal` for legacy reasons. Product-facing documentation should use `AllMall`.

## Current Status

Frontend status:

- The main SaaS console pages have been implemented with mock data.
- The navigation has been updated to match the latest product design.
- Agent tasks are now managed inside Agent detail pages rather than through standalone task list/detail pages.
- Billing and subscription are split into separate navigation entries.
- Model Center has been redesigned around Agent-to-model assignment.
- The approval badge in the sidebar reflects pending approvals from mock summary data.
- Light, dark, and system theme switching are available.
- Chinese and English language switching is available.
- Routes are lazy-loaded so page modules are split into separate Vite chunks.
- AllMall-owned mock entity IDs now use numeric values in frontend types and data.

Not started yet:

- Real backend API integration
- Database schema and migrations
- Authentication / session backend
- Real MuleRun runtime calls
- Real billing, payment, invoice, and subscription APIs
- Real model provider API key validation

## Product Design Source

The source product design document is:

```text
arkops-portal/product-design.md
```

This document defines:

- SaaS and private deployment product modes
- User roles and permissions
- Current P0/P1/P2 roadmap
- Navigation structure
- Implemented frontend module scope
- Dashboard, stores, agents, models, approvals, billing, subscription, and settings behavior

When changing page scope or navigation, update `product-design.md` first, then update this README and frontend routes.

## Fixed Frontend Stack

- React 18
- TypeScript
- Vite
- Ant Design
- React Router
- TanStack Query
- Day.js

Scripts:

```bash
npm install
npm run dev
npm run build
npm run preview
```

The dev server runs with:

```bash
vite --host 0.0.0.0
```

Default local URL:

```text
http://localhost:5173/
```

## Implemented Navigation

| Route | Page | Status | Purpose |
| --- | --- | --- | --- |
| `/login` | Login | Implemented | User authentication entry page with mock flow. |
| `/dashboard` | Dashboard | Implemented | Business overview and Agent monitoring tabs. |
| `/stores` | Store List | Implemented | Store list, authorization status, service tags, add-store entry. |
| `/stores/new` | Add Store | Implemented | Store creation / onboarding flow. |
| `/stores/:storeId` | Store Detail | Implemented | Store business overview and settings tabs. |
| `/agents` | Agent Center | Implemented | My Agents and available Agents panels. |
| `/agents/:agentType` | Agent Detail | Implemented | Agent stats, run instructions, task history, task creation modal. |
| `/models` | Model Center | Implemented | Agent model assignment, custom models, monthly usage. |
| `/approvals` | Approval List | Implemented | Pending approval list. |
| `/approvals/:approvalId` | Approval Detail | Implemented | Approve or reject high-risk actions. |
| `/audit-logs` | Audit Logs | Implemented | System and execution audit records. |
| `/billing` | Billing Ledger | Implemented | Usage, monthly cost, bills, invoices. |
| `/settings/members` | Members | Implemented | Member list and invitations. |
| `/settings/notifications` | Notifications | Implemented | Notification channels and preferences. |

Removed from the latest navigation:

- `/tasks`
- `/tasks/new`
- `/tasks/:taskId`
- `/subscription`
- `/settings/approval-policy`

Task creation and task history now belong to each Agent detail page.

## Implemented Modules

### Dashboard

Two tabs are implemented:

- Business Overview
- Agent Monitoring

The dashboard includes:

- GMV, orders, average order value, and store count
- GMV and order trend chart
- Advertising ROI panel
- After-sales metrics
- Inventory and product health
- Top product ranking
- Store GMV ranking
- Task status distribution
- Agent run overview
- Quota usage
- Runtime health signals
- Live event feed

### Store Management

Implemented:

- Store list
- Store creation
- Store detail
- Store business overview tab
- Store settings tab
- Service connection display
- Authorization status display

The latest design removed technical columns such as execution environment and last validation from the store list. Store rows now emphasize business-facing service tags such as Qianchuan and Feige.

### Agent Center

Implemented:

- My Agents panel
- Available Agents panel
- Agent activation entry
- Agent detail page
- Run statistics
- Run instructions
- Task history
- New task modal
- Product launch image upload support

Implemented Agent types:

- Advertising Optimization Agent
- Product Launch Agent
- CRM Repurchase Agent
- Login Guide Agent
- Finance Reconciliation Agent

Future P2 scope:

- Agent template marketplace
- Agent workflow orchestration

### Model Center

Implemented:

- Agent-to-model assignment
- Automatic model selection
- Ark commerce vertical model option
- Custom model creation and deletion
- Monthly usage chart

The current frontend uses mock data. Real provider validation and billing integration are not implemented.

### Approval Center

Implemented:

- Approval list
- Approval detail
- Approve / reject actions
- Sidebar pending approval badge
- Agent-level approval policy page

### Billing and Subscription

Billing ledger includes:

- Current plan summary
- Monthly cost
- Usage percentage
- Estimated labor savings
- Next payment date
- Monthly usage chart
- Current bill details
- Historical invoice list

Subscription page includes:

- Current subscription
- Free / Starter / Professional / Enterprise plans
- Payment methods
- Invoice information
- Bank transfer details
- Enterprise solution cards

### Settings

Implemented:

- Member management
- Approval policy
- Notification settings

## Data Layer

The current frontend uses local mock APIs under:

```text
src/api/
```

Important mock API groups:

- `businessDashboard.ts`
- `storeBusiness.ts`
- `agents.ts`
- `agentMockData.ts`
- `models.ts`
- `approvalPolicies.ts`
- `finance.ts`
- `settings.ts`
- `stores.ts`
- `approvals.ts`
- `auditLogs.ts`

Mock API state changes should go through `mockRepository.ts` helpers where practical. This keeps create, update, replace, and remove behavior centralized while the app is still frontend-only.

Current frontend type conventions:

- AllMall-owned IDs use numeric `AllMallId` values.
- Route params are parsed with `src/utils/id.ts` before calling mock APIs.
- External or vendor identifiers, such as model provider IDs, invoice references, campaign codes, SKU codes, and runtime references, remain strings.
- Large static Agent detail mock datasets are kept outside the page component in `src/pages/agentConfigMockData.ts`.

Backend integration has not started. When backend work begins, replace mock implementations with typed API clients while preserving the UI-facing response shapes where practical.

## Backend Boundary

The frontend must call only AllMall backend APIs:

```text
Portal -> AllMall Backend -> MuleRun / Agent Runtime
```

The frontend must not call MuleRun directly.

MuleRun session binding, runtime events, approvals, artifacts, and audit logs should be represented through AllMall backend APIs.

## API and Database Contract Notes

Future API and database work must follow the repository-level conventions in the root `README.md`:

- All AllMall-owned IDs use `int64` / `long`.
- `platformId` is the database relationship field.
- `platformCode` and `platformName` are display and Agent-context fields.
- External runtime values use `*Ref`, for example `runtimeSessionRef`.
- Public responses should return numeric status and error codes.
- Error explanations should stay in documentation, SDK enums, internal logs, or frontend-localized copy.

Relevant interface document:

```text
../docs/architecture/AllMall_SaaS_Agent_Interface_Specification_V0.1.html
```

## Suggested Directory Structure

Current structure:

```text
arkops-portal/
  product-design.md
  README.md
  index.html
  package.json
  src/
    api/
    app/
      i18n.tsx
      layout/
      providers.tsx
      router.tsx
      theme.tsx
    components/
    pages/
    styles/
    types/
```

The implementation currently uses page-level modules under `src/pages/` and mock API modules under `src/api/`.

Implementation notes:

- Routes in `src/app/router.tsx` use `React.lazy` and `Suspense` for page-level code splitting.
- Translation dictionaries live in `src/app/i18n.tsx` and expose a typed `TranslationKey`.
- Repeated Agent task card styling is centralized in `src/styles/global.css`.

## UX Principles

- Build an operational SaaS console, not a marketing landing page.
- Keep information dense but readable.
- Prefer tables, tabs, descriptions, progress indicators, badges, modals, and segmented controls for management workflows.
- Make status, risk level, pending approval, runtime health, quota usage, and next user action easy to scan.
- Keep Agent execution explainable through run history, evidence, approval records, and audit logs.
- Do not expose MuleRun API keys, raw secrets, or platform credentials in frontend code.

## Development Notes

- Current implementation is frontend-only with mock data.
- Backend API, database, auth service, and MuleRun runtime integration are still pending.
- Before adding new pages, confirm the navigation and module scope in `product-design.md`.
- Before adding API contracts, follow the root README API/data conventions.
- Before replacing mock APIs, align with the SaaS-to-Agent interface specification and future database design.
- Keep new AllMall-owned mock IDs numeric; use string fields only for external refs or display codes.
