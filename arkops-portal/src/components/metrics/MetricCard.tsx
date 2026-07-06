/**
 * File: MetricCard.tsx
 * Purpose: Shared KPI card wrapper for dashboard, store, Agent, billing, and operations pages.
 * It standardizes statistic display, helper text, optional overlay icon, and nested content.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - MetricCard: renders a consistent metric card around Ant Design Statistic.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
import { Card, Statistic, Typography } from 'antd';
import type { StatisticProps } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

interface MetricCardProps {
  title: ReactNode;
  value: StatisticProps['value'];
  prefix?: ReactNode;
  suffix?: ReactNode;
  precision?: number;
  valueStyle?: CSSProperties;
  helper?: ReactNode;
  overlayIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Renders a standardized metric card with optional helper text, overlay icon, and children.
 *
 * @param props - Metric display values and optional card decoration settings.
 * @returns React element containing a reusable KPI card.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
export function MetricCard({
  title,
  value,
  prefix,
  suffix,
  precision,
  valueStyle,
  helper,
  overlayIcon,
  className,
  style,
  children
}: MetricCardProps) {
  return (
    <Card className={className} style={style}>
      {overlayIcon ? <div className="stat-card-icon">{overlayIcon}</div> : null}
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        precision={precision}
        valueStyle={valueStyle}
      />
      {helper ? <Typography.Text type="secondary" className="metric-card-helper">{helper}</Typography.Text> : null}
      {children}
    </Card>
  );
}
