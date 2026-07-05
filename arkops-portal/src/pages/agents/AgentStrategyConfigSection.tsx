import { SettingOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import { useI18n } from '../../app/i18n';
import type { AgentConfig } from '../../types/domain';

type AgentWithStrategyConfig = AgentConfig & { strategyConfig: NonNullable<AgentConfig['strategyConfig']> };
import { AdvancedStrategySections } from './strategy-config/AdvancedStrategySections';
import { BasicStrategySections } from './strategy-config/BasicStrategySections';
import { PricingRuleSection } from './strategy-config/PricingRuleSection';
import { RiskControlSection } from './strategy-config/RiskControlSection';

interface AgentStrategyConfigSectionProps {
  agent: AgentConfig;
}

export function AgentStrategyConfigSection({ agent }: AgentStrategyConfigSectionProps) {
  const { t } = useI18n();

  if (!agent.strategyConfig) return null;

  const strategyAgent = agent as AgentWithStrategyConfig;

  return (
    <Card title={<><SettingOutlined /> {t('agent.strategyConfig')}</>} style={{ marginBottom: 16 }}>
      <PricingRuleSection agent={strategyAgent} />
      <BasicStrategySections agent={strategyAgent} />
      <RiskControlSection agent={strategyAgent} />
      <AdvancedStrategySections agent={strategyAgent} />
    </Card>
  );
}
