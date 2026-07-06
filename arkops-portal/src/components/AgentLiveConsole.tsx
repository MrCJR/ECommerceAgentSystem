/**
 * File: AgentLiveConsole.tsx
 * Purpose: Task-level simulated runtime console for Agent detail pages. It builds localized
 * execution events, streams them into the terminal UI, and supports replay, pause, and copy actions.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 *
 * Main exports:
 * - AgentLiveConsole: renders a task-scoped live execution console.
 *
 * Major updates:
 * - 2026-07-03: Added ownership and function documentation for AI-assisted collaboration.
 */
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Button, Card, Space, Tag, Tooltip, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../app/i18n';
import type { Task } from '../types/domain';

type LiveEventLevel = 'info' | 'success' | 'warning' | 'error';

interface LiveEvent {
  id: string;
  at: string;
  level: LiveEventLevel;
  source: string;
  title: string;
  summary: string;
}

const levelIcon: Record<LiveEventLevel, JSX.Element> = {
  info: <ThunderboltOutlined />,
  success: <CheckCircleOutlined />,
  warning: <ExclamationCircleOutlined />,
  error: <ExclamationCircleOutlined />
};

/**
 * Builds visible runtime events for the task-level live console.
 *
 * @param task - Current task shown in the Agent detail page.
 * @param language - Active UI language.
 * @returns Ordered live-event list used by AgentLiveConsole.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
function buildLiveEvents(task: Task, language: 'en' | 'zh'): LiveEvent[] {
  const zh = language === 'zh';
  const base = dayjs(task.createdAt);
  const at = (seconds: number) => base.add(seconds, 'second').toISOString();
  const source = task.agentType === 'login_bootstrap' ? 'Login Bootstrap Agent' : 'Runtime Adapter';

  const commonStart: LiveEvent[] = [
    {
      id: `${task.id}-live-001`,
      at: at(2),
      level: 'info',
      source: 'Task Control Plane',
      title: zh ? '任务已进入执行队列' : 'Task entered execution queue',
      summary: zh
        ? `AllMall 已创建受控执行任务 ${task.id}，等待 runtime 接收。`
        : `AllMall created controlled task ${task.id} and is waiting for runtime pickup.`
    },
    {
      id: `${task.id}-live-002`,
      at: at(6),
      level: 'info',
      source,
      title: zh ? '正在解析任务目标与约束' : 'Parsing task goal and constraints',
      summary: zh
        ? `Agent 类型为 ${task.agentType}，风险级别为 ${task.riskLevel}。`
        : `Agent type is ${task.agentType}; risk level is ${task.riskLevel}.`
    }
  ];

  if (task.agentType === 'ads_optimizer') {
    return [
      ...commonStart,
      {
        id: `${task.id}-live-003`,
        at: at(12),
        level: 'info',
        source: 'MuleRun Runtime',
        title: zh ? '正在加载店铺浏览器会话' : 'Loading store browser session',
        summary: zh
          ? 'MuleRun 正在加载已绑定的 TikTok Shop browser profile。'
          : 'MuleRun is loading the bound TikTok Shop browser profile.'
      },
      {
        id: `${task.id}-live-004`,
        at: at(24),
        level: 'success',
        source: 'Browser Agent',
        title: zh ? '广告管理页面已打开' : 'Ads manager page opened',
        summary: zh
          ? '已进入广告管理页面，开始读取过去 7 天广告表现。'
          : 'Entered ads manager and started reading 7-day campaign performance.'
      },
      {
        id: `${task.id}-live-005`,
        at: at(38),
        level: 'info',
        source: 'Analysis Engine',
        title: zh ? '正在交叉检查广告与库存数据' : 'Cross-checking ads and inventory',
        summary: zh
          ? 'Agent 正在结合 ROI、消耗、库存和转化率筛选可调整广告计划。'
          : 'Agent is combining ROI, spend, inventory, and conversion rate to shortlist actions.'
      },
      {
        id: `${task.id}-live-006`,
        at: at(52),
        level: 'warning',
        source: 'Risk Policy',
        title: zh ? '发现高风险预算动作' : 'High-risk budget action detected',
        summary: zh
          ? '暂停广告计划 C-102 超过租户阈值，必须进入人工审批。'
          : 'Pausing campaign C-102 exceeds tenant threshold and requires human approval.'
      },
      {
        id: `${task.id}-live-007`,
        at: at(64),
        level: 'warning',
        source: 'Approval Service',
        title: zh ? '已创建审批请求' : 'Approval request created',
        summary: zh
          ? '任务已暂停，等待审批人审核预算调整建议。'
          : 'Task is paused until an approver reviews the budget adjustment proposal.'
      }
    ];
  }

  if (task.agentType === 'product_launch') {
    return [
      ...commonStart,
      {
        id: `${task.id}-live-003`,
        at: at(12),
        level: 'info',
        source: 'Knowledge Base',
        title: zh ? '正在检索平台规则与类目 SOP' : 'Retrieving platform rules and category SOP',
        summary: zh
          ? '已召回标题、属性、禁用词和详情页结构规则。'
          : 'Retrieved title, attribute, prohibited term, and detail page structure rules.'
      },
      {
        id: `${task.id}-live-004`,
        at: at(25),
        level: 'info',
        source: 'Content Agent',
        title: zh ? '正在生成商品草稿' : 'Generating product draft',
        summary: zh
          ? 'Agent 正在生成 SEO 标题、五点描述和属性建议。'
          : 'Agent is generating SEO title, bullet points, and attribute recommendations.'
      },
      {
        id: `${task.id}-live-005`,
        at: at(44),
        level: 'success',
        source: 'Compliance Guard',
        title: zh ? '合规检查通过' : 'Compliance check passed',
        summary: zh
          ? '未发现禁用词、侵权风险或夸大营销描述。'
          : 'No prohibited terms, infringement risk, or exaggerated claims detected.'
      },
      {
        id: `${task.id}-live-006`,
        at: at(58),
        level: 'success',
        source: 'Artifact Service',
        title: zh ? '商品草稿已归档' : 'Product draft archived',
        summary: zh
          ? '标题、属性和详情页结构已保存为可审计 artifact。'
          : 'Title, attributes, and detail page structure were saved as auditable artifacts.'
      }
    ];
  }

  if (task.agentType === 'login_bootstrap') {
    return [
      ...commonStart,
      {
        id: `${task.id}-live-003`,
        at: at(12),
        level: 'warning',
        source: 'Session Monitor',
        title: zh ? '检测到平台要求重新验证' : 'Platform re-authentication detected',
        summary: zh
          ? 'Amazon 卖家中心要求用户完成新的人机校验。'
          : 'Amazon Seller Central requires the user to complete a new human verification.'
      },
      {
        id: `${task.id}-live-004`,
        at: at(26),
        level: 'error',
        source: 'Runtime Adapter',
        title: zh ? '自动化已安全暂停' : 'Automation safely paused',
        summary: zh
          ? 'AllMall 已发送 login_required 事件，并等待运营人员刷新登录会话。'
          : 'AllMall emitted a login_required event and is waiting for an operator to refresh the session.'
      }
    ];
  }

  return [
    ...commonStart,
    {
      id: `${task.id}-live-003`,
      at: at(14),
      level: 'info',
      source: 'Agent Planner',
      title: zh ? '正在生成执行计划' : 'Generating execution plan',
      summary: zh
        ? 'Agent 已拆解任务步骤，并准备调用 runtime 工具。'
        : 'Agent decomposed the task and is preparing runtime tool calls.'
    },
    {
      id: `${task.id}-live-004`,
      at: at(34),
      level: task.status === 'failed' ? 'error' : 'success',
      source: 'Task Control Plane',
      title: task.status === 'failed' ? (zh ? '任务执行失败' : 'Task execution failed') : zh ? '任务执行完成' : 'Task execution completed',
      summary:
        task.status === 'failed'
          ? zh
            ? '执行结果已写入审计日志，可查看失败原因和回放证据。'
            : 'Execution result was written to audit logs with failure reason and replay evidence.'
          : zh
            ? '最终结果已归档，等待业务结果回收。'
            : 'Final result was archived and is waiting for business outcome collection.'
    }
  ];
}

/**
 * Converts one live event into a plain text log line for clipboard export.
 *
 * @param event - Runtime event currently visible in the console.
 * @returns Human-readable log line with time, source, title, and summary.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
function formatLine(event: LiveEvent) {
  return `[${dayjs(event.at).format('HH:mm:ss')}] ${event.source} :: ${event.title} - ${event.summary}`;
}

/**
 * Renders a task-level live execution console with localized simulated runtime events.
 *
 * @param task - Agent task used to derive the event stream and runtime metadata.
 * @returns React element containing the live console card.
 *
 * Author: Michael Lee
 * Created: 2026-07-03
 */
