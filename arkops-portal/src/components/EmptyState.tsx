import { InboxOutlined } from '@ant-design/icons';
import { Empty } from 'antd';
import { useI18n } from '../app/i18n';

export function EmptyState({ description }: { description?: string }) {
  const { t } = useI18n();
  return <Empty image={<InboxOutlined style={{ fontSize: 44, color: '#94a3b8' }} />} description={description ?? t('common.empty')} />;
}
