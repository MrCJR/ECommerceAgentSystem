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
