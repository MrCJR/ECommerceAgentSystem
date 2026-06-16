import { PlusOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Empty, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { agentsApi } from '../api/agents';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import type { AgentConfig } from '../types/domain';

export function AgentListPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data: allAgents = [] } = useQuery({ queryKey: ['agents'], queryFn: agentsApi.list });
  const toggleMutation = useMutation({
    mutationFn: agentsApi.toggle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] })
  });

  const enabledAgents = allAgents.filter((a) => a.enabled);
  const disabledAgents = allAgents.filter((a) => !a.enabled);

  const columns: ColumnsType<AgentConfig> = [
    {
      title: t('agent.name'),
      dataIndex: 'displayName',
      render: (name: string, record: AgentConfig) => (
        <div>
          <Link to={`/agents/${record.agentType}`}><Typography.Text strong>{name}</Typography.Text></Link>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Typography.Text>
        </div>
      )
    },
    {
      title: t('agent.worksFor'),
      width: 140,
      render: () => <Typography.Text type="secondary">{t('agent.worksForDesc')}</Typography.Text>
    },
    {
      title: t('common.actions'),
      width: 80,
      key: 'actions',
      render: (_, record: AgentConfig) => (
        <Link to={`/agents/${record.agentType}`}>
          <SettingOutlined /> {t('common.view')}
        </Link>
      )
    }
  ];

  const availableColumns: ColumnsType<AgentConfig> = [
    {
      title: t('agent.name'),
      dataIndex: 'displayName',
      render: (name: string, record: AgentConfig) => (
        <div>
          <Typography.Text strong>{name}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Typography.Text>
        </div>
      )
    },
    {
      title: t('agent.worksFor'),
      width: 140,
      render: () => <Typography.Text type="secondary">{t('agent.worksForDesc')}</Typography.Text>
    },
    {
      title: t('common.actions'),
      width: 120,
      key: 'actions',
      render: (_, record: AgentConfig) => (
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => toggleMutation.mutate(record.agentType)}>
          {t('agent.activate')}
        </Button>
      )
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader title={t('agent.title')} description={t('agent.description')} />
      <Card
        title={<><ThunderboltOutlined /> {t('agent.myAgents')} <Tag color="blue">{enabledAgents.length}</Tag></>}
        style={{ marginBottom: 24 }}
      >
        {enabledAgents.length === 0 ? (
          <Empty description={t('agent.noAgents')} />
        ) : (
          <Table rowKey="agentType" columns={columns} dataSource={enabledAgents} pagination={false} showHeader={false} />
        )}
      </Card>

      {disabledAgents.length > 0 && (
        <Card title={<><PlusOutlined /> {t('agent.available')} <Tag>{disabledAgents.length}</Tag></>}>
          <Table rowKey="agentType" columns={availableColumns} dataSource={disabledAgents} pagination={false} showHeader={false} />
        </Card>
      )}
    </div>
  );
}
