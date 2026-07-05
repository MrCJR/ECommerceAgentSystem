import { CheckCircleOutlined, CloseCircleOutlined, CustomerServiceOutlined, EditOutlined, FundOutlined, PictureOutlined, PlayCircleOutlined, PushpinOutlined, ReloadOutlined, RobotOutlined, SafetyOutlined, SendOutlined, StarOutlined, TeamOutlined, ToolOutlined, WarningOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Input, Modal, Progress, Rate, Row, Space, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import { useState } from 'react';
import { useI18n } from '../app/i18n';
import { EmptyState } from '../components/EmptyState';
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
} from './agentConfigMockData';

type ReviewStatus = 'pending' | 'replied' | 'dismissed';

interface AgentWorkflowModalsProps {
  reviewOpen: boolean;
  onCloseReview: () => void;
  customerServiceOpen: boolean;
  onCloseCustomerService: () => void;
  adsDashboardOpen: boolean;
  onCloseAdsDashboard: () => void;
  creativeOpen: boolean;
  onCloseCreative: () => void;
  riskOpen: boolean;
  onCloseRisk: () => void;
  liveOpen: boolean;
  onCloseLive: () => void;
  crmOpen: boolean;
  onCloseCrm: () => void;
}

export function AgentWorkflowModals({
  reviewOpen,
  onCloseReview,
  customerServiceOpen,
  onCloseCustomerService,
  adsDashboardOpen,
  onCloseAdsDashboard,
  creativeOpen,
  onCloseCreative,
  riskOpen,
  onCloseRisk,
  liveOpen,
  onCloseLive,
  crmOpen,
  onCloseCrm,
}: AgentWorkflowModalsProps) {
  const { t } = useI18n();
  const [reviewTab, setReviewTab] = useState<string>('pending');
  const [reviewState, setReviewState] = useState<Record<number, ReviewStatus>>({
    1: 'pending', 2: 'pending', 3: 'pending', 4: 'pending',
  });
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewEdits, setReviewEdits] = useState<Record<number, string>>({});
  const [csActiveChat, setCsActiveChat] = useState(0);
  const [csInput, setCsInput] = useState('');
  const [adOptimizeOpen, setAdOptimizeOpen] = useState(false);

  return (
    <>
      {/* 评价管理：差评监控弹窗 */}
      <Modal
        title={<><StarOutlined style={{ color: '#ea580c' }} /> {t('agent.reviewCard')}</>}
        open={reviewOpen}
        onCancel={() => { onCloseReview(); setEditingReviewId(null); setReviewTab('pending'); }}
        footer={null}
        width={780}
      >
        <Tabs
          activeKey={reviewTab}
          onChange={(k) => { setReviewTab(k); setEditingReviewId(null); }}
          items={[
            {
              key: 'pending',
              label: `待处理 (${mockReviews.filter(r => reviewState[r.id] === 'pending').length})`,
              children: (
                <div style={{ maxHeight: 460, overflow: 'auto' }}>
                  {mockReviews.filter(r => reviewState[r.id] === 'pending').length === 0 ? (
                    <EmptyState description="所有差评已处理完毕" />
                  ) : (
                    mockReviews.filter(r => reviewState[r.id] === 'pending').map(review => (
                      <Card
                        key={review.id}
                        size="small"
                        style={{
                          marginBottom: 12,
                          borderLeft: `4px solid ${review.severity === 'high' ? '#dc2626' : review.severity === 'medium' ? '#ea580c' : '#f59e0b'}`
                        }}
                      >
                        {/* 评分 & 买家信息 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 14 }} />
                            <Typography.Text strong style={{ marginLeft: 8 }}>{review.buyer}</Typography.Text>
                            <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 11 }}>
                              {review.product}
                            </Typography.Text>
                          </div>
                          <Space size={4}>
                            <Tag color={review.severity === 'high' ? 'red' : review.severity === 'medium' ? 'orange' : 'gold'} style={{ fontSize: 10 }}>
                              {review.severity === 'high' ? '严重' : review.severity === 'medium' ? '中等' : '轻微'}
                            </Tag>
                            <Typography.Text type="secondary" style={{ fontSize: 10 }}>
                              {review.platform} · {review.orderId}
                            </Typography.Text>
                          </Space>
                        </div>

                        {/* 差评原文 */}
                        <Typography.Paragraph style={{ fontSize: 12, marginBottom: 10, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, fontStyle: 'italic' }}>
                          "{review.content}"
                        </Typography.Paragraph>

                        {/* AI 建议回复 */}
                        <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, marginBottom: 10, border: '1px solid #bbf7d0' }}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
                            <RobotOutlined style={{ marginRight: 4 }} />{t('agent.reviewReply')} · {review.date}
                          </Typography.Text>
                          {editingReviewId === review.id ? (
                            <Input.TextArea
                              autoSize={{ minRows: 3, maxRows: 6 }}
                              value={reviewEdits[review.id] ?? review.aiReply}
                              onChange={(e) => setReviewEdits(prev => ({ ...prev, [review.id]: e.target.value }))}
                              style={{ fontSize: 12 }}
                            />
                          ) : (
                            <Typography.Paragraph style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-line' }}>
                              {reviewEdits[review.id] || review.aiReply}
                            </Typography.Paragraph>
                          )}
                        </div>

                        {/* 操作按钮 */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          {editingReviewId === review.id ? (
                            <>
                              <Button size="small" onClick={() => { setEditingReviewId(null); setReviewEdits(prev => { const next = { ...prev }; delete next[review.id]; return next; }); }}>
                                取消编辑
                              </Button>
                              <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => {
                                setEditingReviewId(null);
                                setReviewState(prev => ({ ...prev, [review.id]: 'replied' }));
                                message.success(t('agent.reviewSent'));
                              }}>
                                确认并发送
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="small" icon={<CloseCircleOutlined />} onClick={() => setReviewState(prev => ({ ...prev, [review.id]: 'dismissed' }))}>
                                {t('agent.reviewDismiss')}
                              </Button>
                              <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingReviewId(review.id); if (!reviewEdits[review.id]) setReviewEdits(prev => ({ ...prev, [review.id]: review.aiReply })); }}>
                                {t('agent.reviewEdit')}
                              </Button>
                              <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => {
                                setReviewState(prev => ({ ...prev, [review.id]: 'replied' }));
                                message.success(t('agent.reviewSent'));
                              }}>
                                {t('agent.reviewSend')}
                              </Button>
                            </>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )
            },
            {
              key: 'replied',
              label: `已回复 (${mockReviews.filter(r => reviewState[r.id] === 'replied').length})`,
              children: (
                <div style={{ maxHeight: 460, overflow: 'auto' }}>
                  {mockReviews.filter(r => reviewState[r.id] === 'replied').length === 0 ? (
                    <EmptyState description="暂无已回复的差评" />
                  ) : (
                    mockReviews.filter(r => reviewState[r.id] === 'replied').map(review => (
                      <Card key={review.id} size="small" style={{ marginBottom: 12, borderLeft: '4px solid #16a34a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <Space size={4}>
                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 12 }} />
                            <Typography.Text strong style={{ fontSize: 12 }}>{review.buyer}</Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>{review.product}</Typography.Text>
                          </Space>
                          <Tag color="green" style={{ fontSize: 10 }}>
                            <CheckCircleOutlined /> 已回复 · {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </Tag>
                        </div>
                        <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '0 0 6px', padding: '6px 10px', background: '#fef2f2', borderRadius: 6 }}>
                          "{review.content.slice(0, 80)}..."
                        </Typography.Paragraph>
                        <Typography.Paragraph style={{ fontSize: 11, margin: 0, padding: '6px 10px', background: '#f0fdf4', borderRadius: 6 }}>
                          {reviewEdits[review.id] || review.aiReply}
                        </Typography.Paragraph>
                      </Card>
                    ))
                  )}
                </div>
              )
            },
            {
              key: 'dismissed',
              label: `已忽略 (${mockReviews.filter(r => reviewState[r.id] === 'dismissed').length})`,
              children: (
                <div style={{ maxHeight: 460, overflow: 'auto' }}>
                  {mockReviews.filter(r => reviewState[r.id] === 'dismissed').length === 0 ? (
                    <EmptyState description="暂无已忽略的差评" />
                  ) : (
                    mockReviews.filter(r => reviewState[r.id] === 'dismissed').map(review => (
                      <Card key={review.id} size="small" style={{ marginBottom: 12, borderLeft: '4px solid #94a3b8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space size={4}>
                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 12 }} />
                            <Typography.Text strong style={{ fontSize: 12 }}>{review.buyer}</Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>{review.product}</Typography.Text>
                          </Space>
                          <Tag style={{ fontSize: 10 }}>已忽略</Tag>
                        </div>
                        <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '6px 0 0', padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                          "{review.content.slice(0, 80)}..."
                        </Typography.Paragraph>
                      </Card>
                    ))
                  )}
                </div>
              )
            }
          ]}
        />
      </Modal>

      {/* 客服消息：客服会话弹窗 */}
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

      {/* 广告投放：投放仪表盘弹窗 */}
      <Modal
        title={<><FundOutlined style={{ color: '#2563eb' }} /> {t('agent.adDashboard')}</>}
        open={adsDashboardOpen}
        onCancel={() => onCloseAdsDashboard()}
        footer={null}
        width={800}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
          最近 7 天投放效果总览 · 目标 ROI: 1.5× · 总花费: ${mockCampaigns.reduce((s, c) => s + c.spend, 0)}
        </Typography.Text>
        {mockCampaigns.map(c => (
          <Card
            key={c.id}
            size="small"
            hoverable
            style={{ marginBottom: 12, borderLeft: `4px solid ${c.roi >= 1.5 ? '#16a34a' : c.roi >= 1.0 ? '#ea580c' : '#dc2626'}` }}
            onClick={() => { onCloseAdsDashboard(); setAdOptimizeOpen(true); }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <Typography.Text strong style={{ fontSize: 14 }}>{c.name}</Typography.Text>
                <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 11 }}>{c.id} · {c.status === 'active' ? '投放中' : '已暂停'}</Typography.Text>
              </div>
              <Space size={8}>
                <Tag color={c.roi >= 1.5 ? 'green' : c.roi >= 1.0 ? 'orange' : 'red'} style={{ fontSize: 11 }}>
                  ROI {c.roi}× {c.roi >= 1.5 ? '✓ 达标' : c.roi >= 1.0 ? '⚠ 偏低' : '✗ 不达标'}
                </Tag>
              </Space>
            </div>
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <div style={{ marginBottom: 4 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 10 }}>预算使用</Typography.Text>
                  <Typography.Text strong style={{ display: 'block', fontSize: 14 }}>${c.budget}</Typography.Text>
                </div>
                <Progress
                  percent={Math.round(c.spend / c.budget * 100)}
                  size="small"
                  status={c.roi < 1.0 ? 'exception' : c.roi >= 1.5 ? 'success' : 'active'}
                  format={() => `$${c.spend}`}
                />
              </Col>
              <Col span={4}>
                <Statistic title="ROI" value={c.roi} suffix="×" valueStyle={{ fontSize: 20, color: c.roi >= 1.5 ? '#16a34a' : c.roi >= 1.0 ? '#ea580c' : '#dc2626' }} />
              </Col>
              <Col span={4}>
                <Statistic title="曝光" value={(c.impressions / 1000).toFixed(1)} suffix="k" valueStyle={{ fontSize: 14 }} />
              </Col>
              <Col span={4}>
                <Statistic title="点击" value={c.clicks} valueStyle={{ fontSize: 14 }} />
              </Col>
              <Col span={4}>
                <Statistic title="CTR" value={(c.clicks / c.impressions * 100).toFixed(1)} suffix="%" valueStyle={{ fontSize: 14 }} />
              </Col>
              <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Button size="small" type="link" icon={<ToolOutlined />} style={{ fontSize: 11, padding: 0 }}>
                  调整
                </Button>
              </Col>
            </Row>
          </Card>
        ))}
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <Button type="primary" icon={<ToolOutlined />} onClick={() => { onCloseAdsDashboard(); setAdOptimizeOpen(true); }}>
            {t('agent.adOptimize')}
          </Button>
        </div>
      </Modal>

      {/* 广告投放：预算优化弹窗 */}
      <Modal
        title={<><ToolOutlined /> {t('agent.adOptimize')}</>}
        open={adOptimizeOpen}
        onCancel={() => setAdOptimizeOpen(false)}
        onOk={() => { setAdOptimizeOpen(false); message.success('预算已重新分配！总预算 $1,200 → CA-001: $550, CA-002: $150, CA-003: $500'); }}
        okText={t('agent.adApply')}
        width={680}
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
          AI 分析了最近 7 天的投放数据，建议将低效计划 CA-002 的预算转移至高 ROI 计划 CA-001。
        </Typography.Paragraph>
        {mockBudgetSuggestions.map(s => (
          <Card key={s.campaignId} size="small" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography.Text strong style={{ fontSize: 13 }}>{s.campaignId}</Typography.Text>
              <Tag color={s.suggested > s.current ? 'green' : s.suggested < s.current ? 'red' : 'default'} style={{ fontSize: 10 }}>
                {s.suggested > s.current ? '↑ 增加' : s.suggested < s.current ? '↓ 减少' : '→ 不变'}
              </Tag>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Row gutter={8}>
                  <Col span={12}>
                    <Typography.Text type="secondary" style={{ fontSize: 10 }}>当前</Typography.Text>
                    <Typography.Text strong style={{ display: 'block', fontSize: 16, color: '#64748b' }}>${s.current}</Typography.Text>
                  </Col>
                  <Col span={12}>
                    <Typography.Text type="secondary" style={{ fontSize: 10 }}>建议</Typography.Text>
                    <Typography.Text strong style={{ display: 'block', fontSize: 16, color: s.suggested > s.current ? '#16a34a' : s.suggested < s.current ? '#dc2626' : '#64748b' }}>
                      ${s.suggested}
                    </Typography.Text>
                  </Col>
                </Row>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 11, flex: 1, textAlign: 'right' }}>{s.reason}</Typography.Text>
            </div>
          </Card>
        ))}
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
          <Typography.Text style={{ fontSize: 12 }}>
            <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 4 }} />
            预计调整后整体 ROI 从 1.48× 提升至 1.72×，月利润增加约 $320
          </Typography.Text>
        </div>
      </Modal>

      {/* 素材工厂：图片生成预览弹窗 */}
      <Modal
        title={<><PictureOutlined style={{ color: '#7c3aed' }} /> 素材预览生成</>}
        open={creativeOpen}
        onCancel={() => onCloseCreative()}
        footer={null}
        width={780}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
          基于商品信息和选定的尺寸/语气，AI 已生成 {mockCreatives.length} 组广告素材方案
        </Typography.Text>
        <Row gutter={[16, 16]}>
          {mockCreatives.map(creative => (
            <Col xs={24} sm={8} key={creative.id}>
              <Card
                hoverable
                size="small"
                style={{ textAlign: 'center', borderTop: `4px solid ${creative.colors[0]}` }}
              >
                {/* 模拟广告图预览 */}
                <div style={{
                  height: 140, margin: '-1px -1px 10px', borderRadius: '6px 6px 0 0',
                  background: `linear-gradient(135deg, ${creative.colors[0]} 0%, ${creative.colors[1]} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: creative.colors[2], fontSize: 18, fontWeight: 700, letterSpacing: 1,
                }}>
                  {creative.previewText}
                </div>
                <Typography.Text strong style={{ fontSize: 12, display: 'block' }}>{creative.product}</Typography.Text>
                <Space size={4} style={{ marginTop: 4 }}>
                  <Tag color="purple" style={{ fontSize: 9 }}>{creative.size}</Tag>
                  <Tag color="blue" style={{ fontSize: 9 }}>{creative.tone}</Tag>
                </Space>
                <Typography.Paragraph style={{ fontSize: 11, margin: '8px 0 0', color: '#64748b', whiteSpace: 'pre-line' }}>
                  {creative.copy}
                </Typography.Paragraph>
                <div style={{ marginTop: 8, display: 'flex', gap: 4, justifyContent: 'center' }}>
                  <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} style={{ fontSize: 11 }}>
                    选用
                  </Button>
                  <Button size="small" icon={<ReloadOutlined />} style={{ fontSize: 11 }}>
                    换一版
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* 风险控制：违规扫描弹窗 */}
      <Modal
        title={<><SafetyOutlined style={{ color: '#dc2626' }} /> 合规扫描结果</>}
        open={riskOpen}
        onCancel={() => onCloseRisk()}
        footer={null}
        width={820}
      >
        <Tabs
          defaultActiveKey="scan"
          items={[
            {
              key: 'scan',
              label: `违规扫描 (${mockRiskScans.filter(r => r.status === 'pending').length})`,
              children: (
                <div style={{ maxHeight: 420, overflow: 'auto' }}>
                  {mockRiskScans.map(scan => (
                    <Card
                      key={scan.id}
                      size="small"
                      style={{
                        marginBottom: 10,
                        borderLeft: `4px solid ${scan.severity === 'high' ? '#dc2626' : scan.severity === 'medium' ? '#ea580c' : '#f59e0b'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <Typography.Text strong style={{ fontSize: 13 }}>{scan.product}</Typography.Text>
                          <Tag
                            color={scan.severity === 'high' ? 'red' : scan.severity === 'medium' ? 'orange' : 'gold'}
                            style={{ marginLeft: 8, fontSize: 10 }}
                          >
                            {scan.severity === 'high' ? '高风险' : scan.severity === 'medium' ? '中风险' : '低风险'}
                          </Tag>
                        </div>
                        <Tag style={{ fontSize: 10 }}>{scan.rule}</Tag>
                      </div>
                      <Typography.Paragraph type="danger" style={{ fontSize: 12, margin: '0 0 6px', padding: '6px 10px', background: '#fef2f2', borderRadius: 6 }}>
                        {scan.issue}
                      </Typography.Paragraph>
                      <div style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', padding: '6px 10px', borderRadius: 6 }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        建议: {scan.suggestion}
                      </div>
                    </Card>
                  ))}
                </div>
              )
            },
            {
              key: 'breaker',
              label: `熔断记录 (${mockBreakerLogs.length})`,
              children: (
                <div style={{ maxHeight: 420, overflow: 'auto' }}>
                  {mockBreakerLogs.map(log => (
                    <Card key={log.id} size="small" style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Typography.Text strong style={{ fontSize: 13 }}>{log.agent}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 10 }}>{log.time}</Typography.Text>
                      </div>
                      <Typography.Paragraph style={{ fontSize: 12, margin: '0 0 4px', padding: '6px 10px', background: '#fff7ed', borderRadius: 6, color: '#ea580c' }}>
                        {log.reason}
                      </Typography.Paragraph>
                      <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                        动作: {log.action}
                      </Typography.Text>
                      <Tag color={log.recovered ? 'green' : 'red'} style={{ fontSize: 10, marginTop: 4 }}>
                        {log.recovered ? `✓ 已恢复 · ${log.recoveredAt}` : '✗ 未恢复'}
                      </Tag>
                    </Card>
                  ))}
                </div>
              )
            }
          ]}
        />
      </Modal>

      {/* 直播运营：实时直播面板 */}
      <Modal
        title={<><PlayCircleOutlined style={{ color: '#ea580c', marginRight: 8 }} />{mockLiveMetrics.title}</>}
        open={liveOpen}
        onCancel={() => onCloseLive()}
        footer={null}
        width={860}
      >
        <Row gutter={[16, 16]}>
          {/* 核心指标 */}
          <Col span={24}>
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ background: '#fef2f2', textAlign: 'center' }}>
                  <Statistic title="当前观看" value={mockLiveMetrics.viewers} valueStyle={{ fontSize: 22, color: '#dc2626' }} />
                  <Typography.Text type="secondary" style={{ fontSize: 10 }}>峰值 {mockLiveMetrics.peakViewers}</Typography.Text>
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="点赞" value={mockLiveMetrics.likes} valueStyle={{ fontSize: 20 }} />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="评论" value={mockLiveMetrics.comments} valueStyle={{ fontSize: 20 }} />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="转化率" value={mockLiveMetrics.conversionRate} suffix="%" valueStyle={{ fontSize: 20, color: '#16a34a' }} />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ background: '#f0fdf4', textAlign: 'center' }}>
                  <Statistic title="GMV" value={mockLiveMetrics.gmv} prefix="$" valueStyle={{ fontSize: 20, color: '#16a34a' }} />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="时长" value={mockLiveMetrics.duration} valueStyle={{ fontSize: 16 }} />
                  <Tag color="green" style={{ fontSize: 9, marginTop: 2 }}>直播中</Tag>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* 商品列表 */}
          <Col xs={24} md={14}>
            <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>讲解商品 (4)</Typography.Text>}>
              {mockLiveProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--ark-border-soft)' }}>
                  <div>
                    <Typography.Text strong style={{ fontSize: 12 }}>
                      {p.pinned && <PushpinOutlined style={{ color: '#ea580c', marginRight: 4, fontSize: 11 }} />}
                      {p.name}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>${p.price}</Typography.Text>
                  </div>
                  <Space size={8}>
                    <Typography.Text type="secondary" style={{ fontSize: 10 }}>点击 {p.clicks} · 成交 {p.orders}</Typography.Text>
                    {p.pinned ? (
                      <Tag color="orange" style={{ fontSize: 9 }}>已置顶</Tag>
                    ) : (
                      <Button size="small" type="link" style={{ fontSize: 10, padding: 0 }}>置顶</Button>
                    )}
                  </Space>
                </div>
              ))}
            </Card>
          </Col>

          {/* 评论区 */}
          <Col xs={24} md={10}>
            <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>评论区 ({mockLiveComments.length})</Typography.Text>} style={{ height: '100%' }}>
              {mockLiveComments.map(c => (
                <div key={c.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography.Text strong style={{ fontSize: 11 }}>{c.user}</Typography.Text>
                    {c.replied ? (
                      <Tag color="green" style={{ fontSize: 9, padding: '0 3px' }}>
                        <RobotOutlined /> AI已回
                      </Tag>
                    ) : (
                      <Tag color="orange" style={{ fontSize: 9, padding: '0 3px' }}>待回复</Tag>
                    )}
                  </div>
                  <Typography.Text style={{ fontSize: 11, display: 'block', padding: '4px 8px', background: '#eff6ff', borderRadius: 6 }}>
                    {c.text}
                  </Typography.Text>
                  {c.replied && c.aiReply && (
                    <Typography.Text style={{ fontSize: 10, color: '#16a34a', display: 'block', padding: '2px 8px', marginTop: 2 }}>
                      ↳ {c.aiReply}
                    </Typography.Text>
                  )}
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* CRM 复购：客户分层与运营弹窗 */}
      <Modal
        title={<><TeamOutlined style={{ color: '#2563eb' }} /> 客户分层与运营概览</>}
        open={crmOpen}
        onCancel={() => onCloseCrm()}
        footer={null}
        width={860}
      >
        <Tabs
          defaultActiveKey="segment"
          items={[
            {
              key: 'segment',
              label: '客户分层',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    {/* 环形图 */}
                    <Col xs={24} md={10} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{
                        width: 200, height: 200, borderRadius: '50%',
                        background: `conic-gradient(
                          #2563eb 0deg ${mockSegments.new.pct * 3.6}deg,
                          #16a34a ${mockSegments.new.pct * 3.6}deg ${(mockSegments.new.pct + mockSegments.active.pct) * 3.6}deg,
                          #ea580c ${(mockSegments.new.pct + mockSegments.active.pct) * 3.6}deg ${(mockSegments.new.pct + mockSegments.active.pct + mockSegments.dormant.pct) * 3.6}deg,
                          #dc2626 ${(mockSegments.new.pct + mockSegments.active.pct + mockSegments.dormant.pct) * 3.6}deg 360deg
                        )`,
                        position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: 110, height: 110, borderRadius: '50%', background: '#fff',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Typography.Text strong style={{ fontSize: 22, color: '#2563eb' }}>
                            {Object.values(mockSegments).reduce((s, seg) => s + seg.count, 0)}
                          </Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 10 }}>总客户数</Typography.Text>
                        </div>
                      </div>
                    </Col>
                    {/* 分层指标 */}
                    <Col xs={24} md={14}>
                      {Object.entries(mockSegments).map(([key, seg]) => (
                        <div key={key} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <Space size={6}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color }} />
                              <Typography.Text strong style={{ fontSize: 12 }}>{seg.label}</Typography.Text>
                              <Tag color="default" style={{ fontSize: 10 }}>{seg.pct}%</Tag>
                            </Space>
                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                              {seg.count} 人 · 均单 ${seg.avgOrderValue}
                            </Typography.Text>
                          </div>
                          <Progress
                            percent={seg.pct}
                            strokeColor={seg.color}
                            size="small"
                            format={() => `${seg.count}人`}
                          />
                        </div>
                      ))}
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'coupon',
              label: '优惠券方案',
              children: (
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
                    AI 根据客户分层自动生成 {mockCoupons.length} 张定向优惠券，预计总成本 ${mockCoupons.reduce((s, c) => s + c.estimatedCost, 0)}
                  </Typography.Text>
                  {mockCoupons.map(coupon => (
                    <Card key={coupon.id} size="small" style={{ marginBottom: 10, borderLeft: '4px solid #7c3aed' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Typography.Text strong style={{ fontSize: 13 }}>{coupon.name}</Typography.Text>
                          <div style={{ marginTop: 2 }}>
                            <Tag color="purple" style={{ fontSize: 9 }}>{coupon.type}</Tag>
                            <Tag color="blue" style={{ fontSize: 9 }}>
                              {coupon.target === 'new' ? '新客' : coupon.target === 'active' ? '活跃' : coupon.target === 'dormant' ? '沉睡' : '流失'}
                            </Tag>
                          </div>
                        </div>
                        <Typography.Text strong style={{ fontSize: 18, color: '#7c3aed' }}>{coupon.value}</Typography.Text>
                      </div>
                      <Row gutter={8} style={{ marginTop: 8 }}>
                        <Col span={6}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>最低消费</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{coupon.minOrder === 0 ? '无门槛' : `$${coupon.minOrder}`}</Typography.Text>
                        </Col>
                        <Col span={6}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>有效期</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{coupon.expiryDays} 天</Typography.Text>
                        </Col>
                        <Col span={6}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>目标人数</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{mockSegments[coupon.target as keyof typeof mockSegments].count} 人</Typography.Text>
                        </Col>
                        <Col span={6}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>预估成本</Typography.Text>
                          <Typography.Text style={{ fontSize: 11, color: '#ea580c' }}>${coupon.estimatedCost}</Typography.Text>
                        </Col>
                      </Row>
                      <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                        <Button size="small" type="primary" ghost style={{ fontSize: 10 }}>一键发放</Button>
                        <Button size="small" style={{ fontSize: 10 }}>编辑规则</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            },
            {
              key: 'churn',
              label: `流失预警 (${mockChurnRisks.length})`,
              children: (
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  {mockChurnRisks.map(risk => (
                    <Card
                      key={risk.id}
                      size="small"
                      style={{
                        marginBottom: 10,
                        borderLeft: `4px solid ${risk.risk >= 70 ? '#dc2626' : risk.risk >= 50 ? '#ea580c' : '#f59e0b'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Typography.Text strong style={{ fontSize: 13 }}>{risk.name}</Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                            {risk.segment === 'dormant' ? '沉睡客户' : risk.segment === 'active' ? '活跃客户' : '新客'}
                          </Typography.Text>
                        </div>
                        <Tag color={risk.risk >= 70 ? 'red' : risk.risk >= 50 ? 'orange' : 'gold'} style={{ fontSize: 10 }}>
                          流失风险 {risk.risk}%
                        </Tag>
                      </div>
                      <Row gutter={8} style={{ marginTop: 6 }}>
                        <Col span={8}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>最后购买</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{risk.lastPurchase}</Typography.Text>
                        </Col>
                        <Col span={8}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>累计消费</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>${risk.totalSpent}</Typography.Text>
                        </Col>
                        <Col span={8}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>历史订单</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{risk.orders} 单</Typography.Text>
                        </Col>
                      </Row>
                      <div style={{ marginTop: 6, padding: '6px 10px', background: '#fff7ed', borderRadius: 6 }}>
                        <Typography.Text type="warning" style={{ fontSize: 11 }}>
                          <WarningOutlined style={{ marginRight: 4, fontSize: 10 }} />
                          {risk.reason}
                        </Typography.Text>
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                        <Button size="small" type="primary" ghost style={{ fontSize: 10 }}>发送挽留券</Button>
                        <Button size="small" style={{ fontSize: 10 }}>查看详情</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            }
          ]}
        />
      </Modal>

    </>
  );
}
