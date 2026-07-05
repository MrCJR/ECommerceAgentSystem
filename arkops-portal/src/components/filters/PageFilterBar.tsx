import type { ReactNode } from 'react';
import { Card } from 'antd';

interface PageFilterBarProps {
  children: ReactNode;
  className?: string;
  variant?: 'inline' | 'card';
}

export function PageFilterBar({ children, className, variant = 'inline' }: PageFilterBarProps) {
  const content = <div className={['page-filter-bar', className].filter(Boolean).join(' ')}>{children}</div>;

  if (variant === 'card') {
    return (
      <Card size="small" className="page-filter-card">
        {content}
      </Card>
    );
  }

  return content;
}
