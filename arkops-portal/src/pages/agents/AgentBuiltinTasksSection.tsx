import {
  AppstoreOutlined,
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
import { AgentTaskGrid, type AgentTaskDefinition } from '../../components/agents/AgentTaskCard';
import { useI18n } from '../../app/i18n';
import type { AgentType } from '../../types/domain';
import { message } from 'antd';

interface AgentBuiltinTasksSectionProps {
  agentType: AgentType;
  onOpenAdDashboard: () => void;
  onOpenCrmModal: () => void;
  onOpenReviewModal: () => void;
  onOpenCsModal: () => void;
  onOpenCreativeModal: () => void;
  onOpenRiskModal: () => void;
  onOpenLiveModal: () => void;
  onOpenABTest: () => void;
  onOpenSessionStatus: () => void;
  onOpenCompetitorIntel: () => void;
  onOpenAfterSales: () => void;
  onOpenPromotion: () => void;
  onOpenInventory: () => void;
  onOpenFinanceAudit: () => void;
  onOpenPricing: () => void;
  onOpenProductDraft: () => void;
}

interface AgentTaskSectionConfig {
  titleIcon: JSX.Element;
  mdSpan?: number;
  smSpan?: number;
  tasks: AgentTaskDefinition[];
}

const taskIconStyle = (color: string) => ({ color, marginRight: 6 });

export function AgentBuiltinTasksSection({
  agentType,
  onOpenAdDashboard,
  onOpenCrmModal,
  onOpenReviewModal,
  onOpenCsModal,
  onOpenCreativeModal,
  onOpenRiskModal,
  onOpenLiveModal,
  onOpenABTest,
  onOpenSessionStatus,
  onOpenCompetitorIntel,
  onOpenAfterSales,
  onOpenPromotion,
  onOpenInventory,
  onOpenFinanceAudit,
  onOpenPricing,
  onOpenProductDraft,
}: AgentBuiltinTasksSectionProps) {
  const { t } = useI18n();

  const task = (
    icon: JSX.Element,
    titleKey: string,
    descriptionKey: string,
    tagKey?: string,
    tagColor?: string,
    onClick?: () => void
  ): AgentTaskDefinition => ({
    icon,
    title: t(`agent.${titleKey}`),
    description: t(`agent.${descriptionKey}`),
    tag: tagKey ? t(`agent.${tagKey}`) : undefined,
    tagColor,
    onClick
  });

  const comingSoon = () => () => message.info(t('agent.taskComingSoon'));
  const autoMode = () => () => message.info(t('agent.taskAutoMode'));

  const sections: Partial<Record<AgentType, AgentTaskSectionConfig>> = {
    pricing_strategy: {
      titleIcon: <DollarOutlined />,
      tasks: [
        task(<EyeOutlined style={taskIconStyle('#2563eb')} />, 'priceScan', 'priceScanDesc', 'scheduled', 'purple', onOpenPricing),
        task(<ToolOutlined style={taskIconStyle('#16a34a')} />, 'dynamicPrice', 'dynamicPriceDesc', 'auto', 'green', onOpenPricing),
        task(<WarningOutlined style={taskIconStyle('#ea580c')} />, 'floorProtect', 'floorProtectDesc', 'scheduled', 'purple', onOpenPricing)
      ]
    },
    login_bootstrap: {
      titleIcon: <UnorderedListOutlined />,
      smSpan: 12,
      tasks: [
        task(<CheckCircleOutlined style={taskIconStyle('#2563eb')} />, 'sessionCheckTask', 'sessionCheckTaskDesc', undefined, undefined, onOpenSessionStatus),
        task(<BellOutlined style={taskIconStyle('#ea580c')} />, 'sessionFailedTask', 'sessionFailedTaskDesc', undefined, undefined, onOpenSessionStatus),
        task(<GlobalOutlined style={taskIconStyle('#7c3aed')} />, 'bulkPatrol', 'bulkPatrolDesc', 'scheduled', 'purple', onOpenSessionStatus)
      ]
    },
    competitor_intel: {
      titleIcon: <RadarChartOutlined />,
      tasks: [
        task(<EyeOutlined style={taskIconStyle('#2563eb')} />, 'passiveCompetitorMonitor', 'passiveCompetitorMonitorDesc', 'passive', 'blue', onOpenCompetitorIntel),
        task(<SearchOutlined style={taskIconStyle('#16a34a')} />, 'productResearch', 'productResearchDesc', 'passive', 'blue', onOpenCompetitorIntel),
        task(<GlobalOutlined style={taskIconStyle('#7c3aed')} />, 'trendMonitor', 'trendMonitorDesc', 'passive', 'blue', onOpenCompetitorIntel)
      ]
    },
    product_launch: {
      titleIcon: <CameraOutlined />,
      tasks: [
        task(<CameraOutlined style={taskIconStyle('#2563eb')} />, 'imageRecognition', 'imageRecognitionDesc', 'active', 'orange', onOpenProductDraft),
        task(<EditOutlined style={taskIconStyle('#16a34a')} />, 'draftGeneration', 'draftGenerationDesc', 'passive', 'blue', onOpenProductDraft),
        task(<SafetyOutlined style={taskIconStyle('#ea580c')} />, 'complianceCheck', 'complianceCheckDesc', 'auto', 'green', onOpenProductDraft)
      ]
    },
    ads_optimizer: {
      titleIcon: <ThunderboltOutlined />,
      tasks: [
        task(<LineChartOutlined style={taskIconStyle('#2563eb')} />, 'roiPatrol', 'roiPatrolDesc', 'scheduled', 'purple', onOpenAdDashboard),
        task(<ToolOutlined style={taskIconStyle('#16a34a')} />, 'budgetOptimize', 'budgetOptimizeDesc', 'auto', 'green', onOpenAdDashboard),
        task(<FireOutlined style={taskIconStyle('#ea580c')} />, 'abTest', 'abTestDesc', 'scheduled', 'purple', onOpenABTest)
      ]
    },
    crm_retention: {
      titleIcon: <GiftOutlined />,
      mdSpan: 6,
      smSpan: 12,
      tasks: [
        task(<SkinOutlined style={taskIconStyle('#2563eb')} />, 'segmentRefresh', 'segmentRefreshDesc', 'scheduled', 'purple', onOpenCrmModal),
        task(<GiftOutlined style={taskIconStyle('#16a34a')} />, 'couponSend', 'couponSendDesc', 'auto', 'green', onOpenCrmModal),
        task(<WarningOutlined style={taskIconStyle('#ea580c')} />, 'churnPredict', 'churnPredictDesc', 'scheduled', 'purple', onOpenCrmModal),
        task(<CrownOutlined style={taskIconStyle('#f59e0b')} />, 'vipCare', 'vipCareDesc', 'auto', 'green', onOpenCrmModal)
      ]
    },
    review_manager: {
      titleIcon: <StarOutlined />,
      tasks: [
        task(<WarningOutlined style={taskIconStyle('#dc2626')} />, 'negativeMonitor', 'negativeMonitorDesc', 'scheduled', 'purple', onOpenReviewModal),
        task(<EditOutlined style={taskIconStyle('#16a34a')} />, 'autoReply', 'autoReplyDesc', 'auto', 'green', onOpenReviewModal),
        task(<SmileOutlined style={taskIconStyle('#2563eb')} />, 'reviewInvite', 'reviewInviteDesc', 'scheduled', 'purple', onOpenReviewModal)
      ]
    },
    customer_service: {
      titleIcon: <CustomerServiceOutlined />,
      tasks: [
        task(<SmileOutlined style={taskIconStyle('#16a34a')} />, 'smartReply', 'smartReplyDesc', 'auto', 'green', onOpenCsModal),
        task(<WarningOutlined style={taskIconStyle('#ea580c')} />, 'escalateHuman', 'escalateHumanDesc', 'passive', 'blue', onOpenCsModal),
        task(<SearchOutlined style={taskIconStyle('#7c3aed')} />, 'faqLearn', 'faqLearnDesc', 'passive', 'blue', onOpenCsModal)
      ]
    },
    after_sales: {
      titleIcon: <ToolOutlined />,
      tasks: [
        task(<FileSearchOutlined style={taskIconStyle('#2563eb')} />, 'returnAudit', 'returnAuditDesc', 'auto', 'green', onOpenAfterSales),
        task(<WalletOutlined style={taskIconStyle('#16a34a')} />, 'refundProcess', 'refundProcessDesc', 'auto', 'green', onOpenAfterSales),
        task(<ShoppingCartOutlined style={taskIconStyle('#ea580c')} />, 'logisticsTrack', 'logisticsTrackDesc', 'passive', 'blue', onOpenAfterSales)
      ]
    },
    creative_factory: {
      titleIcon: <PictureOutlined />,
      tasks: [
        task(<PictureOutlined style={taskIconStyle('#2563eb')} />, 'imageGen', 'imageGenDesc', 'auto', 'green', onOpenCreativeModal),
        task(<CameraOutlined style={taskIconStyle('#16a34a')} />, 'videoGen', 'videoGenDesc', 'auto', 'green', onOpenCreativeModal),
        task(<EditOutlined style={taskIconStyle('#ea580c')} />, 'copyGen', 'copyGenDesc', 'scheduled', 'purple', onOpenCreativeModal)
      ]
    },
    inventory_alert: {
      titleIcon: <ShoppingCartOutlined />,
      tasks: [
        task(<WarningOutlined style={taskIconStyle('#dc2626')} />, 'lowStockAlert', 'lowStockAlertDesc', 'scheduled', 'purple', onOpenInventory),
        task(<StopOutlined style={taskIconStyle('#64748b')} />, 'deadStock', 'deadStockDesc', 'scheduled', 'purple', onOpenInventory),
        task(<ShoppingCartOutlined style={taskIconStyle('#16a34a')} />, 'replenish', 'replenishDesc', 'auto', 'green', onOpenInventory)
      ]
    },
    risk_control: {
      titleIcon: <SafetyOutlined />,
      tasks: [
        task(<FileSearchOutlined style={taskIconStyle('#2563eb')} />, 'complianceScan', 'complianceScanDesc', 'scheduled', 'purple', onOpenRiskModal),
        task(<EyeOutlined style={taskIconStyle('#ea580c')} />, 'behaviorMonitor', 'behaviorMonitorDesc', 'passive', 'blue', onOpenRiskModal),
        task(<StopOutlined style={taskIconStyle('#dc2626')} />, 'circuitBreaker', 'circuitBreakerDesc', 'passive', 'blue', onOpenRiskModal)
      ]
    },
    finance_audit: {
      titleIcon: <BankOutlined />,
      tasks: [
        task(<FileSearchOutlined style={taskIconStyle('#2563eb')} />, 'monthlyReconcile', 'monthlyReconcileDesc', 'scheduled', 'purple', onOpenFinanceAudit),
        task(<WarningOutlined style={taskIconStyle('#ea580c')} />, 'discrepancyMark', 'discrepancyMarkDesc', 'auto', 'green', onOpenFinanceAudit),
        task(<EditOutlined style={taskIconStyle('#16a34a')} />, 'reportGen', 'reportGenDesc', 'auto', 'green', onOpenFinanceAudit)
      ]
    },
    promotion_campaign: {
      titleIcon: <GiftOutlined />,
      tasks: [
        task(<ThunderboltOutlined style={taskIconStyle('#dc2626')} />, 'flashSaleSetup', 'flashSaleSetupDesc', 'active', 'orange', onOpenPromotion),
        task(<DollarOutlined style={taskIconStyle('#2563eb')} />, 'couponCampaign', 'couponCampaignDesc', 'scheduled', 'purple', onOpenPromotion),
        task(<ShoppingCartOutlined style={taskIconStyle('#16a34a')} />, 'bundleDeal', 'bundleDealDesc', 'auto', 'green', onOpenPromotion)
      ]
    },
    live_stream_ops: {
      titleIcon: <CustomerServiceOutlined />,
      tasks: [
        task(<UnorderedListOutlined style={taskIconStyle('#2563eb')} />, 'liveSchedule', 'liveScheduleDesc', 'scheduled', 'purple', onOpenLiveModal),
        task(<PushpinOutlined style={taskIconStyle('#ea580c')} />, 'productPinning', 'productPinningDesc', 'auto', 'green', onOpenLiveModal),
        task(<LineChartOutlined style={taskIconStyle('#16a34a')} />, 'liveMetrics', 'liveMetricsDesc', 'passive', 'blue', onOpenLiveModal)
      ]
    }
  };

  const section = sections[agentType];
  if (!section) return null;

  return (
    <AgentTaskGrid
      title={<><AppstoreOutlined /> {t('agent.builtinTasks')}</>}
      tasks={section.tasks}
      mdSpan={section.mdSpan}
      smSpan={section.smSpan}
    />
  );
}
