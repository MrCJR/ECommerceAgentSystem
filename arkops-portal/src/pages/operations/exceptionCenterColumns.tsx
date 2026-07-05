import {
  AlertOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  MinusCircleOutlined,
  SafetyOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TruckOutlined,
  UndoOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableActionGroup } from '../../components/table/TableActionGroup';
import type { AgentLogEntry, ExceptionItem, ExceptionType } from './exceptionCenterMockData';
import { LEVEL_COLORS } from './exceptionCenterMockData';

type TFunction = (key: string) => string;

interface ExceptionColumnHandlers {
  navigate: (path: string) => void;
  onIgnore: (id: string) => void;
  onResolve: (id: string) => void;
  onUnignore: (id: string) => void;
  onView: (record: ExceptionItem) => void;
}

function typeIcon(type: ExceptionType) {
  const icons: Record<ExceptionType, JSX.Element> = {
    review_negative: <StarOutlined />,
    chat_escalation: <MessageOutlined />,
    ad_low_roi: <ThunderboltOutlined />,
    logistics_stuck: <TruckOutlined />,
    compliance_flag: <SafetyOutlined />,
  };
  return icons[type];
}

function typeLabel(t: TFunction, type: ExceptionType) {
  return t(`exc.type_${type}`);
}

export function createExceptionColumns(t: TFunction, handlers: ExceptionColumnHandlers): ColumnsType<ExceptionItem> {
  return [
    {
      title: '',
      width: 40,
      render: (_: unknown, record: ExceptionItem) => {
        const icons: Record<string, JSX.Element> = {
          critical: <ExclamationCircleOutlined style={{ color: '#dc2626', fontSize: 16 }} />,
          warning: <AlertOutlined style={{ color: '#ea580c', fontSize: 16 }} />,
          info: <BellOutlined style={{ color: '#2563eb', fontSize: 16 }} />,
        };
        return icons[record.level];
      },
    },
    {
      title: t('exc.type'),
      dataIndex: 'type',
      width: 130,
      render: (type: ExceptionType) => (
        <Space>
          {typeIcon(type)}
          <Typography.Text>{typeLabel(t, type)}</Typography.Text>
        </Space>
      ),
    },
    {
      title: t('exc.title'),
      dataIndex: 'title',
      width: 260,
      render: (title: string, record: ExceptionItem) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{title}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {record.storeName} · {t(`agent.${record.agentType}`)}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: t('exc.level'),
      dataIndex: 'level',
      width: 80,
      render: (level: string) => <Tag color={LEVEL_COLORS[level]}>{t(`exc.${level}`)}</Tag>,
    },
    {
      title: t('exc.assignee'),
      dataIndex: 'assignee',
      width: 90,
      render: (assignee: string | undefined) =>
        assignee ? (
          <Tag icon={<UserOutlined />}>{assignee}</Tag>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: t('exc.summary'),
      dataIndex: 'summary',
      width: 280,
      ellipsis: true,
    },
    {
      title: t('exc.createdAt'),
      dataIndex: 'createdAt',
      width: 130,
    },
    {
      title: t('common.actions'),
      width: 360,
      render: (_: unknown, record: ExceptionItem) => (
        <TableActionGroup>
          <Button size="small" onClick={() => handlers.onView(record)}>
            {t('common.view')}
          </Button>
          {!record.resolved && !record.ignored && (
            <>
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handlers.onResolve(record.id)}>
                {t('exc.resolve')}
              </Button>
              <Button size="small" icon={<MinusCircleOutlined />} onClick={() => handlers.onIgnore(record.id)}>
                {t('exc.ignore')}
              </Button>
            </>
          )}
          {record.ignored && (
            <>
              <Button size="small" icon={<UndoOutlined />} onClick={() => handlers.onUnignore(record.id)}>
                {t('exc.unignore')}
              </Button>
              <Tag color="default">{t('exc.ignoredStatus')}</Tag>
            </>
          )}
          {record.linkTo && (
            <Button size="small" icon={<EyeOutlined />} onClick={() => handlers.navigate(record.linkTo!)}>
              {t('exc.goHandle')}
            </Button>
          )}
          {record.resolved && <Tag color="green">{t('exc.resolvedStatus')}</Tag>}
        </TableActionGroup>
      ),
    },
  ];
}

export function createAgentLogColumns(t: TFunction): ColumnsType<AgentLogEntry> {
  return [
    {
      title: t('exc.logTime'),
      dataIndex: 'at',
      width: 60,
      render: (at: string) => <Typography.Text type="secondary" style={{ fontSize: 11 }}>{at}</Typography.Text>,
    },
    {
      title: t('exc.logAgent'),
      dataIndex: 'agentType',
      width: 110,
      render: (agentType: string) => <Tag>{t(`agent.${agentType}`)}</Tag>,
    },
    {
      title: t('exc.logAction'),
      dataIndex: 'action',
      width: 100,
      render: (action: string) => <Typography.Text strong>{action}</Typography.Text>,
    },
    {
      title: t('exc.logTarget'),
      dataIndex: 'target',
      ellipsis: true,
    },
    {
      title: t('exc.logResult'),
      dataIndex: 'result',
      width: 110,
      render: (result: string) => {
        const colors: Record<string, string> = { success: 'green', auto_resolved: 'blue', escalated: 'orange', blocked: 'red', failed: 'red' };
        return <Tag color={colors[result]}>{t(`exc.result_${result}`)}</Tag>;
      },
    },
    {
      title: t('exc.logSummary'),
      dataIndex: 'summary',
      ellipsis: true,
    },
  ];
}
