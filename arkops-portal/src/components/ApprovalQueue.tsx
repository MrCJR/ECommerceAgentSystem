import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Empty, message, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../app/i18n';

interface ApprovalItem {
  id: number;
  agent: string;
  agentType: string;
  task: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  request: string;
  time: string;
}

const mockApprovals: ApprovalItem[] = [
  { id: 1, agent: '广告投放', agentType: 'ads_optimizer', task: 'budgetOptimize', risk: 'medium', request: '计划 C-102 ROI=0.8，建议暂停并释放 $120/日预算', time: '5分钟前' },
  { id: 2, agent: '广告投放', agentType: 'ads_optimizer', task: 'budgetOptimize', risk: 'low', request: '计划 A-201 ROI=3.2，建议追加 $50/日预算', time: '12分钟前' },
  { id: 3, agent: '商品上架', agentType: 'product_launch', task: 'draftGeneration', risk: 'low', request: '新品「Portable SSD 1TB」草稿待审核发布', time: '32分钟前' },
  { id: 4, agent: '定价策略', agentType: 'pricing_strategy', task: 'dynamicPrice', risk: 'medium', request: 'Wireless Earbuds Pro 2 建议调价 $32.99 → $29.99（-9.1%）', time: '1小时前' },
  { id: 5, agent: '促销活动', agentType: 'promotion_campaign', task: 'flashSaleSetup', risk: 'high', request: '建议为 3 个滞销 SKU 创建 30% 闪购活动（预算 $500）', time: '2小时前' },
];

const riskConfig: Record<string, { color: string; tag: string }> = {};

export function ApprovalQueue() {
  const { t } = useI18n();
  const [items, setItems] = useState(mockApprovals);

  riskConfig.low = { color: 'green', tag: t('approval.low') };
  riskConfig.medium = { color: 'gold', tag: t('approval.medium') };
  riskConfig.high = { color: 'orange', tag: t('approval.high') };
  riskConfig.critical = { color: 'red', tag: t('approval.critical') };

  const handleApprove = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    message.success(t('approval.approved'));
  };
  const handleReject = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    message.info(t('approval.rejected'));
  };

  const columns = [
    {
      title: t('approval.agent'), dataIndex: 'agent', width: 100,
      render: (v: string, r: ApprovalItem) => <Link to={`/agents/${r.agentType}`}><Typography.Text strong style={{ fontSize: 12 }}>{v}</Typography.Text></Link>,
    },
    { title: t('approval.request'), dataIndex: 'request', ellipsis: true, render: (v: string) => <Typography.Text style={{ fontSize: 12 }}>{v}</Typography.Text> },
    {
      title: t('approval.risk'), dataIndex: 'risk', width: 70,
      render: (v: string) => { const c = riskConfig[v]; return <Tag color={c.color} style={{ fontSize: 11 }}>{c.tag}</Tag>; },
    },
    { title: t('approval.time'), dataIndex: 'time', width: 80, render: (v: string) => <Typography.Text type="secondary" style={{ fontSize: 11 }}>{v}</Typography.Text> },
    {
      title: '', width: 120,
      render: (_: unknown, r: ApprovalItem) => (
        <Space size="small">
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(r.id)}>{t('approval.approve')}</Button>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(r.id)}>{t('approval.reject')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <Badge count={items.length} size="small">
            <Typography.Text strong>{t('approval.title')}</Typography.Text>
          </Badge>
        </Space>
      }
    >
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('approval.noPending')} style={{ padding: '12px 0' }} />
      ) : (
        <Table dataSource={items} columns={columns} rowKey="id" pagination={false} size="small" />
      )}
    </Card>
  );
}
