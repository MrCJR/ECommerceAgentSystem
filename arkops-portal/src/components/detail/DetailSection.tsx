import type { ReactNode } from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';

interface DetailSectionProps extends CardProps {
  children: ReactNode;
  spacing?: 'none' | 'bottom';
}

export function DetailSection({
  children,
  className,
  spacing = 'none',
  ...cardProps
}: DetailSectionProps) {
  const classes = [
    'detail-section',
    spacing === 'bottom' ? 'detail-section-bottom' : null,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Card className={classes} {...cardProps}>
      {children}
    </Card>
  );
}
