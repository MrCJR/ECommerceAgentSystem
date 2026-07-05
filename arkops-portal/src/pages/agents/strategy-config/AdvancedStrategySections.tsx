import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Input, InputNumber, Row, Select, Space, Switch, Tag, Typography, Upload, message } from 'antd';
import { agentsApi } from '../../../api/agents';
import { useI18n } from '../../../app/i18n';
import type { AgentConfig } from '../../../types/domain';

type AgentWithStrategyConfig = AgentConfig & { strategyConfig: NonNullable<AgentConfig['strategyConfig']> };

interface AdvancedStrategySectionsProps {
  agent: AgentWithStrategyConfig;
}

export function AdvancedStrategySections({ agent }: AdvancedStrategySectionsProps) {
  const { t } = useI18n();

  return (
    <>
          {/* 库存预警配置 */}
          {agent.strategyConfig.inventoryConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.inventoryConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.inventoryConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.lowStockThreshold')}:</Typography.Text>
                    <InputNumber
                      min={1} max={9999} step={10}
                      style={{ width: 100 }}
                      value={agent.strategyConfig.inventoryConfig.lowStockThreshold}
                      onChange={(v) => { if (agent.strategyConfig?.inventoryConfig) agent.strategyConfig.inventoryConfig.lowStockThreshold = v ?? 50; }}
                      suffix={t('common.items')}
                    />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.deadStockDays')}:</Typography.Text>
                    <InputNumber
                      min={7} max={365} step={7}
                      style={{ width: 100 }}
                      value={agent.strategyConfig.inventoryConfig.deadStockDays}
                      onChange={(v) => { if (agent.strategyConfig?.inventoryConfig) agent.strategyConfig.inventoryConfig.deadStockDays = v ?? 30; }}
                      suffix={t('common.day')}
                    />
                  </Space>
                </Space>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.autoReplenish')}:</Typography.Text>
                    <Switch
                      checked={agent.strategyConfig.inventoryConfig.autoReplenishEnabled}
                      onChange={(v) => { if (agent.strategyConfig?.inventoryConfig) agent.strategyConfig.inventoryConfig.autoReplenishEnabled = v; }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.autoReplenishDesc')}</Typography.Text>
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.replenishLeadTime')}:</Typography.Text>
                    <InputNumber
                      min={1} max={60} step={1}
                      style={{ width: 80 }}
                      value={agent.strategyConfig.inventoryConfig.replenishLeadTimeDays}
                      onChange={(v) => { if (agent.strategyConfig?.inventoryConfig) agent.strategyConfig.inventoryConfig.replenishLeadTimeDays = v ?? 7; }}
                      suffix={t('common.day')}
                    />
                  </Space>
                </Space>
              </Space>
            </div>
          )}

          {/* 市场情报配置 */}
          {agent.strategyConfig.intelConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.intelConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.intelConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space>
                  <Typography.Text type="secondary">{t('agent.monitorFrequency')}:</Typography.Text>
                  <InputNumber
                    min={1} max={168} step={1}
                    style={{ width: 100 }}
                    value={agent.strategyConfig.intelConfig.monitorFrequencyHours}
                    onChange={(v) => { if (agent.strategyConfig?.intelConfig) agent.strategyConfig.intelConfig.monitorFrequencyHours = v ?? 2; }}
                    suffix={t('agent.monitorFrequencyUnit')}
                  />
                </Space>
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{t('agent.monitoredCategories')}:</Typography.Text>
                  <Input
                    style={{ maxWidth: 400 }}
                    placeholder={t('agent.monitoredCategoriesDesc')}
                    value={agent.strategyConfig.intelConfig.monitoredCategories.join('，')}
                    onChange={(e) => { if (agent.strategyConfig?.intelConfig) agent.strategyConfig.intelConfig.monitoredCategories = e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean); }}
                  />
                </div>
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{t('agent.competitorUrls')}:</Typography.Text>
                  <Input.TextArea
                    style={{ maxWidth: 400 }}
                    rows={3}
                    placeholder={t('agent.competitorUrlsDesc')}
                    value={agent.strategyConfig.intelConfig.competitorUrls.join('\n')}
                    onChange={(e) => { if (agent.strategyConfig?.intelConfig) agent.strategyConfig.intelConfig.competitorUrls = e.target.value.split('\n').filter(Boolean); }}
                  />
                </div>
              </Space>
            </div>
          )}

          {/* 财务对账配置 */}
          {agent.strategyConfig.financeConfig && (
            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.financeConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.financeConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.autoReconcileDay')}:</Typography.Text>
                    <InputNumber
                      min={1} max={28} step={1}
                      style={{ width: 80 }}
                      value={agent.strategyConfig.financeConfig.autoReconcileDay}
                      onChange={(v) => { if (agent.strategyConfig?.financeConfig) agent.strategyConfig.financeConfig.autoReconcileDay = v ?? 5; }}
                      suffix={t('agent.autoReconcileDayUnit')}
                    />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.discrepancyAlert')}:</Typography.Text>
                    <InputNumber
                      min={1} step={10}
                      style={{ width: 120 }}
                      prefix="$"
                      value={agent.strategyConfig.financeConfig.discrepancyAlertThreshold}
                      onChange={(v) => { if (agent.strategyConfig?.financeConfig) agent.strategyConfig.financeConfig.discrepancyAlertThreshold = v ?? 100; }}
                    />
                  </Space>
                </Space>
                <Space>
                  <Typography.Text type="secondary">{t('agent.autoGenReport')}:</Typography.Text>
                  <Switch
                    checked={agent.strategyConfig.financeConfig.autoGenerateReport}
                    onChange={(v) => { if (agent.strategyConfig?.financeConfig) agent.strategyConfig.financeConfig.autoGenerateReport = v; }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.autoGenReportDesc')}</Typography.Text>
                </Space>
              </Space>
            </div>
          )}

          {/* 促销活动配置 */}
          {agent.strategyConfig.promotionConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.promotionConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.promotionConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.maxDiscount')}:</Typography.Text>
                    <InputNumber
                      min={1} max={90} step={5}
                      style={{ width: 80 }}
                      suffix="%"
                      value={agent.strategyConfig.promotionConfig.maxDiscountPercent}
                      onChange={(v) => { if (agent.strategyConfig?.promotionConfig) agent.strategyConfig.promotionConfig.maxDiscountPercent = v ?? 50; }}
                    />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.campaignBudget')}:</Typography.Text>
                    <InputNumber
                      min={100} step={100}
                      style={{ width: 120 }}
                      prefix="$"
                      value={agent.strategyConfig.promotionConfig.campaignBudget}
                      onChange={(v) => { if (agent.strategyConfig?.promotionConfig) agent.strategyConfig.promotionConfig.campaignBudget = v ?? 2000; }}
                    />
                  </Space>
                </Space>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.autoSchedule')}:</Typography.Text>
                    <Switch
                      checked={agent.strategyConfig.promotionConfig.autoSchedule}
                      onChange={(v) => { if (agent.strategyConfig?.promotionConfig) agent.strategyConfig.promotionConfig.autoSchedule = v; }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.autoScheduleDesc')}</Typography.Text>
                  </Space>
                </Space>
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{t('agent.targetPlatforms')}:</Typography.Text>
                  <Input
                    style={{ maxWidth: 400 }}
                    value={agent.strategyConfig.promotionConfig.targetPlatforms.join('，')}
                    onChange={(e) => { if (agent.strategyConfig?.promotionConfig) agent.strategyConfig.promotionConfig.targetPlatforms = e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean); }}
                  />
                </div>
              </Space>
            </div>
          )}

          {/* 直播运营配置 */}
          {agent.strategyConfig.liveStreamConfig && (
            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.liveStreamConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.liveStreamConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.autoPinProducts')}:</Typography.Text>
                    <Switch
                      checked={agent.strategyConfig.liveStreamConfig.autoPinProducts}
                      onChange={(v) => { if (agent.strategyConfig?.liveStreamConfig) agent.strategyConfig.liveStreamConfig.autoPinProducts = v; }}
                    />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.peakHourBoost')}:</Typography.Text>
                    <Switch
                      checked={agent.strategyConfig.liveStreamConfig.peakHourBoost}
                      onChange={(v) => { if (agent.strategyConfig?.liveStreamConfig) agent.strategyConfig.liveStreamConfig.peakHourBoost = v; }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.peakHourBoostDesc')}</Typography.Text>
                  </Space>
                </Space>
                <Space>
                  <Typography.Text type="secondary">{t('agent.performanceAlert')}:</Typography.Text>
                  <InputNumber
                    min={50} max={10000} step={50}
                    style={{ width: 120 }}
                    suffix={t('agent.performanceAlertUnit')}
                    value={agent.strategyConfig.liveStreamConfig.performanceAlertThreshold}
                    onChange={(v) => { if (agent.strategyConfig?.liveStreamConfig) agent.strategyConfig.liveStreamConfig.performanceAlertThreshold = v ?? 500; }}
                  />
                </Space>
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{t('agent.replyTemplate')}:</Typography.Text>
                  <Input.TextArea
                    style={{ maxWidth: 400 }}
                    rows={2}
                    placeholder={t('agent.replyTemplateDesc')}
                    value={agent.strategyConfig.liveStreamConfig.replyTemplate}
                    onChange={(e) => { if (agent.strategyConfig?.liveStreamConfig) agent.strategyConfig.liveStreamConfig.replyTemplate = e.target.value; }}
                  />
                </div>
              </Space>
            </div>
          )}
    </>
  );
}
