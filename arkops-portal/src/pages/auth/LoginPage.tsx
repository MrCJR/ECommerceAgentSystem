import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Segmented, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../app/i18n';

export function LoginPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="login-page">
      <Card className="login-card">
        <Segmented
          size="small"
          value={language}
          onChange={(value) => setLanguage(value as 'en' | 'zh')}
          options={[
            { label: 'EN', value: 'en' },
            { label: '中文', value: 'zh' }
          ]}
          style={{ marginBottom: 16 }}
        />
        <Typography.Title level={2}>{t('login.title')}</Typography.Title>
        <Typography.Paragraph type="secondary">{t('login.description')}</Typography.Paragraph>
        <Form layout="vertical" initialValues={{ email: 'lipeng@example.com', password: 'demo123456' }}>
          <Form.Item label={t('login.email')} name="email">
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item label={t('login.password')} name="password">
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" block size="large" onClick={() => navigate('/dashboard')}>
            {t('login.submit')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
