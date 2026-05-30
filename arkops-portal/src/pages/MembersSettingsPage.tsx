import { UserAddOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { settingsApi } from '../api/settings';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Member } from '../types/domain';

export function MembersSettingsPage() {
  const { data = [] } = useQuery({ queryKey: ['members'], queryFn: settingsApi.members });
  const columns: ColumnsType<Member> = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: 'role' },
    { title: 'Status', dataIndex: 'status' }
  ];
  return (
    <div className="page-stack">
      <PageHeader
        title="Members"
        description="Manage tenant users and MVP roles."
        actions={<Button icon={<UserAddOutlined />}>Invite member</Button>}
      />
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      </Card>
      <Card title="MVP roles">
        <div>
          {(['Owner', 'Admin', 'Operator', 'Approver', 'Viewer'] as const).map((role) => (
            <StatusBadge key={role} value={role === 'Owner' ? 'high' : role === 'Viewer' ? 'low' : 'medium'} />
          ))}
        </div>
      </Card>
    </div>
  );
}
