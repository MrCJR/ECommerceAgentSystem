import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Descriptions, Row, Space, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
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

  const comparisonData = useMemo(() => {
    if (!approval) return null;
    const titleLower = approval.title.toLowerCase();
    if (titleLower.includes('budget')) {
      return {
        beforeItems: [
          { label: '旧预算', value: '$5,000.00' },
          { label: '日上限', value: '$200/天' },
          { label: '月上限', value: '$5,000/月' },
        ],
        afterItems: [
          { label: '新预算', value: '$8,000.00' },
          { label: '日上限', value: '$350/天' },
          { label: '月上限', value: '$8,000/月' },
        ],
        changeAmount: '+$3,000.00',
      };
    }
    if (titleLower.includes('price')) {
      return {
        beforeItems: [
          { label: '原价', value: '$39.99' },
          { label: '成本', value: '$18.50' },
          { label: '利润率', value: '53.7%' },
        ],
        afterItems: [
          { label: '新价', value: '$45.99' },
          { label: '成本', value: '$18.50' },
          { label: '利润率', value: '59.8%' },
        ],
        changeAmount: '+$6.00',
      };
    }
    return {
      beforeItems: [
        { label: t('approvals.before'), value: approval.beforeValue || '-' },
      ],
      afterItems: [
        { label: t('approvals.after'), value: approval.afterValue || '-' },
      ],
      changeAmount: '-',
    };
  }, [approval, t]);

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
      <Card title={t('approvals.detail')}>
        <Typography.Paragraph>{approval.proposedAction}</Typography.Paragraph>
      </Card>
      {comparisonData && (
        <Card
          title={<Space><span>{t('approvals.proposedAction')}</span><Tag color="blue">{t('approvals.changeAmount')}: {comparisonData.changeAmount}</Tag></Space>}
          style={{ marginTop: 16 }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title={t('approvals.before')} style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                {comparisonData.beforeItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <Typography.Text type="secondary">{item.label}</Typography.Text>
                    <Typography.Text>{item.value}</Typography.Text>
                  </div>
                ))}
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title={t('approvals.after')} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                {comparisonData.afterItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <Typography.Text type="secondary">{item.label}</Typography.Text>
                    <Typography.Text strong style={{ color: '#16a34a' }}>{item.value}</Typography.Text>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
