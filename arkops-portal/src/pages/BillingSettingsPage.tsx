import { useQuery } from '@tanstack/react-query';
import { Card, Progress, Statistic } from 'antd';
import { settingsApi } from '../api/settings';
import { PageHeader } from '../components/PageHeader';

export function BillingSettingsPage() {
  const { data } = useQuery({ queryKey: ['billing'], queryFn: settingsApi.billing });
  return (
    <div className="page-stack">
      <PageHeader title="Billing & quota" description="Internal beta plan, resource limits, and usage counters." />
      <div className="metric-grid">
        <Card>
          <Statistic title="Plan" value={data?.plan ?? 'Internal Beta'} />
        </Card>
        <Card>
          <Statistic title="Worker limit" value={data?.workerLimit ?? 0} />
        </Card>
        <Card>
          <Statistic title="Browser sessions" value={data?.browserSessionLimit ?? 0} />
        </Card>
        <Card>
          <Statistic title="Daily operations" value={data?.operationUsage ?? 0} />
        </Card>
      </div>
      <Card title="Usage">
        <p className="muted">LLM token usage</p>
        <Progress percent={Math.round(((data?.tokenUsage ?? 0) / 300000) * 100)} />
        <p className="muted">Daily operations</p>
        <Progress percent={Math.round(((data?.operationUsage ?? 0) / 1000) * 100)} status="active" />
      </Card>
    </div>
  );
}
