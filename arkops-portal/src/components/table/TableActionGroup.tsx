import type { ReactNode } from 'react';

interface TableActionGroupProps {
  children: ReactNode;
}

export function TableActionGroup({ children }: TableActionGroupProps) {
  return <div className="table-action-wrap">{children}</div>;
}
