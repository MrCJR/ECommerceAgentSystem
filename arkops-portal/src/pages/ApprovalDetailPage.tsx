import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Space, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { approvalsApi } from '../api/approvals';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

export function ApprovalDetailPage() {
  const { approvalId } = useParams();
  const queryClient = useQueryClient();
  const { data: approval } = useQuery({
    queryKey: ['approval', approvalId],
    queryFn: () => approvalsApi.get(approvalId!)
  });
  const decide = useMutation({
    mutationFn: (status: 'approved' | 'rejected') => approvalsApi.decide(approvalId!, status),
    onSuccess: () => {
      message.success('Approval updated');
      queryClient.invalidateQueries({ queryKey: ['approval', approvalId] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  if (!approval) return <EmptyState description="Approval not found" />;

  return (
    <div className="page-stack">
      <PageHeader
        title={approval.title}
        description={approval.reason}
        actions={
          approval.status === 'pending' ? (
            <Space>
              <Button icon={<CloseOutlined />} danger onClick={() => decide.mutate('rejected')}>
                Reject
              </Button>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => decide.mutate('approved')}>
                Approve
              </Button>
            </Space>
          ) : null
        }
      />
      <Card>
        <Descriptions column={2}>
          <Descriptions.Item label="Status">
            <StatusBadge value={approval.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Risk">
            <StatusBadge value={approval.riskLevel} />
          </Descriptions.Item>
          <Descriptions.Item label="Task">{approval.taskId}</Descriptions.Item>
          <Descriptions.Item label="Store">{approval.storeId}</Descriptions.Item>
          <Descriptions.Item label="Requested">{dayjs(approval.requestedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="Decided">
            {approval.decidedAt ? dayjs(approval.decidedAt).format('YYYY-MM-DD HH:mm') : 'Waiting'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="Proposed action">
        <Typography.Paragraph>{approval.proposedAction}</Typography.Paragraph>
        <Descriptions column={1}>
          <Descriptions.Item label="Before">{approval.beforeValue}</Descriptions.Item>
          <Descriptions.Item label="After">{approval.afterValue}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
