import { Timeline, Typography } from 'antd';
import type { Task } from '../types/domain';

interface TaskTimelinePreviewProps {
  task: Task;
  emptyText: string;
}

export function TaskTimelinePreview({ task, emptyText }: TaskTimelinePreviewProps) {
  if (task.timeline.length === 0) {
    return <Typography.Text type="secondary">{emptyText}</Typography.Text>;
  }

  return (
    <div style={{ padding: '4px 0 4px 8px' }}>
      <Timeline
        items={task.timeline.map((event) => ({
          color: event.type === 'run_failed' || event.type === 'login_required' ? 'red'
            : event.type === 'approval_required' ? 'orange'
            : event.type === 'run_succeeded' ? 'green'
            : 'blue',
          children: (
            <div>
              <Typography.Text strong style={{ fontSize: 13 }}>{event.title}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {new Date(event.at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {' · '}{event.summary}
              </Typography.Text>
            </div>
          )
        }))}
      />
    </div>
  );
}
