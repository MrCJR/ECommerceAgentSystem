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

interface CrmRetentionModalProps {
  crmOpen: boolean;
  onCloseCrm: () => void;
}

export function CrmRetentionModal(props: CrmRetentionModalProps) {
  const { t } = useI18n();
  const { crmOpen, onCloseCrm } = props;

  return (
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
  );
}
