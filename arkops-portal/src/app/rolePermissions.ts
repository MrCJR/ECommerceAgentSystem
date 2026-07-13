import type { Member } from '../types/domain';

export type Role = Member['role'];

/**
 * Centralized role permission matrix.
 * Defines which routes each role can access.
 * true = allowed, false = denied
 *
 * Based on PM-Audit product business mapping table v5.
 */
const ROLE_PERMISSIONS: Record<Role, Record<string, boolean>> = {
  Owner: {
    '/dashboard': true, '/orders': true, '/products': true,
    '/agents': true, '/agents/exceptions': true, '/agents/approvals': true,
    '/stores': true, '/settings/stores': true, '/settings/members': true,
    '/settings/models': true, '/settings/billing': true,
    '/settings/audit-logs': true, '/settings/notifications': true,
    '/settings/guide': true, '/setup': true,
  },
  Admin: {
    '/dashboard': true, '/orders': true, '/products': true,
    '/agents': true, '/agents/exceptions': true, '/agents/approvals': true,
    '/stores': true, '/settings/stores': true, '/settings/members': true,
    '/settings/models': true, '/settings/billing': true,
    '/settings/audit-logs': true, '/settings/notifications': true,
    '/settings/guide': true, '/setup': true,
  },
  Operator: {
    '/dashboard': true, '/orders': true, '/products': true,
    '/agents': true, '/agents/exceptions': true, '/agents/approvals': true,
    '/stores': true, '/settings/stores': true, '/settings/members': false,
    '/settings/models': true, '/settings/billing': true,
    '/settings/audit-logs': true, '/settings/notifications': true,
    '/settings/guide': true, '/setup': true,
  },
  Approver: {
    '/dashboard': true, '/orders': true, '/products': true,
    '/agents': true, '/agents/exceptions': true, '/agents/approvals': true,
    '/stores': true, '/settings/stores': true, '/settings/members': false,
    '/settings/models': false, '/settings/billing': true,
    '/settings/audit-logs': false, '/settings/notifications': false,
    '/settings/guide': true, '/setup': false,
  },
  Finance: {
    '/dashboard': true, '/orders': false, '/products': false,
    '/agents': false, '/agents/exceptions': false, '/agents/approvals': false,
    '/stores': false, '/settings/stores': false, '/settings/members': false,
    '/settings/models': false, '/settings/billing': true,
    '/settings/audit-logs': false, '/settings/notifications': false,
    '/settings/guide': false, '/setup': false,
  },
  Viewer: {
    '/dashboard': true, '/orders': true, '/products': true,
    '/agents': true, '/agents/exceptions': true, '/agents/approvals': true,
    '/stores': true, '/settings/stores': true, '/settings/members': false,
    '/settings/models': true, '/settings/billing': true,
    '/settings/audit-logs': true, '/settings/notifications': false,
    '/settings/guide': true, '/setup': false,
  },
};

/** Menu items visible per role (for AppShell navigation filtering) */
const ROLE_MENU_VISIBILITY: Record<Role, Set<string>> = {
  Owner: new Set('*'),
  Admin: new Set('*'),
  Operator: new Set([
    '/dashboard', '/orders', '/products',
    '/agents', '/agents/exceptions', '/agents/approvals',
    '/stores', '/settings/stores', '/settings/models',
    '/settings/billing', '/settings/audit-logs', '/settings/notifications',
    '/settings/guide', '/setup',
  ]),
  Approver: new Set([
    '/dashboard', '/orders', '/products',
    '/agents', '/agents/exceptions', '/agents/approvals',
    '/stores', '/settings/stores', '/settings/billing',
    '/settings/guide',
  ]),
  Finance: new Set(['/dashboard', '/settings/billing']),
  Viewer: new Set([
    '/dashboard', '/orders', '/products',
    '/agents', '/agents/exceptions', '/agents/approvals',
    '/stores', '/settings/stores', '/settings/models',
    '/settings/billing', '/settings/audit-logs', '/settings/guide',
  ]),
};

/**
 * Check if a role can access a given path.
 * Agent detail pages (/agents/:agentType) inherit from /agents.
 */
export function canAccess(role: Role, pathname: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Exact match
  if (permissions[pathname] !== undefined) return permissions[pathname];

  // /agents/:agentType inherits from /agents
  if (pathname.startsWith('/agents/') && pathname !== '/agents/exceptions' && pathname !== '/agents/approvals') {
    return permissions['/agents'] ?? false;
  }

  // /stores/:storeId inherits from /stores
  if (pathname.startsWith('/stores/') && pathname !== '/stores/new') {
    return permissions['/stores'] ?? false;
  }

  // /agents/approvals/:id inherits from /agents/approvals
  if (pathname.startsWith('/agents/approvals/')) {
    return permissions['/agents/approvals'] ?? false;
  }

  // /settings/* sub-paths — check exact settings path
  if (pathname.startsWith('/settings/')) {
    return permissions[pathname] ?? false;
  }

  return false;
}

/**
 * Check if a menu item should be visible for a role.
 */
export function isMenuVisible(role: Role, path: string): boolean {
  const visible = ROLE_MENU_VISIBILITY[role];
  if (!visible) return false;
  if (visible.has('*')) return true;
  return visible.has(path);
}

/**
 * Get accessible menu paths for a role (for navigation filtering).
 */
export function getAccessiblePaths(role: Role): string[] | null {
  const visible = ROLE_MENU_VISIBILITY[role];
  if (!visible) return [];
  if (visible.has('*')) return null; // null means all visible
  return Array.from(visible);
}
