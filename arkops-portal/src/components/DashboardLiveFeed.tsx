import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Button, Card, Space, Tag, Tooltip, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../app/i18n';
import type { Approval, Task } from '../types/domain';

type FeedLevel = 'info' | 'success' | 'warning' | 'error';

interface FeedTemplate {
  id: string;
  level: FeedLevel;
  source: string;
  title: string;
  summary: string;
  taskId?: string;
  approvalId?: string;
}

interface FeedEvent extends FeedTemplate {
  instanceId: string;
  at: string;
}

const feedIcon: Record<FeedLevel, JSX.Element> = {
  info: <ThunderboltOutlined />,
  success: <CheckCircleOutlined />,
  warning: <ExclamationCircleOutlined />,
  error: <ExclamationCircleOutlined />
};

function buildFeedTemplates(tasks: Task[], approvals: Approval[], language: 'en' | 'zh'): FeedTemplate[] {
  const zh = language === 'zh';
  const taskEvents = tasks.flatMap<FeedTemplate>((task) => {
    if (task.agentType === 'ads_optimizer') {
      return [
        {
          id: `${task.id}-roi-scan`,
          level: 'info',
          source: zh ? '广告优化 Agent' : 'Advertising Agent',
          title: zh ? '正在分析广告 ROI' : 'Analyzing campaign ROI',
          summary: zh
            ? `${task.storeId} 正在读取近 7 天广告消耗、点击率和转化率。`
            : `${task.storeId} is reading 7-day spend, CTR, and conversion data.`,
          taskId: task.id
        },
        {
          id: `${task.id}-risk`,
          level: 'warning',
          source: zh ? '风险策略' : 'Risk Policy',
          title: zh ? '发现预算调整风险' : 'Budget action risk detected',
          summary: zh
            ? '预算动作超过租户阈值，已暂停任务并提交审批。'
            : 'Budget action exceeded tenant threshold; task paused and approval requested.',
          taskId: task.id
        }
      ];
    }

    if (task.agentType === 'product_launch') {
      return [
        {
          id: `${task.id}-listing`,
          level: 'info',
          source: zh ? '新品上架 Agent' : 'Product Launch Agent',
          title: zh ? '正在生成商品草稿' : 'Generating product draft',
          summary: zh
            ? `${task.storeId} 正在生成 SEO 标题、属性和详情页结构。`
            : `${task.storeId} is generating SEO title, attributes, and detail page structure.`,
          taskId: task.id
        },
        {
          id: `${task.id}-archive`,
          level: 'success',
          source: zh ? 'Artifact Service' : 'Artifact Service',
          title: zh ? '商品草稿已归档' : 'Product draft archived',
          summary: zh
            ? '执行结果已保存为可审计 artifact。'
            : 'Execution result was saved as an auditable artifact.',
          taskId: task.id
        }
      ];
    }

    if (task.agentType === 'login_bootstrap') {
      return [
        {
          id: `${task.id}-login`,
          level: 'error',
          source: zh ? '会话监控' : 'Session Monitor',
          title: zh ? '店铺需要重新登录' : 'Store needs re-authentication',
          summary: zh
            ? `${task.storeId} 检测到平台人机校验，自动化已安全暂停。`
            : `${task.storeId} requires human verification; automation was safely paused.`,
          taskId: task.id
        }
      ];
    }

    return [
      {
        id: `${task.id}-generic`,
        level: task.status === 'failed' ? 'error' : 'info',
        source: zh ? 'Agent Runtime' : 'Agent Runtime',
        title: zh ? '任务状态已更新' : 'Task status updated',
        summary: task.goal,
        taskId: task.id
      }
    ];
  });

  const approvalEvents = approvals.map<FeedTemplate>((approval) => ({
    id: `${approval.id}-approval`,
    level: approval.status === 'pending' ? 'warning' : 'success',
    source: zh ? '审批中心' : 'Approval Center',
    title: approval.status === 'pending' ? (zh ? '新的高风险审批待处理' : 'New high-risk approval pending') : (zh ? '审批结果已同步' : 'Approval decision synced'),
    summary: approval.reason,
    approvalId: approval.id,
    taskId: approval.taskId
  }));

  return [...taskEvents, ...approvalEvents];
}

function formatFeedLine(event: FeedEvent) {
  return `[${dayjs(event.at).format('HH:mm:ss')}] ${event.source} :: ${event.title} - ${event.summary}`;
}

export function DashboardLiveFeed({ tasks, approvals }: { tasks: Task[]; approvals: Approval[] }) {
  const { language, t } = useI18n();
  const templates = useMemo(() => buildFeedTemplates(tasks, approvals, language), [approvals, language, tasks]);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const cursorRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cursorRef.current = 0;
    setEvents([]);
    setIsStreaming(true);
  }, [templates]);

  useEffect(() => {
    if (!isStreaming || templates.length === 0) return undefined;
    const timer = window.setInterval(() => {
      const template = templates[cursorRef.current % templates.length];
      cursorRef.current += 1;
      setEvents((current) => [
        ...current.slice(-7),
        {
          ...template,
          instanceId: `${template.id}-${Date.now()}`,
          at: new Date().toISOString()
        }
      ]);
    }, 1200);

    return () => window.clearInterval(timer);
  }, [isStreaming, templates]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [events.length]);

  const copyLog = async () => {
    await navigator.clipboard?.writeText(events.map(formatFeedLine).join('\n'));
    message.success(t('liveConsole.copied'));
  };

  return (
    <Card
      className="agent-live-card dashboard-live-card"
      title={
        <Space>
          <span className="live-pulse" />
          <span>{t('dashboard.liveFeedTitle')}</span>
          <Tag className="live-state-tag">{isStreaming ? t('liveConsole.streaming') : t('dashboard.liveFeedPaused')}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Tooltip title={isStreaming ? t('liveConsole.pause') : t('liveConsole.resume')}>
            <Button
              size="small"
              icon={isStreaming ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsStreaming((value) => !value)}
            />
          </Tooltip>
          <Tooltip title={t('liveConsole.copy')}>
            <Button size="small" icon={<CopyOutlined />} onClick={copyLog} disabled={events.length === 0} />
          </Tooltip>
        </Space>
      }
    >
      <div className="agent-live-meta">
        <span>{t('dashboard.liveFeedScope')}</span>
        <span>{t('liveConsole.events')}: {events.length}</span>
        <span>{t('dashboard.liveFeedProvider')}: MuleRun / Runtime Adapter</span>
      </div>
      <div className="agent-live-terminal dashboard-live-terminal" ref={scrollRef}>
        {events.length === 0 ? (
          <div className="dashboard-live-empty">
            <RobotOutlined />
            <span>{t('dashboard.liveFeedWarmup')}</span>
          </div>
        ) : null}
        {events.map((event) => (
          <div className={`agent-live-line dashboard-live-line agent-live-line-${event.level}`} key={event.instanceId}>
            <span className="agent-live-time">
              <ClockCircleOutlined /> {dayjs(event.at).format('HH:mm:ss')}
            </span>
            <span className="agent-live-icon">{feedIcon[event.level]}</span>
            <span className="agent-live-source">{event.source}</span>
            <span className="agent-live-copy">
              <Typography.Text strong>{event.title}</Typography.Text>
              <Typography.Text>{event.summary}</Typography.Text>
              <Space size={10} wrap>
                {event.taskId ? <Link to={`/tasks/${event.taskId}`}>{t('dashboard.openTask')}</Link> : null}
                {event.approvalId ? <Link to={`/approvals/${event.approvalId}`}>{t('dashboard.openApproval')}</Link> : null}
              </Space>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
