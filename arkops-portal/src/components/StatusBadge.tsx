import { Tag } from 'antd';
import { useI18n } from '../app/i18n';
import type { ApprovalStatus, RiskLevel, StoreStatus, TaskStatus } from '../types/domain';

const colors: Record<string, string> = {
  connected: 'green',
  pending_login: 'blue',
  login_required: 'orange',
  expired: 'red',
  revoked: 'default',
  draft: 'default',
  queued: 'blue',
  running: 'processing',
  waiting_approval: 'orange',
  succeeded: 'green',
  failed: 'red',
  canceled: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  low: 'green',
  medium: 'gold',
  high: 'red'
};

export function StatusBadge({ value }: { value: StoreStatus | TaskStatus | ApprovalStatus | RiskLevel }) {
  const { t } = useI18n();
  return <Tag color={colors[value]}>{t(`status.${value}`)}</Tag>;
}
