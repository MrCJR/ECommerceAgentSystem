import type { ReactNode } from 'react';
import { Card, Table, Typography } from 'antd';
import type { CardProps, TableProps } from 'antd';

interface DataTableCardProps<RecordType extends object> extends TableProps<RecordType> {
  cardProps?: CardProps;
  description?: ReactNode;
  toolbar?: ReactNode;
}

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
