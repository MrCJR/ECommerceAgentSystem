/**
 * File: AgentTaskCard.tsx
 * Purpose: Shared Agent task entry components used by Agent detail pages to present built-in
 * workflow shortcuts as clickable cards and responsive grids.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - AgentTaskCard: renders one built-in Agent task card.
 * - AgentTaskGrid: renders a responsive grid of built-in Agent task cards.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
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

/**
 * Renders a single built-in Agent task card.
 *
 * @param icon - Icon shown before the task title.
 * @param title - Task title text.
 * @param description - Short task description shown under the title.
 * @param tag - Optional status or category tag.
 * @param tagColor - Optional Ant Design tag color.
 * @param onClick - Optional click handler for launching the workflow.
 * @returns React element containing the Agent task card.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
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

/**
 * Renders a responsive card grid for built-in Agent tasks.
 *
 * @param title - Section title shown on the wrapping card.
 * @param tasks - Ordered task card definitions.
 * @param mdSpan - Ant Design grid span used on medium screens.
 * @param smSpan - Optional Ant Design grid span used on small screens.
 * @returns React element containing the task card grid.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
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
