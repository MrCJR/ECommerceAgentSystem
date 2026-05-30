import { UserAddOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { settingsApi } from '../api/settings';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import type { Member } from '../types/domain';

export function MembersSettingsPage() {
  const { t } = useI18n();
  const { data = [] } = useQuery({ queryKey: ['members'], queryFn: settingsApi.members });
  const columns: ColumnsType<Member> = [
    { title: t('settings.name'), dataIndex: 'name' },
    { title: t('login.email'), dataIndex: 'email' },
    { title: t('settings.role'), dataIndex: 'role', render: (role) => t(`member.role.${role}`) },
    { title: t('stores.status'), dataIndex: 'status', render: (status) => t(`member.status.${status}`) }
  ];
  return (
    <div className="page-stack">
      <PageHeader
        title={t('settings.membersTitle')}
        description={t('settings.membersDescription')}
        actions={<Button icon={<UserAddOutlined />}>{t('settings.invite')}</Button>}
      />
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      </Card>
      <Card title={t('settings.mvpRoles')}>
        <Space wrap>
          {(['Owner', 'Admin', 'Operator', 'Approver', 'Viewer'] as const).map((role) => (
            <Tag key={role} color={role === 'Owner' ? 'blue' : role === 'Viewer' ? 'default' : 'geekblue'}>
              {t(`member.role.${role}`)}
            </Tag>
          ))}
        </Space>
      </Card>
    </div>
  );
}
