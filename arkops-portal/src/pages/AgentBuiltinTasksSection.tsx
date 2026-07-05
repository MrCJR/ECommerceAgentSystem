import {
  BankOutlined,
  BellOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  CustomerServiceOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  FileSearchOutlined,
  FireOutlined,
  GiftOutlined,
  GlobalOutlined,
  LineChartOutlined,
  PictureOutlined,
  PushpinOutlined,
  RadarChartOutlined,
  SafetyOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  SkinOutlined,
  SmileOutlined,
  StarOutlined,
  StopOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  WalletOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Tag, Typography } from 'antd';
import { useI18n } from '../app/i18n';
import type { AgentType } from '../types/domain';

interface AgentBuiltinTasksSectionProps {
  agentType: AgentType;
  onOpenAdDashboard: () => void;
  onOpenCrmModal: () => void;
  onOpenReviewModal: () => void;
  onOpenCsModal: () => void;
  onOpenCreativeModal: () => void;
  onOpenRiskModal: () => void;
  onOpenLiveModal: () => void;
}

export function AgentBuiltinTasksSection({
  agentType,
  onOpenAdDashboard,
  onOpenCrmModal,
  onOpenReviewModal,
  onOpenCsModal,
  onOpenCreativeModal,
  onOpenRiskModal,
  onOpenLiveModal
}: AgentBuiltinTasksSectionProps) {
  const { t } = useI18n();
  const isLoginBootstrap = agentType === 'login_bootstrap';
  const isCompetitorIntel = agentType === 'competitor_intel';
  const isProductLaunch = agentType === 'product_launch';
  const isAdsOptimizer = agentType === 'ads_optimizer';
  const isPricingStrategy = agentType === 'pricing_strategy';
  const isCrmRetention = agentType === 'crm_retention';
  const isReviewManager = agentType === 'review_manager';
  const isCustomerService = agentType === 'customer_service';
  const isAfterSales = agentType === 'after_sales';
  const isCreativeFactory = agentType === 'creative_factory';
  const isInventoryAlert = agentType === 'inventory_alert';
  const isRiskControl = agentType === 'risk_control';
  const isFinanceAudit = agentType === 'finance_audit';
  const isPromotionCampaign = agentType === 'promotion_campaign';
  const isLiveStreamOps = agentType === 'live_stream_ops';

  return (
    <>
      {/* 定价策略：内置任务卡片 */}
      {isPricingStrategy && (
        <Card title={<><DollarOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EyeOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.priceScan')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.priceScanDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ToolOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.dynamicPrice')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.dynamicPriceDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.floorProtect')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.floorProtectDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 店铺保活：内置任务卡片 */}
      {isLoginBootstrap && (
        <Card
          title={<><UnorderedListOutlined /> {t('agent.builtinTasks')}</>}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card
                size="small"
                style={{ background: 'var(--ark-panel-soft)' }}
              >
                <div>
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    <CheckCircleOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                    {t('agent.sessionCheckTask')}
                  </Typography.Text>
                  <Typography.Paragraph type="secondary" className="agent-task-desc">
                    {t('agent.sessionCheckTaskDesc')}
                  </Typography.Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                size="small"
                style={{ background: 'var(--ark-panel-soft)' }}
              >
                <div>
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    <BellOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                    {t('agent.sessionFailedTask')}
                  </Typography.Text>
                  <Typography.Paragraph type="secondary" className="agent-task-desc">
                    {t('agent.sessionFailedTaskDesc')}
                  </Typography.Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <GlobalOutlined style={{ color: '#7c3aed', marginRight: 6 }} />
                  {t('agent.bulkPatrol')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.bulkPatrolDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 市场情报：内置任务卡片 */}
      {isCompetitorIntel && (
        <Card
          title={<><RadarChartOutlined /> {t('agent.builtinTasks')}</>}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EyeOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.passiveCompetitorMonitor')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.passiveCompetitorMonitorDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SearchOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.productResearch')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.productResearchDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <GlobalOutlined style={{ color: '#7c3aed', marginRight: 6 }} />
                  {t('agent.trendMonitor')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.trendMonitorDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 商品上架：内置任务卡片 */}
      {isProductLaunch && (
        <Card title={<><CameraOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <div>
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    <CameraOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                    {t('agent.imageRecognition')}
                  </Typography.Text>
                  <Typography.Paragraph type="secondary" className="agent-task-desc">
                    {t('agent.imageRecognitionDesc')}
                  </Typography.Paragraph>
                </div>
                <Tag color="orange" className="agent-task-tag">{t('agent.active')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EditOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.draftGeneration')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.draftGenerationDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SafetyOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.complianceCheck')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.complianceCheckDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 广告投放：内置任务卡片 */}
      {isAdsOptimizer && (
        <Card title={<><ThunderboltOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" hoverable className="agent-task-card-clickable" onClick={() => onOpenAdDashboard()}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <LineChartOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.roiPatrol')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.roiPatrolDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ToolOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.budgetOptimize')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.budgetOptimizeDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <FireOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.abTest')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.abTestDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* CRM 复购：内置任务卡片 */}
      {isCrmRetention && (
        <Card title={<><GiftOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" hoverable className="agent-task-card-clickable" onClick={() => onOpenCrmModal()}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SkinOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.segmentRefresh')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.segmentRefreshDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <GiftOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.couponSend')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.couponSendDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.churnPredict')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.churnPredictDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <CrownOutlined style={{ color: '#f59e0b', marginRight: 6 }} />
                  {t('agent.vipCare')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.vipCareDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 评价管理：内置任务卡片 */}
      {isReviewManager && (
        <Card title={<><StarOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" hoverable className="agent-task-card-clickable" onClick={() => onOpenReviewModal()}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                  {t('agent.negativeMonitor')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.negativeMonitorDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EditOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.autoReply')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.autoReplyDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SmileOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.reviewInvite')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.reviewInviteDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 客服消息：内置任务卡片 */}
      {isCustomerService && (
        <Card title={<><CustomerServiceOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" hoverable className="agent-task-card-clickable" onClick={() => onOpenCsModal()}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SmileOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.smartReply')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.smartReplyDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.escalateHuman')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.escalateHumanDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SearchOutlined style={{ color: '#7c3aed', marginRight: 6 }} />
                  {t('agent.faqLearn')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.faqLearnDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 售后处理：内置任务卡片 */}
      {isAfterSales && (
        <Card title={<><ToolOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <FileSearchOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.returnAudit')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.returnAuditDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WalletOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.refundProcess')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.refundProcessDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ShoppingCartOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.logisticsTrack')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.logisticsTrackDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 素材工厂：内置任务卡片 */}
      {isCreativeFactory && (
        <Card title={<><PictureOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card hoverable size="small" className="agent-task-card-clickable" onClick={() => onOpenCreativeModal()}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <PictureOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.imageGen')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.imageGenDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <CameraOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.videoGen')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.videoGenDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EditOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.copyGen')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.copyGenDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 库存预警：内置任务卡片 */}
      {isInventoryAlert && (
        <Card title={<><ShoppingCartOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                  {t('agent.lowStockAlert')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.lowStockAlertDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <StopOutlined style={{ color: '#64748b', marginRight: 6 }} />
                  {t('agent.deadStock')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.deadStockDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ShoppingCartOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.replenish')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.replenishDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 风险控制：内置任务卡片 */}
      {isRiskControl && (
        <Card title={<><SafetyOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card hoverable size="small" className="agent-task-card-clickable" onClick={() => onOpenRiskModal()}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <FileSearchOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.complianceScan')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.complianceScanDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EyeOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.behaviorMonitor')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.behaviorMonitorDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <StopOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                  {t('agent.circuitBreaker')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.circuitBreakerDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 财务对账：内置任务卡片 */}
      {isFinanceAudit && (
        <Card title={<><BankOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <FileSearchOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.monthlyReconcile')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.monthlyReconcileDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.discrepancyMark')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.discrepancyMarkDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EditOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.reportGen')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.reportGenDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 促销活动：内置任务卡片 */}
      {isPromotionCampaign && (
        <Card title={<><GiftOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ThunderboltOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                  {t('agent.flashSaleSetup')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.flashSaleSetupDesc')}
                </Typography.Paragraph>
                <Tag color="orange" className="agent-task-tag">{t('agent.active')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <DollarOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.couponCampaign')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.couponCampaignDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ShoppingCartOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.bundleDeal')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.bundleDealDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 直播运营：内置任务卡片 */}
      {isLiveStreamOps && (
        <Card title={<><CustomerServiceOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card hoverable size="small" className="agent-task-card-clickable" onClick={() => onOpenLiveModal()}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <UnorderedListOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.liveSchedule')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.liveScheduleDesc')}
                </Typography.Paragraph>
                <Tag color="purple" className="agent-task-tag">{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <PushpinOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.productPinning')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.productPinningDesc')}
                </Typography.Paragraph>
                <Tag color="green" className="agent-task-tag">{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" className="agent-task-card">
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <LineChartOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.liveMetrics')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" className="agent-task-desc">
                  {t('agent.liveMetricsDesc')}
                </Typography.Paragraph>
                <Tag color="blue" className="agent-task-tag">{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}
    </>
  );
}
