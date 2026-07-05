import {
  AlertOutlined,
  BellOutlined,
  CheckCircleOutlined,
  DashOutlined,
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
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../app/i18n';
import { PageHeader } from '../../components/PageHeader';

// ===== 异常类型 =====
type ExceptionType = 'review_negative' | 'chat_escalation' | 'ad_low_roi' | 'logistics_stuck' | 'compliance_flag';

type ExceptionStatus = 'pending' | 'resolved' | 'ignored' | 'all';

interface ExceptionItem {
  id: string;
  type: ExceptionType;
  title: string;
  storeName: string;
  agentType: string;
  level: 'critical' | 'warning' | 'info';
  summary: string;
  detail: string;
  suggestedAction: string;
  createdAt: string;
  resolved: boolean;
  ignored: boolean;
  assignee?: string;
  linkTo?: string; // 深链接到专业处理页面
}

// ===== Agent 操作日志 =====
interface AgentLogEntry {
  id: string;
  agentType: string;
  action: string;
  target: string;
  result: 'success' | 'auto_resolved' | 'escalated' | 'blocked' | 'failed';
  summary: string;
  at: string;
}

// ===== 预设负责人列表 =====
const ASSIGNEE_OPTIONS = ['张伟', '李娜', '王强', '赵敏', '陈浩'];

const exceptionItems: ExceptionItem[] = [
  {
    id: 'ex_002', type: 'review_negative', title: '恶意差评检测',
    storeName: 'Amazon 户外用品店', agentType: '评价管理',
    level: 'critical', summary: '折叠露营椅收到 1 星差评，AI 判定疑似同行攻击 (置信度 87%)。',
    detail: '评论内容: "质量极差，跟图片完全不符，千万别买"\n买家历史: 新账号、无购买历史、3 天内 5 条差评\nAI 判定: 同行恶意差评',
    suggestedAction: '提交平台申诉，附 AI 分析报告',
    createdAt: '2026-06-21 09:15', resolved: false, ignored: false,
    linkTo: '/agents/review_manager',
  },
  {
    id: 'ex_003', type: 'chat_escalation', title: '退款争议升级',
    storeName: 'Shopify 独立站', agentType: '客服消息',
    level: 'critical', summary: '买家投诉未收到商品，要求全额退款并威胁信用卡拒付。',
    detail: '运单号: 1Z999AA1234567890\n物流状态: 显示已签收但买家否认\n买家情绪: 愤怒，威胁发起 chargeback',
    suggestedAction: '提供签收证明截图，安抚买家情绪，必要时部分退款',
    createdAt: '2026-06-21 11:00', resolved: false, ignored: false,
    linkTo: '/agents/customer_service',
  },
  {
    id: 'ex_004', type: 'ad_low_roi', title: '广告计划 ROI 跌破红线',
    storeName: 'TikTok Shop 美国旗舰店', agentType: '广告投放',
    level: 'warning', summary: '广告计划 C-102 连续 3 天 ROI < 1.5，已自动暂停但预算仍消耗 $612。',
    detail: '计划: C-102 蓝牙耳机促销\n7 天花费: $612，GMV: $869，ROI: 1.42\n红线: 1.5\n建议: 更换素材或降低出价',
    suggestedAction: '审核广告素材，决定是否重启或永久关闭',
    createdAt: '2026-06-21 08:00', resolved: false, ignored: false,
    linkTo: '/agents/ads_optimizer',
  },
  {
    id: 'ex_006', type: 'logistics_stuck', title: '物流包裹滞留',
    storeName: 'TikTok Shop 美国旗舰店', agentType: '售后处理',
    level: 'warning', summary: '退货包裹 #RT-2406-0047 在 USPS 中转站滞留 5 天未更新。',
    detail: '退货单号: RT-2406-0047\n物流商: USPS\n最后更新: 2026-06-16 Chicago IL Distribution Center\n状态: In Transit (5 天无更新)',
    suggestedAction: '联系 USPS 查询包裹状态，或发起丢失索赔',
    createdAt: '2026-06-21 06:30', resolved: false, ignored: false,
    linkTo: '/agents/after_sales',
  },
  {
    id: 'ex_007', type: 'compliance_flag', title: '合规风险标记',
    storeName: 'TikTok Shop 美国旗舰店', agentType: '风险控制',
    level: 'warning', summary: '蓝牙耳机商品描述含"最强降噪"，被标记为可能违反广告法。',
    detail: '商品: SKU BT-E01 蓝牙耳机 Pro\n问题: 描述含绝对化用语 "最强"\n法规: 广告法第 9 条禁止 "最" 字类绝对化用语',
    suggestedAction: '修改描述为 "高效降噪" 或 "顶级降噪体验"',
    createdAt: '2026-06-21 05:00', resolved: true, ignored: false,
    linkTo: '/agents/risk_control',
  },
];

const agentLogData: AgentLogEntry[] = [
  { id: 'log_001', agentType: 'ads_optimizer', action: '暂停广告计划', target: 'C-102 蓝牙耳机促销', result: 'auto_resolved', summary: 'ROI 连续 3 天低于 1.5 红线，自动暂停并通知运营', at: '08:00' },
  { id: 'log_002', agentType: 'pricing_strategy', action: '动态调价', target: 'SKU BT-E01 蓝牙耳机 Pro', result: 'success', summary: '竞品平均降价 8%，自动调低售价 $39.99 → $36.99', at: '07:30' },
  { id: 'log_003', agentType: 'crm_retention', action: '发放优惠券', target: '沉默客户群 (3 个月未购)', result: 'success', summary: '发放 15% OFF 优惠券共 167 张，预算 $250', at: '07:00' },
  { id: 'log_004', agentType: 'review_manager', action: '自动回复好评', target: '露营椅 5 星好评 ×3', result: 'success', summary: '自动感谢回复 3 条 4-5 星好评', at: '06:45' },
  { id: 'log_005', agentType: 'inventory_alert', action: '低库存预警', target: 'SKU CK-C01 65W GaN 充电器', result: 'escalated', summary: '库存仅剩 35 件，低于安全阈值 50，建议补货 200 件', at: '06:30' },
  { id: 'log_006', agentType: 'customer_service', action: '智能应答', target: '买家咨询退换货政策', result: 'success', summary: '自动回复退换货政策，买家表示满意', at: '06:15' },
  { id: 'log_007', agentType: 'after_sales', action: '自动退款', target: '退货单 RT-2406-0042', result: 'success', summary: '退货签收确认，自动退款 $19.99 已发起', at: '06:00' },
  { id: 'log_008', agentType: 'finance_audit', action: '账单比对', target: 'TikTok Shop 6 月账单', result: 'success', summary: '平台账单与内部记录差异 $0.00，完全匹配', at: '05:30' },
  { id: 'log_009', agentType: 'creative_factory', action: '生成广告素材', target: '蓝牙耳机 16:9 横版视频', result: 'success', summary: '生成 3 个版式素材（1:1/16:9/9:16），待广告 Agent 调用', at: '05:00' },
  { id: 'log_010', agentType: 'risk_control', action: '阻断操作', target: 'TikTok Shop 蓝牙耳机描述', result: 'escalated', summary: '检测到 "最强" 绝对化用语，已阻断发布并通知运营修改', at: '04:45' },
  { id: 'log_011', agentType: 'competitor_intel', action: '竞品监控完成', target: '消费电子类目 5 个竞品', result: 'success', summary: '发现 2 个竞品降价 5-10%，数据已写入缓存', at: '04:30' },
  { id: 'log_012', agentType: 'login_bootstrap', action: '店铺会话保活', target: '全部 3 个店铺', result: 'success', summary: 'TikTok Shop/Amazon/Shopify 登录会话均正常', at: '04:00' },
];

// ===== 所有可能的 Agent 类型（用于筛选） =====
const ALL_AGENT_TYPES = ['评价管理', '客服消息', '广告投放', '售后处理', '风险控制'];

export function ExceptionCenterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState<ExceptionItem[]>(exceptionItems);
  const [filter, setFilter] = useState<ExceptionStatus>('pending');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [detailItem, setDetailItem] = useState<ExceptionItem | null>(null);
  const [assigneeModal, setAssigneeModal] = useState<string | undefined>(undefined);

  const filtered = items.filter((i) => {
    // 状态筛选
    if (filter === 'pending') {
      if (i.resolved || i.ignored) return false;
    } else if (filter === 'resolved') {
      if (!i.resolved) return false;
    } else if (filter === 'ignored') {
      if (!i.ignored) return false;
    }
    // Agent 类型筛选
    if (agentFilter !== 'all' && i.agentType !== agentFilter) return false;
    return true;
  });

  const pendingCount = items.filter((i) => !i.resolved && !i.ignored).length;
  const criticalCount = items.filter((i) => !i.resolved && !i.ignored && i.level === 'critical').length;

  const resolveItem = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: true, ignored: false } : i)));
    message.success(t('exc.resolved'));
    setDetailItem(null);
  };

  const ignoreItem = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ignored: true } : i)));
    message.success(t('exc.ignored'));
    setDetailItem(null);
  };

  const unignoreItem = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ignored: false } : i)));
    message.success(t('exc.unignore'));
  };

  const assignItem = (id: string, assignee: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, assignee } : i)));
    message.success(t('exc.assign') + ': ' + assignee);
  };

  const typeIcon = (type: ExceptionType) => {
    const icons: Record<ExceptionType, JSX.Element> = {
      review_negative: <StarOutlined />,
      chat_escalation: <MessageOutlined />,
      ad_low_roi: <ThunderboltOutlined />,
      logistics_stuck: <TruckOutlined />,
      compliance_flag: <SafetyOutlined />,
    };
    return icons[type];
  };

  const typeLabel = (type: ExceptionType) => t(`exc.type_${type}`);

  const levelColors: Record<string, string> = { critical: 'red', warning: 'orange', info: 'blue' };

  const columns: ColumnsType<ExceptionItem> = [
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
          <Typography.Text>{typeLabel(type)}</Typography.Text>
        </Space>
      ),
    },
    {
      title: t('exc.title'),
      dataIndex: 'title',
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
      render: (level: string) => <Tag color={levelColors[level]}>{t(`exc.${level}`)}</Tag>,
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
      ellipsis: true,
    },
    {
      title: t('exc.createdAt'),
      dataIndex: 'createdAt',
      width: 130,
    },
    {
      title: t('common.actions'),
      width: 260,
      render: (_: unknown, record: ExceptionItem) => (
        <Space>
          <Button size="small" onClick={() => { setDetailItem(record); setAssigneeModal(record.assignee); }}>
            {t('common.view')}
          </Button>
          {!record.resolved && !record.ignored && (
            <>
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => resolveItem(record.id)}>
                {t('exc.resolve')}
              </Button>
              <Button size="small" icon={<MinusCircleOutlined />} onClick={() => ignoreItem(record.id)}>
                {t('exc.ignore')}
              </Button>
            </>
          )}
          {record.ignored && (
            <>
              <Button size="small" icon={<UndoOutlined />} onClick={() => unignoreItem(record.id)}>
                {t('exc.unignore')}
              </Button>
              <Tag color="default">{t('exc.ignoredStatus')}</Tag>
            </>
          )}
          {record.linkTo && (
            <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(record.linkTo!)}>
              {t('exc.goHandle')}
            </Button>
          )}
          {record.resolved && <Tag color="green">{t('exc.resolvedStatus')}</Tag>}
        </Space>
      ),
    },
  ];

  const logColumns: ColumnsType<AgentLogEntry> = [
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
      render: (agentType: string) => (
        <Tag>{t(`agent.${agentType}`)}</Tag>
      ),
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

  return (
    <div className="page-stack">
      <PageHeader
        title={t('exc.title')}
        description={t('exc.description')}
      />

      {/* 概览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('exc.pending')}
              value={pendingCount}
              valueStyle={{ color: '#ea580c' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('exc.critical')}
              value={criticalCount}
              valueStyle={{ color: '#dc2626' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('exc.autoProcessed')}
              value={agentLogData.filter((l) => l.result === 'success' || l.result === 'auto_resolved').length}
              valueStyle={{ color: '#16a34a' }}
              prefix={<CheckCircleOutlined />}
              suffix={<Typography.Text type="secondary" style={{ fontSize: 12 }}>/ {agentLogData.length}</Typography.Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('exc.escalated')}
              value={agentLogData.filter((l) => l.result === 'escalated' || l.result === 'blocked').length}
              valueStyle={{ color: '#7c3aed' }}
              prefix={<DashOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="exceptions"
        items={[
          {
            key: 'exceptions',
            label: (
              <span>
                <AlertOutlined /> {t('exc.exceptionsTab')}
                {pendingCount > 0 && <Badge count={pendingCount} size="small" offset={[6, -4]} style={{ marginLeft: 6 }} />}
              </span>
            ),
            children: (
              <>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <Segmented
                    size="small"
                    value={agentFilter}
                    onChange={(v) => setAgentFilter(v as string)}
                    options={[
                      { label: t('exc.allAgents'), value: 'all' },
                      ...ALL_AGENT_TYPES.map((at) => ({ label: at, value: at })),
                    ]}
                  />
                  <Segmented
                    size="small"
                    value={filter}
                    onChange={(v) => setFilter(v as ExceptionStatus)}
                    options={[
                      { label: `${t('exc.pending')} (${pendingCount})`, value: 'pending' },
                      { label: t('exc.resolvedFilter'), value: 'resolved' },
                      { label: t('exc.ignoredFilter'), value: 'ignored' },
                      { label: t('exc.all'), value: 'all' },
                    ]}
                  />
                </div>
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={filtered}
                  pagination={false}
                  size="small"
                />
              </>
            ),
          },
          {
            key: 'log',
            label: <span><EyeOutlined /> {t('exc.agentLogTab')}</span>,
            children: (
              <Card>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  {t('exc.agentLogDesc')}
                </Typography.Paragraph>
                <Table
                  rowKey="id"
                  columns={logColumns}
                  dataSource={agentLogData}
                  pagination={false}
                  size="small"
                />
              </Card>
            ),
          },
        ]}
      />

      {/* 异常详情弹窗 */}
      <Modal
        title={detailItem ? `${typeLabel(detailItem.type)} · ${detailItem.title}` : ''}
        open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        width={560}
        footer={
          detailItem ? (
            <Space>
              <Button onClick={() => setDetailItem(null)}>{t('common.close')}</Button>
              {!detailItem.resolved && !detailItem.ignored && (
                <>
                  <Button icon={<MinusCircleOutlined />} onClick={() => ignoreItem(detailItem.id)}>
                    {t('exc.ignore')}
                  </Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => resolveItem(detailItem.id)}>
                    {t('exc.resolve')}
                  </Button>
                </>
              )}
              {detailItem.ignored && (
                <Button type="primary" icon={<UndoOutlined />} onClick={() => { unignoreItem(detailItem.id); setDetailItem(null); }}>
                  {t('exc.unignore')}
                </Button>
              )}
            </Space>
          ) : (
            <Button onClick={() => setDetailItem(null)}>{t('common.close')}</Button>
          )
        }
      >
        {detailItem && (
          <>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('exc.level')}>
                <Tag color={levelColors[detailItem.level]}>{t(`exc.${detailItem.level}`)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('exc.store')}>{detailItem.storeName}</Descriptions.Item>
              <Descriptions.Item label={t('exc.agent')}>{detailItem.agentType}</Descriptions.Item>
              <Descriptions.Item label={t('exc.createdAt')}>{detailItem.createdAt}</Descriptions.Item>
              {detailItem.ignored && (
                <Descriptions.Item label={t('exc.ignoredStatus')}>
                  <Tag color="default">{t('exc.ignoredStatus')}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 负责人分配 */}
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>{t('exc.assignee')}</Typography.Text>
              <Space>
                <Select
                  style={{ width: 160 }}
                  placeholder={t('exc.assignee')}
                  value={assigneeModal}
                  onChange={(v) => setAssigneeModal(v)}
                  allowClear
                  options={ASSIGNEE_OPTIONS.map((name) => ({ label: name, value: name }))}
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    if (assigneeModal) {
                      assignItem(detailItem.id, assigneeModal);
                    }
                  }}
                >
                  {t('exc.assign')}
                </Button>
              </Space>
            </div>

            <Divider />
            <Typography.Title level={5}>{t('exc.detail')}</Typography.Title>
            <Typography.Paragraph>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{detailItem.detail}</pre>
            </Typography.Paragraph>
            <Divider />
            <Typography.Title level={5}>{t('exc.suggestedAction')}</Typography.Title>
            <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #dbeafe' }}>
              <Typography.Text>{detailItem.suggestedAction}</Typography.Text>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
}
