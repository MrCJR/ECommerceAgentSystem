/**
 * File: TableActionGroup.tsx
 * Purpose: Shared wrapper for compact table row actions so spacing and alignment remain
 * consistent across operational table columns.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - TableActionGroup: wraps row action controls in a shared layout class.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
import type { ReactNode } from 'react';

interface TableActionGroupProps {
  children: ReactNode;
}

/**
 * Wraps table row actions in the shared action layout.
 *
 * @param children - Buttons, links, or controls shown in a table row action cell.
 * @returns React element containing the action group wrapper.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
export function TableActionGroup({ children }: TableActionGroupProps) {
  return <div className="table-action-wrap">{children}</div>;
}
