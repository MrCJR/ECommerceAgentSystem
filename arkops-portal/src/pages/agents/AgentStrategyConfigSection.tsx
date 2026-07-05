import { PlusOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Input, InputNumber, Row, Select, Space, Switch, Tag, Typography, Upload, message } from 'antd';
import { agentsApi } from '../../api/agents';
import { useI18n } from '../../app/i18n';
import type { AgentConfig } from '../../types/domain';

interface AgentStrategyConfigSectionProps {
  agent: AgentConfig;
}

export function AgentStrategyConfigSection({ agent }: AgentStrategyConfigSectionProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  return (
    <>
      {/* 策略配置 */}
      {agent.strategyConfig && (
        <Card title={<><SettingOutlined /> {t('agent.strategyConfig')}</>} style={{ marginBottom: 16 }}>
          {agent.strategyConfig.pricingRule && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.pricingRule')}</Typography.Title>

              {/* 模式选择 */}
              <div style={{ marginBottom: 16 }}>
                <Space size="large">
                  <Typography.Text strong>{t('agent.pricingMode')}:</Typography.Text>
                  <Select
                    value={agent.strategyConfig.pricingRule.mode}
                    style={{ width: 140 }}
                    onChange={(v) => {
                      const pr = agent.strategyConfig!.pricingRule!;
                      pr.mode = v;
                      if (v === 'market') { pr.targetMargin = 30; pr.competitorStrategy = 'match'; }
                      if (v === 'cost') { pr.costMultiplier = 1.5; pr.roundUp = true; }
                      if (v === 'manual') { pr.floorPrice = 0; pr.ceilingPrice = 0; }
                    }}
                    options={[
                      { value: 'market', label: t('agent.pricingMarket') },
                      { value: 'cost', label: t('agent.pricingCost') },
                      { value: 'manual', label: t('agent.pricingManual') },
                    ]}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t(`agent.pricingMode_${agent.strategyConfig.pricingRule.mode}`)}
                  </Typography.Text>
                </Space>
              </div>

              {/* 市场驱动模式 */}
              {agent.strategyConfig.pricingRule.mode === 'market' && (
                <div style={{ padding: '12px 16px', background: 'var(--ark-panel-soft)', borderRadius: 8 }}>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                    {t('agent.pricingMarketDesc')}
                  </Typography.Paragraph>
                  <Space size="large">
                    <Space>
                      <Typography.Text type="secondary">{t('agent.targetMargin')}:</Typography.Text>
                      <InputNumber
                        min={5} max={80} step={5}
                        style={{ width: 80 }}
                        suffix="%"
                        value={agent.strategyConfig.pricingRule.targetMargin}
                        onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.targetMargin = v ?? 30; }}
                      />
                    </Space>
                    <Space>
                      <Typography.Text type="secondary">{t('agent.competeStrategy')}:</Typography.Text>
                      <Select
                        size="small"
                        style={{ width: 120 }}
                        value={agent.strategyConfig.pricingRule.competitorStrategy}
                        onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.competitorStrategy = v; }}
                        options={[
                          { value: 'undercut', label: t('agent.competeUndercut') },
                          { value: 'match', label: t('agent.competeMatch') },
                          { value: 'premium', label: t('agent.competePremium') },
                        ]}
                      />
                    </Space>
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                    {t('agent.pricingMarketNote')}: {t('agent.competitorAgent')}
                  </Typography.Text>
                </div>
              )}

              {/* 成本驱动模式 */}
              {agent.strategyConfig.pricingRule.mode === 'cost' && (
                <div>
                  <div style={{ padding: '12px 16px', background: 'var(--ark-panel-soft)', borderRadius: 8, marginBottom: 12 }}>
                    <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                      {t('agent.pricingCostDesc')}
                    </Typography.Paragraph>
                    <Space size="large" wrap>
                      <Space>
                        <Typography.Text type="secondary">{t('agent.costMultiplier')}:</Typography.Text>
                        <InputNumber
                          min={1} max={5} step={0.1}
                          style={{ width: 70 }}
                          value={agent.strategyConfig.pricingRule.costMultiplier}
                          onChange={(v) => {
                            if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.costMultiplier = v ?? 1.5;
                          }}
                        />
                        <Typography.Text type="secondary">× {t('agent.cost')}</Typography.Text>
                      </Space>
                      <Space>
                        <Typography.Text type="secondary">{t('agent.roundUp')}:</Typography.Text>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.pricingRule.roundUp}
                          onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.roundUp = v; }}
                        />
                      </Space>
                    </Space>
                  </div>
                  {/* 上传进货单 */}
                  <Upload
                    accept=".xlsx,.xls,.csv"
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={(info) => {
                      if (info.fileList.length > 0 && agent.strategyConfig?.pricingRule) {
                        agent.strategyConfig.pricingRule.costFile = info.fileList[0].name;
                      }
                    }}
                  >
                    <Button icon={<PlusOutlined />} size="small">
                      {agent.strategyConfig.pricingRule.costFile
                        ? t('agent.costFileUploaded') + ': ' + agent.strategyConfig.pricingRule.costFile
                        : t('agent.uploadCostFile')}
                    </Button>
                  </Upload>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    {t('agent.uploadCostFileHint')}
                  </Typography.Text>
                </div>
              )}

              {/* 自主定价模式 */}
              {agent.strategyConfig.pricingRule.mode === 'manual' && (
                <div style={{ padding: '12px 16px', background: 'var(--ark-panel-soft)', borderRadius: 8 }}>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                    {t('agent.pricingManualDesc')}
                  </Typography.Paragraph>
                  <Space size="large">
                    <Space>
                      <Typography.Text type="secondary">{t('agent.floorPrice')}:</Typography.Text>
                      <InputNumber
                        min={0} step={1}
                        style={{ width: 100 }}
                        prefix="$"
                        value={agent.strategyConfig.pricingRule.floorPrice}
                        onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.floorPrice = v ?? 0; }}
                      />
                    </Space>
                    <Space>
                      <Typography.Text type="secondary">{t('agent.ceilingPrice')}:</Typography.Text>
                      <InputNumber
                        min={0} step={1}
                        style={{ width: 100 }}
                        prefix="$"
                        value={agent.strategyConfig.pricingRule.ceilingPrice}
                        onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.ceilingPrice = v ?? 0; }}
                      />
                    </Space>
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                    {t('agent.pricingManualNote')}
                  </Typography.Text>
                </div>
              )}
            </div>
          )}

          {agent.strategyConfig.adSpendBudget && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.adSpendBudget')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.adSpendBudgetDesc')}</Typography.Paragraph>
              <Space size="large">
                <Space>
                  <Typography.Text type="secondary">{t('agent.dailyCap')}:</Typography.Text>
                  <InputNumber
                    min={0} step={50}
                    style={{ width: 120 }}
                    prefix="$"
                    value={agent.strategyConfig.adSpendBudget.dailyCap}
                    onChange={(v) => {
                      const sc = agent.strategyConfig!;
                      if (sc.adSpendBudget) {
                        sc.adSpendBudget.dailyCap = v ?? 0;
                        agentsApi.saveStrategyConfig(agent.agentType, {
                          dailyCap: v ?? 0
                        });
                      }
                    }}
                  />
                </Space>
                <Space>
                  <Typography.Text type="secondary">{t('agent.monthlyCap')}:</Typography.Text>
                  <InputNumber
                    min={0} step={500}
                    style={{ width: 120 }}
                    prefix="$"
                    value={agent.strategyConfig.adSpendBudget.monthlyCap}
                    onChange={(v) => {
                      const sc = agent.strategyConfig!;
                      if (sc.adSpendBudget) sc.adSpendBudget.monthlyCap = v ?? 0;
                    }}
                  />
                </Space>
              </Space>
            </div>
          )}

          {agent.strategyConfig.seoKeywords && agent.strategyConfig.seoKeywords.keywords.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>{t('agent.seoKeywords')}</Typography.Title>
                <Button size="small" icon={<ReloadOutlined />} onClick={() => {
                  agentsApi.regenerateSeoKeywords(agent.agentType).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['agent', agent.agentType] });
                    message.success(t('agent.seoRegenerated'));
                  });
                }}>{t('agent.reResearch')}</Button>
              </div>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>{t('agent.seoKeywordsDesc')}</Typography.Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.strategyConfig.seoKeywords.keywords.map((kw) => (
                  <Tag key={kw} color="blue">{kw}</Tag>
                ))}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                {t('agent.generatedBy')} {t('agent.competitorAgent')} · {new Date(agent.strategyConfig.seoKeywords.lastGenerated).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography.Text>
            </div>
          )}

          {agent.strategyConfig.targetAudience && agent.strategyConfig.targetAudience.tags.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>{t('agent.targetAudience')}</Typography.Title>
                <Button size="small" icon={<ReloadOutlined />} onClick={() => {
                  agentsApi.regenerateAudience(agent.agentType).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['agent', agent.agentType] });
                    message.success(t('agent.audienceRegenerated'));
                  });
                }}>{t('agent.reResearch')}</Button>
              </div>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>{t('agent.targetAudienceDesc')}</Typography.Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.strategyConfig.targetAudience.tags.map((tag) => (
                  <Tag key={tag} color="purple">{tag}</Tag>
                ))}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                {t('agent.generatedBy')} {t('agent.competitorAgent')} · {new Date(agent.strategyConfig.targetAudience.lastGenerated).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography.Text>
            </div>
          )}

          {agent.strategyConfig.crmConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.crmDiscountCap')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.crmConfigDesc')}</Typography.Paragraph>
              <Space size="large">
                <Space>
                  <Typography.Text type="secondary">{t('agent.crmDiscountCap')}:</Typography.Text>
                  <InputNumber
                    min={0} max={100} step={5}
                    style={{ width: 80 }}
                    value={agent.strategyConfig.crmConfig.discountCap}
                    onChange={(v) => { if (agent.strategyConfig?.crmConfig) agent.strategyConfig.crmConfig.discountCap = v ?? 20; }}
                    suffix="%"
                  />
                </Space>
                <Space>
                  <Typography.Text type="secondary">{t('agent.crmSegmentCount')}:</Typography.Text>
                  <InputNumber
                    min={1} max={10} step={1}
                    style={{ width: 80 }}
                    value={agent.strategyConfig.crmConfig.segmentCount}
                    onChange={(v) => { if (agent.strategyConfig?.crmConfig) agent.strategyConfig.crmConfig.segmentCount = v ?? 3; }}
                  />
                </Space>
              </Space>
            </div>
          )}

          {agent.strategyConfig.afterSalesConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.afterSalesRefundCap')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.afterSalesConfigDesc')}</Typography.Paragraph>
              <Space size="large">
                <Space>
                  <Typography.Text type="secondary">{t('agent.afterSalesRefundCap')}:</Typography.Text>
                  <InputNumber
                    min={0} step={5}
                    style={{ width: 100 }}
                    prefix="$"
                    value={agent.strategyConfig.afterSalesConfig.autoRefundCap}
                    onChange={(v) => { if (agent.strategyConfig?.afterSalesConfig) agent.strategyConfig.afterSalesConfig.autoRefundCap = v ?? 20; }}
                  />
                  <Typography.Text type="secondary">{t('agent.afterSalesRefundCapUnit')}</Typography.Text>
                </Space>
              </Space>
              <div style={{ marginTop: 8 }}>
                <Typography.Text type="secondary">{t('agent.afterSalesReturnAddr')}:</Typography.Text>
                <Input
                  style={{ width: 280, marginLeft: 8 }}
                  size="small"
                  placeholder={t('agent.afterSalesReturnAddrPlaceholder')}
                  value={agent.strategyConfig.afterSalesConfig.returnAddress}
                  onChange={(e) => { if (agent.strategyConfig?.afterSalesConfig) agent.strategyConfig.afterSalesConfig.returnAddress = e.target.value; }}
                />
              </div>
            </div>
          )}

          {agent.strategyConfig.creativeConfig && (
            <div style={{ marginBottom: 8 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.creativeSizes')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.creativeConfigDesc')}</Typography.Paragraph>
              <Space size="large">
                <Space>
                  <Typography.Text type="secondary">{t('agent.creativeSizes')}:</Typography.Text>
                  <Input
                    style={{ width: 180 }}
                    size="small"
                    placeholder="1:1,16:9,9:16"
                    value={agent.strategyConfig.creativeConfig.outputSizes}
                    onChange={(e) => { if (agent.strategyConfig?.creativeConfig) agent.strategyConfig.creativeConfig.outputSizes = e.target.value; }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.creativeSizesDesc')}</Typography.Text>
                </Space>
              </Space>
              <Space style={{ marginTop: 8 }}>
                <Typography.Text type="secondary">{t('agent.creativeTone')}:</Typography.Text>
                <Select
                  size="small"
                  style={{ width: 120 }}
                  value={agent.strategyConfig.creativeConfig.copyTone}
                  onChange={(v) => { if (agent.strategyConfig?.creativeConfig) agent.strategyConfig.creativeConfig.copyTone = v; }}
                  options={[
                    { value: '简洁卖点', label: '简洁卖点' },
                    { value: '促销感', label: '促销感' },
                    { value: '高端品牌', label: '高端品牌' },
                    { value: '年轻潮流', label: '年轻潮流' }
                  ]}
                />
              </Space>
            </div>
          )}

          {agent.strategyConfig.riskControlConfig && (
            <div>
              <Typography.Title level={5} style={{ marginBottom: 12 }}>{t('agent.riskControlTitle')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>{t('agent.riskControlDesc')}</Typography.Paragraph>

              <Row gutter={[24, 16]}>
                {/* 法规合规 */}
                <Col span={8}>
                  <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>{t('agent.riskCompliance')}</Typography.Text>}
                    style={{ background: 'var(--ark-panel-soft)' }}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.compliance.adLawFilter}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.compliance.adLawFilter = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskAdLaw')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.compliance.platformRuleCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.compliance.platformRuleCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskPlatformRule')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.compliance.falseClaimDetection}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.compliance.falseClaimDetection = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskFalseClaim')}</Typography.Text>
                      </Space>
                    </Space>
                  </Card>
                </Col>

                {/* 行为监控 */}
                <Col span={8}>
                  <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>{t('agent.riskBehavior')}</Typography.Text>}
                    style={{ background: 'var(--ark-panel-soft)' }}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, width: 60 }}>{t('agent.riskRoiFloor')}:</Typography.Text>
                        <InputNumber
                          size="small" min={0} step={0.1}
                          style={{ width: 70 }}
                          value={agent.strategyConfig.riskControlConfig.behavior.roiFloorThreshold}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.behavior.roiFloorThreshold = v ?? 1.2; }}
                        />
                      </Space>
                      <Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, width: 60 }}>{t('agent.riskFreqLimit')}:</Typography.Text>
                        <InputNumber
                          size="small" min={1} max={100} step={1}
                          style={{ width: 70 }}
                          suffix="次/分"
                          value={agent.strategyConfig.riskControlConfig.behavior.actionFrequencyLimit}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.behavior.actionFrequencyLimit = v ?? 10; }}
                        />
                      </Space>
                      <Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, width: 60 }}>{t('agent.riskPriceDev')}:</Typography.Text>
                        <InputNumber
                          size="small" min={5} max={100} step={5}
                          style={{ width: 70 }}
                          suffix="%"
                          value={agent.strategyConfig.riskControlConfig.behavior.priceDeviationPercent}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.behavior.priceDeviationPercent = v ?? 30; }}
                        />
                      </Space>
                    </Space>
                  </Card>
                </Col>

                {/* 业务保护 */}
                <Col span={8}>
                  <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>{t('agent.riskBusiness')}</Typography.Text>}
                    style={{ background: 'var(--ark-panel-soft)' }}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, width: 72 }}>{t('agent.riskMinPrice')}:</Typography.Text>
                        <InputNumber
                          size="small" min={0} max={2} step={0.05}
                          style={{ width: 70 }}
                          suffix="×成本"
                          value={agent.strategyConfig.riskControlConfig.business.minPriceRatio}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.minPriceRatio = v ?? 0.8; }}
                        />
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.business.categoryMatchCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.categoryMatchCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskCategory')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.business.imageComplianceCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.imageComplianceCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskImage')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.business.inventorySafetyCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.inventorySafetyCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskInventory')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.business.negativeReviewSurgeCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.negativeReviewSurgeCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskReviewSurge')}</Typography.Text>
                      </Space>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

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
        </Card>
      )}


    </>
  );
}
