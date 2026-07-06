/**
 * File: DescriptionPanel.tsx
 * Purpose: Shared description-list panel for detail pages. It combines DetailSection with
 * Ant Design Descriptions so entity metadata can be displayed consistently.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - DescriptionPanel: renders a reusable detail description section.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
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

/**
 * Renders a reusable detail section containing Ant Design description items.
 *
 * @param props - Description layout, title, extra content, spacing, and item definitions.
 * @returns React element containing the description panel.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
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
