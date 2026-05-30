import { useQuery } from '@tanstack/react-query';
import { Card, Progress, Statistic } from 'antd';
import { settingsApi } from '../api/settings';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';

export function BillingSettingsPage() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ['billing'], queryFn: settingsApi.billing });
  return (
    <div className="page-stack">
      <PageHeader title={t('settings.billingTitle')} description={t('settings.billingDescription')} />
      <div className="metric-grid">
        <Card>
          <Statistic title={t('settings.plan')} value={data?.plan ?? '内部测试版'} />
        </Card>
        <Card>
          <Statistic title={t('settings.workerLimit')} value={data?.workerLimit ?? 0} />
        </Card>
        <Card>
          <Statistic title={t('settings.browserSessions')} value={data?.browserSessionLimit ?? 0} />
        </Card>
        <Card>
          <Statistic title={t('settings.dailyOperations')} value={data?.operationUsage ?? 0} />
        </Card>
      </div>
      <Card title={t('settings.usage')}>
        <p className="muted">{t('settings.llmTokenUsage')}</p>
        <Progress percent={Math.round(((data?.tokenUsage ?? 0) / 300000) * 100)} />
        <p className="muted">{t('settings.dailyOperations')}</p>
        <Progress percent={Math.round(((data?.operationUsage ?? 0) / 1000) * 100)} status="active" />
      </Card>
    </div>
  );
}
