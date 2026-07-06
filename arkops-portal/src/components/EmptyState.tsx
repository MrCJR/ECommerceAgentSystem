/**
 * File: EmptyState.tsx
 * Purpose: Shared empty-state component for operational pages and cards.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - EmptyState: renders a consistent empty-state illustration and description.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
import { InboxOutlined } from '@ant-design/icons';
import { Empty } from 'antd';
import { useI18n } from '../app/i18n';

/**
 * Renders a reusable localized empty state.
 *
 * @param description - Optional explicit empty-state description; falls back to localized common text.
 * @returns React element containing the empty-state UI.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
export function EmptyState({ description }: { description?: string }) {
  const { t } = useI18n();
  return <Empty image={<InboxOutlined style={{ fontSize: 44, color: '#94a3b8' }} />} description={description ?? t('common.empty')} />;
}
