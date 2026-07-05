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

interface RiskScanModalProps {
  riskOpen: boolean;
  onCloseRisk: () => void;
}

export function RiskScanModal(props: RiskScanModalProps) {
  const { t } = useI18n();
  const { riskOpen, onCloseRisk } = props;

  return (
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
  );
}
