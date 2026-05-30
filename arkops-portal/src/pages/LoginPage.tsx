import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <Card className="login-card">
        <Typography.Title level={2}>ArkOps Portal</Typography.Title>
        <Typography.Paragraph type="secondary">
          Internal beta console for store binding, Agent tasks, approvals, and audit evidence.
        </Typography.Paragraph>
        <Form layout="vertical" initialValues={{ email: 'lipeng@example.com', password: 'demo123456' }}>
          <Form.Item label="Email" name="email">
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" block size="large" onClick={() => navigate('/dashboard')}>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
