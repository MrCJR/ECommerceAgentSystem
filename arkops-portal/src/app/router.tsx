import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { AgentConfigPage } from '../pages/AgentConfigPage';
import { AgentListPage } from '../pages/AgentListPage';
import { ApprovalDetailPage } from '../pages/ApprovalDetailPage';
import { ApprovalListPage } from '../pages/ApprovalListPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { BillingSettingsPage } from '../pages/BillingSettingsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ExceptionCenterPage } from '../pages/ExceptionCenterPage';
import { LoginPage } from '../pages/LoginPage';
import { MembersSettingsPage } from '../pages/MembersSettingsPage';
import { ModelListPage } from '../pages/ModelListPage';
import { NotificationsSettingsPage } from '../pages/NotificationsSettingsPage';
import { OperationsCenterPage } from '../pages/OperationsCenterPage';
import { OrderAutomationPage } from '../pages/OrderAutomationPage';
import { StoreDetailPage } from '../pages/StoreDetailPage';
import { StoreListPage } from '../pages/StoreListPage';
import { UsageGuideSettingsPage } from '../pages/UsageGuideSettingsPage';

const routerBase = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'exception-center', element: <ExceptionCenterPage /> },
        { path: 'stores', element: <StoreListPage /> },
        { path: 'stores/new', element: <StoreDetailPage mode="new" /> },
        { path: 'stores/:storeId', element: <StoreDetailPage /> },
        { path: 'agents', element: <AgentListPage /> },
        { path: 'agents/:agentType', element: <AgentConfigPage /> },
        { path: 'models', element: <ModelListPage /> },
        { path: 'operations', element: <OperationsCenterPage /> },
        { path: 'orders', element: <OrderAutomationPage /> },
        { path: 'approvals', element: <ApprovalListPage /> },
        { path: 'approvals/:approvalId', element: <ApprovalDetailPage /> },
        { path: 'audit-logs', element: <AuditLogsPage /> },
        { path: 'billing', element: <BillingSettingsPage /> },
        { path: 'guide', element: <UsageGuideSettingsPage /> },
        { path: 'settings/members', element: <MembersSettingsPage /> },
        { path: 'settings/notifications', element: <NotificationsSettingsPage /> }
      ]
    }
  ],
  { basename: routerBase }
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
