import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { ApprovalDetailPage } from '../pages/ApprovalDetailPage';
import { ApprovalListPage } from '../pages/ApprovalListPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { BillingSettingsPage } from '../pages/BillingSettingsPage';
import { CreateTaskPage } from '../pages/CreateTaskPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { MembersSettingsPage } from '../pages/MembersSettingsPage';
import { NotificationsSettingsPage } from '../pages/NotificationsSettingsPage';
import { StoreDetailPage } from '../pages/StoreDetailPage';
import { StoreListPage } from '../pages/StoreListPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { TaskListPage } from '../pages/TaskListPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'stores', element: <StoreListPage /> },
      { path: 'stores/new', element: <StoreDetailPage mode="new" /> },
      { path: 'stores/:storeId', element: <StoreDetailPage /> },
      { path: 'tasks', element: <TaskListPage /> },
      { path: 'tasks/new', element: <CreateTaskPage /> },
      { path: 'tasks/:taskId', element: <TaskDetailPage /> },
      { path: 'approvals', element: <ApprovalListPage /> },
      { path: 'approvals/:approvalId', element: <ApprovalDetailPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'settings/members', element: <MembersSettingsPage /> },
      { path: 'settings/notifications', element: <NotificationsSettingsPage /> },
      { path: 'settings/billing', element: <BillingSettingsPage /> }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
