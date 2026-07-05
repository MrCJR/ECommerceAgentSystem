import type { ReactNode } from 'react';
import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';
import { DetailSection } from './DetailSection';

export interface DescriptionPanelItem {
  label: ReactNode;
  value: ReactNode;
  span?: number;
}

interface DescriptionPanelProps {
  bordered?: boolean;
  column?: DescriptionsProps['column'];
  extra?: ReactNode;
  items: DescriptionPanelItem[];
  size?: DescriptionsProps['size'];
  spacing?: 'none' | 'bottom';
  title?: ReactNode;
}

export function DescriptionPanel({
  bordered,
  column = { xs: 1, sm: 2 },
  extra,
  items,
  size = 'small',
  spacing = 'none',
  title,
}: DescriptionPanelProps) {
  return (
    <DetailSection title={title} extra={extra} spacing={spacing}>
      <Descriptions column={column} size={size} bordered={bordered}>
        {items.map((item, index) => (
          <Descriptions.Item key={index} label={item.label} span={item.span}>
            {item.value}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </DetailSection>
  );
}
