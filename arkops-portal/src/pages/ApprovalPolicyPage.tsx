import { RobotOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { agentsApi } from '../api/agents';
import { approvalPolicyApi } from '../api/approvalPolicies';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { AgentConfig, ApprovalPolicy } from '../types/domain';

const actionLabels: Record<ApprovalPolicy['action'], string> = {
  auto_execute: 'agent.autoExecute',
  single_approval: 'agent.singleApproval',
  dual_approval: 'agent.dualApproval'
};

const actionTags: Record<ApprovalPolicy['action'], string> = {
  auto_execute: 'green',
  single_approval: 'blue',
  dual_approval: 'red'
};

export function ApprovalPolicyPage() {
  const { t } = useI18n();
  const { data: agents = [] } = useQuery({ queryKey: ['agents'], queryFn: agentsApi.list });
  const { data: policies = [] } = useQuery({ queryKey: ['approval-policies'], queryFn: approvalPolicyApi.list });

  // 按风险等级关联每个 Agent 的审批策略
  const agentPolicies = agents.map((agent) => {
    const policy = policies.find((p) => p.riskLevel === agent.riskLevel);
    return { ...agent, policy };
  });

  const columns: ColumnsType<AgentConfig & { policy?: ApprovalPolicy }> = [
    {
      title: t('agent.name'),
      dataIndex: 'displayName',
      render: (name: string) => (
        <Typography.Text strong><RobotOutlined style={{ marginRight: 6, color: '#7c3aed' }} />{name}</Typography.Text>
      )
    },
    {
      title: t('agent.riskDesc'),
      dataIndex: 'riskLevel',
      width: 120,
      render: (risk: string) => <StatusBadge value={risk as AgentConfig['riskLevel']} />
    },
    {
      title: t('approval.rule'),
      width: 160,
      render: (_: unknown, record: AgentConfig & { policy?: ApprovalPolicy }) => {
        if (!record.policy) return <Tag>-</Tag>;
        return (
          <Tag color={actionTags[record.policy.action]}>
            {t(actionLabels[record.policy.action])}
          </Tag>
        );
      }
    },
    {
      title: t('approval.explain'),
      render: (_: unknown, record: AgentConfig & { policy?: ApprovalPolicy }) => {
        if (!record.policy) return null;
        const key = `approval.explain_${record.riskLevel}_${record.policy.action}`;
        return <Typography.Text type="secondary">{t(key)}</Typography.Text>;
      }
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title={t('approval.policyTitle')}
        description={t('approval.policyDescription')}
      />
      <Card>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {t('approval.policyNote')}
        </Typography.Paragraph>
        <Table rowKey="agentType" columns={columns} dataSource={agentPolicies} pagination={false} />
      </Card>
    </div>
  );
}
