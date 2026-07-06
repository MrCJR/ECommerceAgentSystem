/**
 * File: DetailSection.tsx
 * Purpose: Shared detail-card wrapper for entity pages and settings sections.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - DetailSection: renders a standardized detail card with optional spacing variant.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
import type { ReactNode } from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';

interface DetailSectionProps extends CardProps {
  children: ReactNode;
  spacing?: 'none' | 'bottom';
}

/**
 * Renders a detail card with shared class names and spacing conventions.
 *
 * @param children - Detail content rendered inside the card.
 * @param className - Optional additional class name.
 * @param spacing - Spacing variant for surrounding page layout.
 * @param cardProps - Remaining Ant Design Card props passed through to the card.
 * @returns React element containing the detail section card.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
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
