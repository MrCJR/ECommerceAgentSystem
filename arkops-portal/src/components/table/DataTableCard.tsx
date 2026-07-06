/**
 * File: DataTableCard.tsx
 * Purpose: Shared card-wrapped table component for operational list pages. It keeps toolbar,
 * description, pagination defaults, and table layout conventions consistent across pages.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - DataTableCard: renders an Ant Design table inside a standard card shell.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
import type { ReactNode } from 'react';
import { Card, Table, Typography } from 'antd';
import type { CardProps, TableProps } from 'antd';

interface DataTableCardProps<RecordType extends object> extends TableProps<RecordType> {
  cardProps?: CardProps;
  description?: ReactNode;
  toolbar?: ReactNode;
}

/**
 * Renders a reusable table card with optional toolbar and explanatory description.
 *
 * @param props - Ant Design table props plus optional card, toolbar, and description settings.
 * @returns React element containing the standardized table card.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
export function DataTableCard<RecordType extends object>({
  cardProps,
  description,
  toolbar,
  size = 'small',
  pagination = false,
  tableLayout = 'fixed',
  ...tableProps
}: DataTableCardProps<RecordType>) {
  return (
    <Card {...cardProps}>
      {toolbar && <div className="data-table-toolbar">{toolbar}</div>}
      {description && (
        <Typography.Paragraph type="secondary" className="data-table-description">
          {description}
        </Typography.Paragraph>
      )}
      <Table<RecordType>
        size={size}
        pagination={pagination}
        tableLayout={tableLayout}
        {...tableProps}
      />
    </Card>
  );
}