export function AgentLiveConsole({ task }: { task: Task }) {
  const { language, t } = useI18n();
  const allEvents = useMemo(() => buildLiveEvents(task, language), [task, language]);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isStreaming, setIsStreaming] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleEvents = allEvents.slice(0, visibleCount);
  const isComplete = visibleCount >= allEvents.length;

  useEffect(() => {
    setVisibleCount(1);
    setIsStreaming(true);
  }, [task.id, allEvents]);

  useEffect(() => {
    if (!isStreaming || isComplete) return undefined;
    const timer = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 1, allEvents.length));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [allEvents.length, isComplete, isStreaming, visibleCount]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleEvents.length]);

  /**
   * Copies the currently visible execution stream into the clipboard.
   *
   * @returns Promise that resolves after the browser clipboard write completes.
   *
   * Author: Michael Lee
   * Created: 2026-07-03
   */
  const copyLog = async () => {
    await navigator.clipboard?.writeText(visibleEvents.map(formatLine).join('\n'));
    message.success(t('liveConsole.copied'));
  };

  return (
    <Card
      className="agent-live-card"
      title={
        <Space>
          <span className="live-pulse" />
          <span>{t('liveConsole.title')}</span>
          <Tag className="live-state-tag">{isComplete ? t('liveConsole.synced') : t('liveConsole.streaming')}</Tag>
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
          <Tooltip title={t('liveConsole.replay')}>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => {
                setVisibleCount(1);
                setIsStreaming(true);
              }}
            />
          </Tooltip>
          <Tooltip title={t('liveConsole.copy')}>
            <Button size="small" icon={<CopyOutlined />} onClick={copyLog} />
          </Tooltip>
        </Space>
      }
    >
      <div className="agent-live-meta">
        <span>{t('liveConsole.runId')}: run_{task.id}</span>
        <span>{t('liveConsole.provider')}: MuleRun</span>
        <span>{t('liveConsole.events')}: {visibleEvents.length}/{allEvents.length}</span>
      </div>
      <div className="agent-live-terminal" ref={scrollRef}>
        {visibleEvents.map((event) => (
          <div className={`agent-live-line agent-live-line-${event.level}`} key={event.id}>
            <span className="agent-live-time">
              <ClockCircleOutlined /> {dayjs(event.at).format('HH:mm:ss')}
            </span>
            <span className="agent-live-icon">{levelIcon[event.level]}</span>
            <span className="agent-live-source">{event.source}</span>
            <span className="agent-live-copy">
              <Typography.Text strong>{event.title}</Typography.Text>
              <Typography.Text>{event.summary}</Typography.Text>
            </span>
          </div>
        ))}
        {!isComplete ? <span className="agent-live-cursor" /> : null}
      </div>
    </Card>
  );
}
