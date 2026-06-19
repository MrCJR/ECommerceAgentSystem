import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Space, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { approvalsApi } from '../api/approvals';
import { useI18n } from '../app/i18n';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

export function ApprovalDetailPage() {
  const { t } = useI18n();
  const { approvalId } = useParams();
  const queryClient = useQueryClient();
  const { data: approval } = useQuery({
    queryKey: ['approval', approvalId],
    queryFn: () => approvalsApi.get(approvalId!)
  });
  const decide = useMutation({
    mutationFn: (status: 'approved' | 'rejected') => approvalsApi.decide(approvalId!, status),
    onSuccess: () => {
      message.success(t('approvals.updated'));
      queryClient.invalidateQueries({ queryKey: ['approval', approvalId] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  if (!approval) return <EmptyState description={t('approval.notFound')} />;

  return (
    <div className="page-stack">
      <PageHeader
        title={approval.title}
        description={approval.reason}
        actions={
          approval.status === 'pending' ? (
            <Space>
              <Button icon={<CloseOutlined />} danger onClick={() => decide.mutate('rejected')}>
                {t('approvals.reject')}
              </Button>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => decide.mutate('approved')}>
                {t('approvals.approve')}
              </Button>
            </Space>
          ) : null
        }
      />
      <Card>
        <Descriptions column={2}>
          <Descriptions.Item label={t('approvals.agentHeader')}>{t(`agent.${approval.agentType}`)}</Descriptions.Item>
          <Descriptions.Item label={t('approvals.storeHeader')}>{approval.storeName}</Descriptions.Item>
          <Descriptions.Item label={t('approvals.item')}>{approval.title}</Descriptions.Item>
          <Descriptions.Item label={t('approvals.riskHeader')}>
            <StatusBadge value={approval.riskLevel} />
          </Descriptions.Item>
          <Descriptions.Item label={t('approvals.statusHeader')}>
            <StatusBadge value={approval.status} />
          </Descriptions.Item>
          <Descriptions.Item label={t('approvals.requested')}>{dayjs(approval.requestedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label={t('entity.task')}>{approval.taskId}</Descriptions.Item>
          <Descriptions.Item label={t('approvals.decided')}>
            {approval.decidedAt ? dayjs(approval.decidedAt).format('YYYY-MM-DD HH:mm') : t('approvals.waiting')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title={t('approvals.proposedAction')}>
        <Typography.Paragraph>{approval.proposedAction}</Typography.Paragraph>
        <Descriptions column={1}>
          <Descriptions.Item label={t('approvals.before')}>{approval.beforeValue}</Descriptions.Item>
          <Descriptions.Item label={t('approvals.after')}>{approval.afterValue}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
