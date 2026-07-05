import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Spin } from 'antd';
import { AppShell } from './layout/AppShell';

const AgentConfigPage = lazy(() => import('../pages/AgentConfigPage').then((module) => ({ default: module.AgentConfigPage })));
const AgentListPage = lazy(() => import('../pages/AgentListPage').then((module) => ({ default: module.AgentListPage })));
const ApprovalDetailPage = lazy(() => import('../pages/ApprovalDetailPage').then((module) => ({ default: module.ApprovalDetailPage })));
const ApprovalListPage = lazy(() => import('../pages/ApprovalListPage').then((module) => ({ default: module.ApprovalListPage })));
const AuditLogsPage = lazy(() => import('../pages/AuditLogsPage').then((module) => ({ default: module.AuditLogsPage })));
const BillingSettingsPage = lazy(() => import('../pages/BillingSettingsPage').then((module) => ({ default: module.BillingSettingsPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const ExceptionCenterPage = lazy(() => import('../pages/ExceptionCenterPage').then((module) => ({ default: module.ExceptionCenterPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const MembersSettingsPage = lazy(() => import('../pages/MembersSettingsPage').then((module) => ({ default: module.MembersSettingsPage })));
const ModelListPage = lazy(() => import('../pages/ModelListPage').then((module) => ({ default: module.ModelListPage })));
const NotificationsSettingsPage = lazy(() => import('../pages/NotificationsSettingsPage').then((module) => ({ default: module.NotificationsSettingsPage })));
const OperationsCenterPage = lazy(() => import('../pages/OperationsCenterPage').then((module) => ({ default: module.OperationsCenterPage })));
const OrderAutomationPage = lazy(() => import('../pages/OrderAutomationPage').then((module) => ({ default: module.OrderAutomationPage })));
const StoreDetailPage = lazy(() => import('../pages/StoreDetailPage').then((module) => ({ default: module.StoreDetailPage })));
const StoreListPage = lazy(() => import('../pages/StoreListPage').then((module) => ({ default: module.StoreListPage })));
const UsageGuideSettingsPage = lazy(() => import('../pages/UsageGuideSettingsPage').then((module) => ({ default: module.UsageGuideSettingsPage })));

const routerBase = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

const routeFallback = (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
    <Spin size="large" />
  </div>
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={routeFallback}>{element}</Suspense>;
}

const router = createBrowserRouter(
  [
    { path: '/login', element: withSuspense(<LoginPage />) },
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: withSuspense(<DashboardPage />) },
        { path: 'exception-center', element: withSuspense(<ExceptionCenterPage />) },
        { path: 'stores', element: withSuspense(<StoreListPage />) },
        { path: 'stores/new', element: withSuspense(<StoreDetailPage mode="new" />) },
        { path: 'stores/:storeId', element: withSuspense(<StoreDetailPage />) },
        { path: 'agents', element: withSuspense(<AgentListPage />) },
        { path: 'agents/:agentType', element: withSuspense(<AgentConfigPage />) },
        { path: 'models', element: withSuspense(<ModelListPage />) },
        { path: 'operations', element: withSuspense(<OperationsCenterPage />) },
        { path: 'orders', element: withSuspense(<OrderAutomationPage />) },
        { path: 'approvals', element: withSuspense(<ApprovalListPage />) },
        { path: 'approvals/:approvalId', element: withSuspense(<ApprovalDetailPage />) },
        { path: 'audit-logs', element: withSuspense(<AuditLogsPage />) },
        { path: 'billing', element: withSuspense(<BillingSettingsPage />) },
        { path: 'guide', element: withSuspense(<UsageGuideSettingsPage />) },
        { path: 'settings/members', element: withSuspense(<MembersSettingsPage />) },
        { path: 'settings/notifications', element: withSuspense(<NotificationsSettingsPage />) }
      ]
    }
  ],
  { basename: routerBase }
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
