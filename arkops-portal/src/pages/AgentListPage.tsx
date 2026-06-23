import { CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, SafetyOutlined, SettingOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Switch, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { agentsApi } from '../api/agents';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { AgentConfig, AgentLayer, AgentType } from '../types/domain';

const layerOrder: AgentLayer[] = ['foundation', 'traffic', 'growth', 'support', 'standalone'];
const layerColors: Record<AgentLayer, string> = {
  foundation: '#dc2626',
  traffic: '#2563eb',
  growth: '#16a34a',
  support: '#7c3aed',
  standalone: '#ea580c'
};

/* ===== Agent 流程节点（见组件内 useI18n 调用） ===== */

export function AgentListPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: agents = [] } = useQuery({ queryKey: ['agents'], queryFn: agentsApi.list });

  const flowNodes = [
    { id: 'login_bootstrap', label: t('agent.login_bootstrap'), layer: 'foundation' as const, w: 80 },
    { id: 'competitor_intel', label: t('agent.competitor_intel'), layer: 'support' as const, w: 80 },
    { id: 'product_launch', label: t('agent.product_launch'), layer: 'foundation' as const, w: 80 },
    { id: 'creative_factory', label: t('agent.creative_factory'), layer: 'support' as const, w: 80 },
    { id: 'ads_optimizer', label: t('agent.ads_optimizer'), layer: 'traffic' as const, w: 80 },
    { id: 'pricing_strategy', label: t('agent.pricing_strategy'), layer: 'traffic' as const, w: 80 },
  ];

  const growthSubLabels = [
    t('agent.crm_retention'),
    t('agent.review_manager'),
    t('agent.customer_service'),
    t('agent.after_sales')
  ];

  const toggleMutation = useMutation({
    mutationFn: (agentType: AgentType) => agentsApi.toggle(agentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      message.success(t('agent.toggleSuccess'));
    },
    onError: (error: Error) => {
      message.error(error.message);
    }
  });

  const getMissingDeps = (agent: AgentConfig) =>
    agent.dependsOn
      .filter((dep) => !agents.find((a) => a.agentType === dep)?.enabled)
      .map((dep) => t(`agent.${dep}`));

  const riskControl = agents.find((a) => a.agentType === 'risk_control');
  const riskControlOn = riskControl?.enabled === true;
  const isGuarded = (agent: AgentConfig) =>
    riskControlOn && agent.agentType !== 'risk_control' && agent.agentType !== 'finance_audit';

  const columns: ColumnsType<AgentConfig> = [
    {
      title: t('agent.name'),
      dataIndex: 'displayName',
      render: (name: string, record: AgentConfig) => {
        return (
          <div>
            <Typography.Text
              strong
              style={{ cursor: 'pointer', color: '#2563eb' }}
              onClick={() => navigate(`/agents/${record.agentType}`)}
            >
              {name}
            </Typography.Text>
            {record.required && <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>{t('agent.required')}</Tag>}
            {isGuarded(record) && <Tag icon={<SafetyOutlined />} color="green" style={{ marginLeft: 4, fontSize: 10 }}>{t('agent.guarded')}</Tag>}
            <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: '2px 0 0', maxWidth: 360 }} ellipsis={{ rows: 1 }}>
              {record.description}
            </Typography.Paragraph>
          </div>
        );
      }
    },
    {
      title: t('agent.enable'),
      width: 110,
      render: (_: unknown, record: AgentConfig) => {
        const missingDeps = getMissingDeps(record);
        const disabled = record.required || missingDeps.length > 0;
        return (
          <Typography.Text>
            <Switch
              size="small"
              checked={record.enabled}
              disabled={disabled}
              onChange={() => toggleMutation.mutate(record.agentType)}
            />
            {missingDeps.length > 0 && (
              <Typography.Text type="danger" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                {t('agent.dependsOn')}: {missingDeps.join(', ')}
              </Typography.Text>
            )}
          </Typography.Text>
        );
      }
    },
    {
      title: t('tasks.risk'),
      dataIndex: 'riskLevel',
      width: 90,
      render: (risk: string) => <StatusBadge value={risk as AgentConfig['riskLevel']} />
    },
    {
      title: t('agent.strategyConfig'),
      width: 100,
      render: (_: unknown, record: AgentConfig) =>
        record.needsConfig
          ? <Tag icon={<SettingOutlined />} color="blue" style={{ fontSize: 10 }}>{t('common.yes')}</Tag>
          : <Tag icon={<SettingOutlined />} style={{ fontSize: 10 }}>{t('common.no')}</Tag>
    },
    {
      title: t('agent.needApproval'),
      width: 100,
      render: (_: unknown, record: AgentConfig) =>
        record.needsApproval
          ? <Tag icon={<CheckCircleOutlined />} color="orange" style={{ fontSize: 10 }}>{t('common.yes')}</Tag>
          : <Tag icon={<CloseCircleOutlined />} style={{ fontSize: 10 }}>{t('common.no')}</Tag>
    },
    {
      title: t('agent.triggerDesc'),
      width: 100,
      render: (_: unknown, record: AgentConfig) => (
        <Tag style={{ fontSize: 11 }}>
          {record.triggerMode === 'scheduled' ? t('agent.autoRun') : record.triggerMode === 'event' ? t('agent.eventRun') : t('agent.manualRun')}
        </Tag>
      )
    }
  ];

  const enabled = agents.filter((a) => a.enabled);
  const disabled = agents.filter((a) => !a.enabled);

  return (
    <div className="page-stack">
      <PageHeader
        title={t('agent.title')}
        description={t('agent.description')}
      />

      {/* 已开通 */}
      {enabled.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Typography.Title level={5} style={{ marginBottom: 12 }}>
            <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 8 }} />
            {t('agent.enabledAgents')} · {enabled.length}
          </Typography.Title>
          <Card>
            <Table rowKey="agentType" columns={columns} dataSource={enabled} pagination={false} size="small" />
          </Card>
        </div>
      )}

      {/* 按层级分组 - 可开通 */}
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        <PlusOutlined style={{ color: '#2563eb', marginRight: 8 }} />
        {t('agent.availableAgents')}
      </Typography.Title>

      {layerOrder.map((layer) => {
        const layerAgents = disabled.filter((a) => a.layer === layer);
        if (layerAgents.length === 0) return null;
        return (
          <div key={layer} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: layerColors[layer], flexShrink: 0 }} />
              <Typography.Text strong style={{ fontSize: 13, color: 'var(--ark-muted)' }}>
                {t(`agent.layer_${layer}`)}
              </Typography.Text>
              <Tag style={{ fontSize: 10 }}>{layerAgents.length}</Tag>
            </div>
            <Card>
              <Table rowKey="agentType" columns={columns} dataSource={layerAgents} pagination={false} size="small" />
            </Card>
          </div>
        );
      })}

      {/* Agent 运行逻辑图 */}
      <Card
        title={
          <Typography.Text strong style={{ fontSize: 14 }}>
            {t('agent.flowTitle')}
          </Typography.Text>
        }
        style={{ marginTop: 8 }}
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 20 }}>
          {t('agent.flowDesc')}
        </Typography.Paragraph>

        <div className="agent-flow-diagram">
          {/* 第一行: 店铺保活 → 市场情报 → 商品上架 → 素材工厂 */}
          <div className="agent-flow-row">
            {flowNodes.slice(0, 4).map((node, i) => (
              <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div className={`agent-flow-node agent-flow-node--${node.layer}`} style={{ width: node.w }}>
                  <span>{node.label}</span>
                </div>
                {i < 3 && <div className="agent-flow-arrow">→</div>}
              </div>
            ))}
          </div>

          {/* 分叉线 */}
          <div className="agent-flow-row" style={{ justifyContent: 'center', gap: 120 }}>
            <div style={{ width: 80 }} />
            <div className="agent-flow-split">
              <div className="agent-flow-split-vbar" style={{ background: layerColors.foundation }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 2, height: 12, background: 'var(--ark-border)' }} />
                <div className="agent-flow-node agent-flow-node--traffic" style={{ width: 80 }}>{flowNodes[4].label}</div>
                <div style={{ width: 2, height: 6, background: 'var(--ark-border)' }} />
                <div className="agent-flow-node agent-flow-node--traffic" style={{ width: 80 }}>{flowNodes[5].label}</div>
              </div>
            </div>
          </div>

          {/* 侧边栏: 增值运营 + 库存预警 竖向标注 */}
          <div className="agent-flow-side">
            <div style={{ textAlign: 'center' }}>
              <div className="agent-flow-node agent-flow-node--growth" style={{ width: 130 }}>
                <span>{t('agent.flowGrowth')}</span>
              </div>
              <div className="agent-flow-sublist">
                {growthSubLabels.map((s) => (
                  <Tag key={s} color="green" style={{ fontSize: 10, margin: '1px 2px' }}>{s}</Tag>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div className="agent-flow-node agent-flow-node--support" style={{ width: 90 }}>
                <span>{t('agent.inventory_alert')}</span>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>
                {t('agent.flowFeedback')}
              </Typography.Text>
            </div>
          </div>

          {/* 底部: 风险控制 外框包裹 */}
          <div className="agent-flow-guard">
            <Tag icon={<SafetyOutlined />} color="orange" style={{ fontSize: 10 }}>
              {t('agent.flowRiskControl')}
            </Tag>
          </div>

          {/* 最底: 财务对账 */}
          <div className="agent-flow-row" style={{ justifyContent: 'center', marginTop: 8 }}>
            <div className="agent-flow-node agent-flow-node--standalone" style={{ width: 100 }}>
              <span>{t('agent.finance_audit')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
