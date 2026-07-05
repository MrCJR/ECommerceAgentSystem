import { CheckCircleOutlined, CloseCircleOutlined, CustomerServiceOutlined, EditOutlined, FundOutlined, PictureOutlined, PlayCircleOutlined, PushpinOutlined, ReloadOutlined, RobotOutlined, SafetyOutlined, SendOutlined, StarOutlined, TeamOutlined, ToolOutlined, WarningOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Input, Modal, Progress, Rate, Row, Space, Statistic, Tabs, Tag, Typography, message } from 'antd';
import { useState } from 'react';
import { useI18n } from '../../../app/i18n';
import { EmptyState } from '../../../components/EmptyState';
import {
  mockBreakerLogs,
  mockBudgetSuggestions,
  mockCampaigns,
  mockChats,
  mockChurnRisks,
  mockConversations,
  mockCoupons,
  mockCreatives,
  mockLiveComments,
  mockLiveMetrics,
  mockLiveProducts,
  mockReviews,
  mockRiskScans,
  mockSegments,
} from '../agentConfigMockData';

interface CustomerServiceModalProps {
  customerServiceOpen: boolean;
  onCloseCustomerService: () => void;
}

export function CustomerServiceModal(props: CustomerServiceModalProps) {
  const { t } = useI18n();
  const { customerServiceOpen, onCloseCustomerService } = props;
  const [csActiveChat, setCsActiveChat] = useState(0);
  const [csInput, setCsInput] = useState('');

  return (
    <Modal
            title={<><CustomerServiceOutlined style={{ color: '#2563eb' }} /> {t('agent.csChat')}</>}
            open={customerServiceOpen}
            onCancel={() => onCloseCustomerService()}
            footer={null}
            width={860}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{ display: 'flex', height: 520 }}>
              {/* 会话列表 */}
              <div style={{ width: 220, borderRight: '1px solid var(--ark-border)', overflow: 'auto', background: '#fafbfc' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--ark-border-soft)' }}>
                  <Typography.Text strong style={{ fontSize: 12 }}>在线会话</Typography.Text>
                  <Badge status="processing" text={<Typography.Text style={{ fontSize: 10 }}>AI 自动回复中</Typography.Text>} style={{ display: 'block', marginTop: 2 }} />
                </div>
                {mockConversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => { setCsActiveChat(conv.id); setCsInput(''); }}
                    style={{
                      padding: '12px 16px', cursor: 'pointer',
                      background: csActiveChat === conv.id ? '#eff6ff' : 'transparent',
                      borderBottom: '1px solid var(--ark-border-soft)',
                      borderLeft: csActiveChat === conv.id ? '3px solid #2563eb' : '3px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography.Text strong style={{ fontSize: 13 }}>{conv.name}</Typography.Text>
                      {conv.unread && <Badge status="processing" />}
                    </div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{conv.product}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }} ellipsis>
                      {conv.escalate && <Tag color="red" style={{ fontSize: 10, marginRight: 4, padding: '0 4px' }}>待转人工</Tag>}
                      {conv.lastMsg}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 10 }}>{conv.time}</Typography.Text>
                  </div>
                ))}
              </div>
              {/* 聊天窗口 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 聊天头部 */}
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--ark-border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
                  <div>
                    <Typography.Text strong style={{ fontSize: 13 }}>{mockConversations[csActiveChat].name}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                      购买: {mockConversations[csActiveChat].product}
                    </Typography.Text>
                  </div>
                  <Space size={4}>
                    {mockConversations[csActiveChat].escalate ? (
                      <Tag color="red" style={{ fontSize: 10 }}>已转人工</Tag>
                    ) : (
                      <Tag color="green" style={{ fontSize: 10 }}>AI 应答中</Tag>
                    )}
                  </Space>
                </div>
                {/* 消息列表 */}
                <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', background: 'var(--ark-bg)' }}>
                  {mockChats[csActiveChat].map((msg, i) => (
                    <div key={i} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: msg.from === 'buyer' ? 'flex-end' : 'flex-start' }}>
                      {msg.from === 'ai' && (
                        <Typography.Text type="secondary" style={{ fontSize: 9, marginBottom: 2, marginLeft: 4 }}>
                          <RobotOutlined style={{ marginRight: 3 }} />AI Auto-Reply
                        </Typography.Text>
                      )}
                      <div style={{
                        maxWidth: '78%', padding: '8px 14px', borderRadius: 12,
                        background: msg.from === 'buyer' ? '#eff6ff' : msg.from === 'agent' ? '#fef9e7' : '#f0fdf4',
                        border: msg.from === 'ai' ? '1px solid #bbf7d0' : msg.from === 'agent' ? '1px solid #fde68a' : '1px solid transparent',
                        fontSize: 12, lineHeight: 1.55
                      }}>
                        {msg.from === 'agent' && <Tag color="gold" style={{ fontSize: 9, marginBottom: 2, padding: '0 3px', lineHeight: '14px' }}>人工客服</Tag>}
                        {msg.text}
                      </div>
                      <Typography.Text type="secondary" style={{ fontSize: 9, marginTop: 2 }}>{msg.time}</Typography.Text>
                    </div>
                  ))}
                </div>
                {/* 快捷回复 */}
                <div style={{ padding: '4px 12px', borderTop: '1px solid var(--ark-border-soft)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Tag color="blue" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setCsInput('请问发什么快递？多久能到？')}>📦 物流时效</Tag>
                  <Tag color="blue" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setCsInput('支持哪些支付方式？')}>💳 支付方式</Tag>
                  <Tag color="blue" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setCsInput('可以退换货吗？有什么条件？')}>🔄 退换政策</Tag>
                  <Tag color="blue" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setCsInput('这个商品有什么优惠活动吗？')}>🎁 优惠活动</Tag>
                </div>
                {/* 输入框 */}
                <div style={{ padding: '8px 12px', borderTop: '1px solid var(--ark-border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <Input.TextArea
                    placeholder={t('agent.csInputPlaceholder')}
                    value={csInput}
                    onChange={e => setCsInput(e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    style={{ flex: 1, fontSize: 12 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        setCsInput('');
                        message.success('已发送（人工接管模式）');
                      }
                    }}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={() => { setCsInput(''); message.success('已发送（人工接管模式）'); }} size="small">
                    {t('common.send')}
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
  );
}
