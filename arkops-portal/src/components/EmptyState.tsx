import { InboxOutlined } from '@ant-design/icons';
import { Empty } from 'antd';

export function EmptyState({ description = 'No data yet' }: { description?: string }) {
  return <Empty image={<InboxOutlined style={{ fontSize: 44, color: '#94a3b8' }} />} description={description} />;
}
