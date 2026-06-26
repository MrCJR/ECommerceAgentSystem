import { ExperimentOutlined, QuestionCircleOutlined, ShopOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Steps, Tag, Timeline, Typography } from 'antd';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';

export function UsageGuideSettingsPage() {
  const { t } = useI18n();

  return (
    <div className="page-stack">
      <PageHeader
        title={t('settings.guideTitle')}
        description={t('settings.guideDescription')}
      />

      {/* 产品简介 */}
      <Card>
        <Typography.Title level={4}>{t('guide.whatIsArkops')}</Typography.Title>
        <Typography.Paragraph>{t('guide.whatIsArkopsDesc')}</Typography.Paragraph>
      </Card>

      {/* 快速开始 */}
      <Card title={<><ThunderboltOutlined /> {t('guide.quickstart')}</>}>
        <Steps
          direction="vertical"
          size="small"
          current={-1}
          items={[
            {
              title: <Typography.Text strong>{t('guide.step1Title')}</Typography.Text>,
              description: t('guide.step1Desc'),
              icon: <ShopOutlined />
            },
            {
              title: <Typography.Text strong>{t('guide.step2Title')}</Typography.Text>,
              description: t('guide.step2Desc'),
              icon: <ExperimentOutlined />
            },
            {
              title: <Typography.Text strong>{t('guide.step3Title')}</Typography.Text>,
              description: t('guide.step3Desc'),
            },
            {
              title: <Typography.Text strong>{t('guide.step4Title')}</Typography.Text>,
              description: t('guide.step4Desc'),
            }
          ]}
        />
      </Card>

      {/* Agent 运行流程 */}
      <Card title={t('guide.agentFlow')}>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {t('guide.agentFlowDesc')}
        </Typography.Paragraph>

        <Timeline
          items={[
            { color: 'red', children: <><Tag color="red">{t('agent.layer_foundation')}</Tag> {t('guide.flowLayer1')}</> },
            { color: 'purple', children: <><Tag color="purple">{t('agent.layer_support')}</Tag> {t('guide.flowLayer2')}</> },
            { color: 'blue', children: <><Tag color="blue">{t('agent.layer_traffic')}</Tag> {t('guide.flowLayer3')}</> },
            { color: 'green', children: <><Tag color="green">{t('agent.layer_growth')}</Tag> {t('guide.flowLayer4')}</> },
            { color: 'orange', children: <><Tag color="orange">{t('agent.layer_standalone')}</Tag> {t('guide.flowLayer5')}</> },
          ]}
        />
      </Card>

      {/* 核心概念 */}
      <Card title={<><QuestionCircleOutlined /> {t('guide.keyConcepts')}</>}>
        <Typography.Paragraph style={{ marginBottom: 4 }}>
          <Typography.Text strong>{t('guide.conceptRequired')}:</Typography.Text> {t('guide.conceptRequiredDesc')}
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 4 }}>
          <Typography.Text strong>{t('guide.conceptDependency')}:</Typography.Text> {t('guide.conceptDependencyDesc')}
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 4 }}>
          <Typography.Text strong>{t('guide.conceptRiskControl')}:</Typography.Text> {t('guide.conceptRiskControlDesc')}
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 4 }}>
          <Typography.Text strong>{t('guide.conceptPricing')}:</Typography.Text> {t('guide.conceptPricingDesc')}
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>{t('guide.conceptApproval')}:</Typography.Text> {t('guide.conceptApprovalDesc')}
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
