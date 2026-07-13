import { CheckCircleOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Divider, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import type { AllMallId, Task } from '../../types/domain';
import type { ProductDraft } from './agentConfigMockData';
import { useI18n } from '../../app/i18n';

interface ProductDraftPreviewProps {
  draft: ProductDraft;
  task: Task;
  onRegenerate: (taskId: AllMallId) => void;
  onCancel: (taskId: AllMallId) => void;
}

export function ProductDraftPreview({ draft, task, onRegenerate, onCancel }: ProductDraftPreviewProps) {
  const { t } = useI18n();
  const canRegenerate = task.status === 'queued' || task.status === 'draft';

  return (
    <div style={{ padding: 8, overflow: 'hidden', maxWidth: '100%' }}>
      <Row gutter={[16, 12]}>
        <Col span={24}>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('draft.productName')}</Typography.Text>
          <Typography.Text strong style={{ display: 'block', fontSize: 14, wordBreak: 'break-word' }}>{draft.productName}</Typography.Text>
          <Space size="small" style={{ marginTop: 2 }}>
            <Tag color="blue">{draft.platform}</Tag>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>{draft.category}</Typography.Text>
          </Space>
        </Col>

        <Col xs={24} md={14} style={{ minWidth: 0 }}>
          <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>{t('draft.skuInfo')}</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
            <Table
              rowKey="skuCode"
              dataSource={draft.skus}
              pagination={false}
              size="small"
              columns={[
                { title: t('draft.spec'), dataIndex: 'spec', width: 160, ellipsis: true },
                { title: t('draft.skuCode'), dataIndex: 'skuCode', width: 120, ellipsis: true, render: (value: string) => <Typography.Text code style={{ fontSize: 11 }}>{value}</Typography.Text> },
                { title: t('draft.price'), dataIndex: 'price', width: 80, align: 'right' as const, render: (value: number) => <Typography.Text strong>${value.toFixed(2)}</Typography.Text> },
                { title: t('draft.stock'), dataIndex: 'stock', width: 70, align: 'right' as const },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} md={10} style={{ minWidth: 0 }}>
          <Space direction="vertical" size={12} style={{ width: '100%', minWidth: 0 }}>
            <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>{t('draft.priceSystem')}</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
              <Row gutter={8}>
                <Col span={8}><Statistic title={t('draft.costPrice')} value={draft.costPrice} prefix="$" precision={2} valueStyle={{ fontSize: 16 }} /></Col>
                <Col span={8}><Statistic title={t('draft.sellingPrice')} value={draft.sellingPrice} prefix="$" precision={2} valueStyle={{ fontSize: 16, color: '#2563eb' }} /></Col>
                <Col span={8}><Statistic title={t('draft.grossMargin')} value={((draft.sellingPrice - draft.costPrice) / draft.sellingPrice * 100).toFixed(0)} suffix="%" valueStyle={{ fontSize: 16, color: '#16a34a' }} /></Col>
              </Row>
            </Card>
            <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>{t('draft.inventoryLogistics')}</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('draft.totalStock')}>{draft.totalStock} {t('draft.units')}</Descriptions.Item>
                <Descriptions.Item label={t('draft.weight')}>{draft.weight}</Descriptions.Item>
                <Descriptions.Item label={t('draft.dimensions')}>{draft.dimensions}</Descriptions.Item>
                <Descriptions.Item label={t('draft.shippingFrom')}>{draft.shippingFrom}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>

        <Col xs={24} md={12} style={{ minWidth: 0 }}>
          <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>{t('draft.genericAttrs')}</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
            <Descriptions column={2} size="small">
              {draft.genericAttrs.map((attribute) => (
                <Descriptions.Item key={attribute.label} label={attribute.label}>{attribute.value}</Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={12} style={{ minWidth: 0 }}>
          <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>{t('draft.categoryAttrs')}</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
            <Descriptions column={2} size="small">
              {draft.categoryAttrs.map((attribute) => (
                <Descriptions.Item key={attribute.label} label={attribute.label}>{attribute.value}</Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        </Col>

        <Col span={24}>
          <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>{t('draft.mediaAssets')}</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
            <Row gutter={[16, 8]}>
              <Col xs={12} sm={6}><Statistic title={t('draft.mainImages')} value={`${draft.mainImages} ${t('draft.imagesUnit')}`} valueStyle={{ fontSize: 14 }} /></Col>
              <Col xs={12} sm={6}><Statistic title={t('draft.skuImages')} value={`${draft.skuImages} ${t('draft.imagesUnit')}`} valueStyle={{ fontSize: 14 }} /></Col>
              <Col xs={12} sm={6}><Statistic title={t('draft.detailImages')} value={`${draft.detailImages} ${t('draft.imagesUnit')}`} valueStyle={{ fontSize: 14 }} /></Col>
              <Col xs={12} sm={6}>
                <Statistic title={t('draft.shortVideo')} value={draft.hasVideo ? t('draft.videoGenerated') : t('draft.videoNotGenerated')} valueStyle={{ fontSize: 14, color: draft.hasVideo ? '#16a34a' : '#94a3b8' }} />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>{t('draft.aiCopyTitle')}</Typography.Text>} style={{ background: '#f0f5ff', borderLeft: '3px solid #2563eb', maxWidth: '100%' }}>
            <Space direction="vertical" size={4} style={{ width: '100%', maxWidth: '100%' }}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('draft.seoTitle')}</Typography.Text>
                <Typography.Paragraph code style={{ fontSize: 12, margin: '2px 0', wordBreak: 'break-all' }}>{draft.seoTitle}</Typography.Paragraph>
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('draft.sellingPoints')}</Typography.Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                  {draft.sellingPoints.map((sellingPoint, index) => (
                    <Tag key={index} color="purple" style={{ fontSize: 11 }}>{sellingPoint}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('draft.detailDescription')}</Typography.Text>
                <Typography.Paragraph style={{ fontSize: 12, margin: '2px 0', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{draft.description}</Typography.Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '12px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        {canRegenerate ? (
          <Button size="small" icon={<ReloadOutlined />} onClick={() => onRegenerate(task.id)}>
            {t('draft.regenerate')}
          </Button>
        ) : null}
        <Button size="small" danger icon={<StopOutlined />} onClick={() => onCancel(task.id)}>
          {t('draft.cancel')}
        </Button>
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => { message.success(t('draft.submitted', { name: draft.productName })); }}
        >
          {t('draft.confirmList')}
        </Button>
      </div>
    </div>
  );
}
