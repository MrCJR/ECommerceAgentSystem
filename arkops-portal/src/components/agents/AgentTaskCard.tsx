import { Card, Col, Row, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';

export interface AgentTaskDefinition {
  icon: ReactNode;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
  onClick?: () => void;
}

interface AgentTaskCardProps extends AgentTaskDefinition {}

interface AgentTaskGridProps {
  title: ReactNode;
  tasks: AgentTaskDefinition[];
  mdSpan?: number;
  smSpan?: number;
}

export function AgentTaskCard({ icon, title, description, tag, tagColor, onClick }: AgentTaskCardProps) {
  return (
    <Card
      size="small"
      hoverable={Boolean(onClick)}
      className={onClick ? 'agent-task-card-clickable' : 'agent-task-card'}
      onClick={onClick}
    >
      <Typography.Text strong className="agent-task-title">
        {icon}
        {title}
      </Typography.Text>
      <Typography.Paragraph type="secondary" className="agent-task-desc">
        {description}
      </Typography.Paragraph>
      {tag ? <Tag color={tagColor} className="agent-task-tag">{tag}</Tag> : null}
    </Card>
  );
}

export function AgentTaskGrid({ title, tasks, mdSpan = 8, smSpan }: AgentTaskGridProps) {
  return (
    <Card title={title} style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {tasks.map((task) => (
          <Col key={task.title} xs={24} sm={smSpan} md={mdSpan}>
            <AgentTaskCard {...task} />
          </Col>
        ))}
      </Row>
    </Card>
  );
}
