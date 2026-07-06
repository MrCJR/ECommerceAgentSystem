/**
 * File: PageFilterBar.tsx
 * Purpose: Shared filter-row wrapper for list and dashboard pages. It supports inline and
 * card-framed variants while keeping filter spacing consistent.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - PageFilterBar: renders a reusable page filter bar.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
import type { ReactNode } from 'react';
import { Card } from 'antd';

interface PageFilterBarProps {
  children: ReactNode;
  className?: string;
  variant?: 'inline' | 'card';
}

/**
 * Renders a shared filter bar as inline content or inside a small card.
 *
 * @param children - Filter controls rendered inside the bar.
 * @param className - Optional additional class name for the filter wrapper.
 * @param variant - Visual variant; `inline` renders only the row, `card` wraps it in a Card.
 * @returns React element containing the filter bar.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
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
