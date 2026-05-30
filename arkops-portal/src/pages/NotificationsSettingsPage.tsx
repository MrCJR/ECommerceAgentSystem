import { useQuery } from '@tanstack/react-query';
import { Button, Card, Descriptions, List, Switch } from 'antd';
import { settingsApi } from '../api/settings';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';

export function NotificationsSettingsPage() {
  const { t } = useI18n();
  const { data = [] } = useQuery({ queryKey: ['notifications'], queryFn: settingsApi.notifications });
  return (
    <div className="page-stack">
      <PageHeader
        title={t('settings.notificationsTitle')}
        description={t('settings.notificationsDescription')}
        actions={<Button type="primary">{t('settings.addChannel')}</Button>}
      />
      <Card>
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item extra={<Switch checked={item.status === 'connected'} />}>
              <List.Item.Meta title={item.channel} description={`${t('settings.events')}: ${item.events}`} />
            </List.Item>
          )}
        />
      </Card>
      <Card title={t('settings.defaultPolicy')}>
        <Descriptions column={1}>
          <Descriptions.Item label={t('settings.eventApprovalRequired')}>
            {t('settings.policyApprovalRequired')}
          </Descriptions.Item>
          <Descriptions.Item label={t('settings.eventLoginRequired')}>
            {t('settings.policyLoginRequired')}
          </Descriptions.Item>
          <Descriptions.Item label={t('settings.eventRunFailed')}>{t('settings.policyRunFailed')}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
