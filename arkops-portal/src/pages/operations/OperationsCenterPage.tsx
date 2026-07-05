import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  WalletOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useI18n } from '../../app/i18n';
import { PageHeader } from '../../components/PageHeader';

interface CostItem {
  id: string;
  storeName: string;
  category: 'advertising' | 'logistics' | 'platform_fee' | 'packing' | 'refund_loss' | 'other';
  amount: number;
  date: string;
  note: string;
}

interface ProductSimple {
  id: string;
  storeName: string;
  sku: string;
  name: string;
  cost: number;
  sellingPrice: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'draft' | 'pending_review';
  draftBy?: string;
  draftAt?: string;
}

const initialCosts: CostItem[] = [
  { id: 'cost_001', storeName: 'TikTok Shop 美国旗舰店', category: 'advertising', amount: 3840, date: '2026-06-15', note: '6月上半月广告投放' },
  { id: 'cost_002', storeName: 'TikTok Shop 美国旗舰店', category: 'logistics', amount: 1250, date: '2026-06-15', note: 'FBA 仓储费' },
  { id: 'cost_003', storeName: 'TikTok Shop 美国旗舰店', category: 'platform_fee', amount: 1860, date: '2026-06-15', note: '平台佣金 6%' },
  { id: 'cost_004', storeName: 'Amazon 户外用品店', category: 'advertising', amount: 2100, date: '2026-06-15', note: '6月 PPC 广告' },
  { id: 'cost_005', storeName: 'Amazon 户外用品店', category: 'packing', amount: 480, date: '2026-06-15', note: '定制包装材料' },
  { id: 'cost_006', storeName: 'Amazon 户外用品店', category: 'refund_loss', amount: 620, date: '2026-06-15', note: '退货损耗' },
  { id: 'cost_007', storeName: 'Shopify 独立站', category: 'advertising', amount: 950, date: '2026-06-15', note: 'Google Ads' },
  { id: 'cost_008', storeName: 'Shopify 独立站', category: 'other', amount: 300, date: '2026-06-15', note: '域名/插件订阅' },
];

const initialProducts: ProductSimple[] = [
  { id: 'prod_001', storeName: 'TikTok Shop 美国旗舰店', sku: 'BT-E01', name: '蓝牙耳机 Pro', cost: 18.5, sellingPrice: 39.99, stock: 420, status: 'active' },
  { id: 'prod_002', storeName: 'TikTok Shop 美国旗舰店', sku: 'BT-E02', name: '运动挂脖耳机', cost: 12.0, sellingPrice: 24.99, stock: 180, status: 'active' },
  { id: 'prod_003', storeName: 'TikTok Shop 美国旗舰店', sku: 'CK-C01', name: '65W GaN 充电器', cost: 8.2, sellingPrice: 19.99, stock: 35, status: 'out_of_stock' },
  { id: 'prod_004', storeName: 'Amazon 户外用品店', sku: 'OG-T01', name: '折叠露营椅', cost: 22.0, sellingPrice: 49.99, stock: 210, status: 'active' },
  { id: 'prod_005', storeName: 'Amazon 户外用品店', sku: 'OG-L01', name: 'LED 露营灯', cost: 6.5, sellingPrice: 15.99, stock: 95, status: 'active' },
  { id: 'prod_006', storeName: 'Amazon 户外用品店', sku: 'OG-B01', name: '户外登山包 40L', cost: 18.0, sellingPrice: 45.99, stock: 0, status: 'inactive' },
  { id: 'prod_007', storeName: 'Shopify 独立站', sku: 'SF-C01', name: '定制手机壳', cost: 3.5, sellingPrice: 12.99, stock: 520, status: 'active' },
  { id: 'prod_008', storeName: 'TikTok Shop 美国旗舰店', sku: 'BT-N01', name: '便携式野营炉', cost: 14.2, sellingPrice: 35.99, stock: 0, status: 'draft', draftBy: '商品上架 Agent', draftAt: '2026-06-21 07:45' },
  { id: 'prod_009', storeName: 'Amazon 户外用品店', sku: 'OG-N01', name: '超轻登山杖一对', cost: 8.5, sellingPrice: 29.99, stock: 0, status: 'draft', draftBy: '商品上架 Agent', draftAt: '2026-06-21 06:30' },
  { id: 'prod_010', storeName: 'TikTok Shop 美国旗舰店', sku: 'BT-N02', name: '骨传导运动耳机', cost: 22.0, sellingPrice: 49.99, stock: 0, status: 'pending_review', draftBy: '商品上架 Agent', draftAt: '2026-06-20 15:00' },
];

const storeNames = ['TikTok Shop 美国旗舰店', 'Amazon 户外用品店', 'Shopify 独立站'];

export function OperationsCenterPage() {
  const { t } = useI18n();
  const [costs, setCosts] = useState<CostItem[]>(initialCosts);
  const [products, setProducts] = useState<ProductSimple[]>(initialProducts);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<CostItem | null>(null);
  const [costForm] = Form.useForm();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [productEditModalOpen, setProductEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductSimple | null>(null);
  const [productEditForm] = Form.useForm();

  const categoryOptions = [
    { value: 'advertising', label: t('ops.costAd'), color: 'blue' },
    { value: 'logistics', label: t('ops.costLogistics'), color: 'cyan' },
    { value: 'platform_fee', label: t('ops.costPlatform'), color: 'orange' },
    { value: 'packing', label: t('ops.costPacking'), color: 'purple' },
    { value: 'refund_loss', label: t('ops.costRefund'), color: 'red' },
    { value: 'other', label: t('ops.costOther'), color: 'default' },
  ];

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      advertising: t('ops.costAd'),
      logistics: t('ops.costLogistics'),
      platform_fee: t('ops.costPlatform'),
      packing: t('ops.costPacking'),
      refund_loss: t('ops.costRefund'),
      other: t('ops.costOther'),
    };
    return map[cat] ?? cat;
  };

  const categoryColor = (cat: string) => categoryOptions.find((c) => c.value === cat)?.color ?? 'default';

  const filteredCosts = selectedStore ? costs.filter((c) => c.storeName === selectedStore) : costs;
  const filteredProducts = selectedStore ? products.filter((p) => p.storeName === selectedStore) : products;

  const totalCost = filteredCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
  const totalCostPrice = filteredProducts.reduce((sum, p) => sum + p.cost * p.stock, 0);

  const openAddCost = () => {
    setEditingCost(null);
    costForm.resetFields();
    setCostModalOpen(true);
  };

  const openEditCost = (item: CostItem) => {
    setEditingCost(item);
    costForm.setFieldsValue({
      storeName: item.storeName,
      category: item.category,
      amount: item.amount,
      date: dayjs(item.date),
      note: item.note,
    });
    setCostModalOpen(true);
  };

  const deleteCost = (id: string) => {
    setCosts((prev) => prev.filter((c) => c.id !== id));
    message.success(t('ops.costDeleted'));
  };

  const handleCostSubmit = () => {
    costForm.validateFields().then((values) => {
      if (editingCost) {
        setCosts((prev) =>
          prev.map((c) =>
            c.id === editingCost.id
              ? { ...c, ...values, date: values.date.format('YYYY-MM-DD') }
              : c
          )
        );
        message.success(t('ops.costUpdated'));
      } else {
        const newCost: CostItem = {
          id: `cost_${Date.now()}`,
          ...values,
          date: values.date.format('YYYY-MM-DD'),
        };
        setCosts((prev) => [newCost, ...prev]);
        message.success(t('ops.costAdded'));
      }
      setCostModalOpen(false);
      costForm.resetFields();
    });
  };

  const approveDraft = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'active', stock: 100 } : p))
    );
    message.success(t('ops.draftApproved'));
  };

  const rejectDraft = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'inactive' } : p))
    );
    message.success(t('ops.draftRejected'));
  };

  const openEditProduct = (product: ProductSimple) => {
    setEditingProduct(product);
    productEditForm.setFieldsValue({
      name: product.name,
      cost: product.cost,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
    });
    setProductEditModalOpen(true);
  };

  const handleProductEditSubmit = () => {
    productEditForm.validateFields().then((values) => {
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, name: values.name, cost: values.cost, sellingPrice: values.sellingPrice, stock: values.stock }
              : p
          )
        );
        message.success(t('ops.productUpdated'));
      }
      setProductEditModalOpen(false);
      productEditForm.resetFields();
    });
  };

  const costColumns: ColumnsType<CostItem> = [
    {
      title: t('ops.store'),
      dataIndex: 'storeName',
      width: 180,
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: t('ops.costCategory'),
      dataIndex: 'category',
      width: 120,
      render: (cat: string) => <Tag color={categoryColor(cat)}>{categoryLabel(cat)}</Tag>,
    },
    {
      title: t('ops.amount'),
      dataIndex: 'amount',
      width: 120,
      align: 'right',
      render: (v: number) => (
        <Typography.Text strong style={{ color: '#dc2626' }}>
          ${v.toLocaleString()}
        </Typography.Text>
      ),
    },
    {
      title: t('ops.date'),
      dataIndex: 'date',
      width: 110,
    },
    {
      title: t('ops.note'),
      dataIndex: 'note',
      ellipsis: true,
    },
    {
      title: t('ops.actions'),
      width: 120,
      render: (_: unknown, record: CostItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditCost(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteCost(record.id)} />
        </Space>
      ),
    },
  ];

  const productColumns: ColumnsType<ProductSimple> = [
    {
      title: t('ops.store'),
      dataIndex: 'storeName',
      width: 180,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: 100,
    },
    {
      title: t('ops.productName'),
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: t('ops.costPrice'),
      dataIndex: 'cost',
      width: 100,
      align: 'right',
      render: (v: number) => `$${v.toFixed(2)}`,
    },
    {
      title: t('ops.sellingPrice'),
      dataIndex: 'sellingPrice',
      width: 100,
      align: 'right',
      render: (v: number) => `$${v.toFixed(2)}`,
    },
    {
      title: t('ops.margin'),
      width: 90,
      align: 'right',
      render: (_: unknown, r: ProductSimple) => {
        const m = r.sellingPrice > 0 ? Math.round(((r.sellingPrice - r.cost) / r.sellingPrice) * 100) : 0;
        return <Typography.Text style={{ color: m > 30 ? '#16a34a' : m > 10 ? '#ea580c' : '#dc2626' }}>{m}%</Typography.Text>;
      },
    },
    {
      title: t('ops.stock'),
      dataIndex: 'stock',
      width: 80,
      align: 'right',
      render: (v: number) => (
        <Tag color={v <= 0 ? 'red' : v < 50 ? 'orange' : 'green'}>{v}</Tag>
      ),
    },
    {
      title: t('ops.status'),
      dataIndex: 'status',
      width: 120,
      render: (s: string, record: ProductSimple) => {
        const colors: Record<string, string> = { active: 'green', inactive: 'default', out_of_stock: 'red', draft: 'blue', pending_review: 'orange' };
        return (
          <Space>
            <Tag color={colors[s]}>{t(`ops.${s}`)}</Tag>
            {(s === 'draft' || s === 'pending_review') && (
              <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                {record.draftBy}
              </Typography.Text>
            )}
          </Space>
        );
      },
    },
    {
      title: t('common.actions'),
      width: 140,
      render: (_: unknown, record: ProductSimple) => {
        if (record.status === 'draft' || record.status === 'pending_review') {
          return (
            <Space>
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => approveDraft(record.id)}>
                {t('ops.approve')}
              </Button>
              <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => rejectDraft(record.id)}>
                {t('ops.reject')}
              </Button>
            </Space>
          );
        }
        if (record.status === 'active' || record.status === 'inactive') {
          return (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditProduct(record)}>
              {t('ops.editProduct')}
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title={t('ops.title')}
        description={t('ops.description')}
      />

      {/* 概览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t('ops.totalCost')}
              value={totalCost}
              prefix="$"
              valueStyle={{ color: '#dc2626' }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {filteredCosts.length} {t('ops.items')}
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t('ops.totalCostPrice')}
              value={totalCostPrice}
              prefix="$"
              valueStyle={{ color: '#ea580c' }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {filteredProducts.length} {t('ops.skuCount')}
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t('ops.potentialRevenue')}
              value={totalRevenue}
              prefix="$"
              valueStyle={{ color: '#16a34a' }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {t('ops.marginRate')}: {totalRevenue > 0 ? Math.round(((totalRevenue - totalCostPrice) / totalRevenue) * 100) : 0}%
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      {/* 店铺筛选 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Select
          allowClear
          placeholder={t('ops.filterStore')}
          style={{ width: 200 }}
          value={selectedStore}
          onChange={setSelectedStore}
          options={storeNames.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <Tabs
        defaultActiveKey="cost"
        items={[
          {
            key: 'cost',
            label: <><DollarOutlined /> {t('ops.costManagement')}</>,
            children: (
              <Card
                title={<><WalletOutlined /> {t('ops.costList')}</>}
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAddCost}>{t('ops.addCost')}</Button>}
              >
                <Table
                  rowKey="id"
                  columns={costColumns}
                  dataSource={filteredCosts}
                  pagination={false}
                  size="small"
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Typography.Text strong>{t('ops.totalCost')}</Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Typography.Text strong style={{ color: '#dc2626' }}>
                          ${totalCost.toLocaleString()}
                        </Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={3} />
                    </Table.Summary.Row>
                  )}
                />
              </Card>
            ),
          },
          {
            key: 'products',
            label: <><ShoppingCartOutlined /> {t('ops.productList')}</>,
            children: (
              <Card>
                <Table
                  rowKey="id"
                  columns={productColumns}
                  dataSource={filteredProducts}
                  pagination={false}
                  size="small"
                />
              </Card>
            ),
          },
        ]}
      />

      {/* 添加/编辑成本弹窗 */}
      <Modal
        title={editingCost ? t('ops.editCost') : t('ops.addCost')}
        open={costModalOpen}
        onOk={handleCostSubmit}
        onCancel={() => { setCostModalOpen(false); costForm.resetFields(); }}
        width={480}
      >
        <Form form={costForm} layout="vertical">
          <Form.Item label={t('ops.store')} name="storeName" rules={[{ required: true }]}>
            <Select options={storeNames.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item label={t('ops.costCategory')} name="category" rules={[{ required: true }]}>
            <Select options={categoryOptions.map((c) => ({ value: c.value, label: c.label }))} />
          </Form.Item>
          <Form.Item label={t('ops.amount')} name="amount" rules={[{ required: true }]}>
            <InputNumber min={0} step={10} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item label={t('ops.date')} name="date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={t('ops.note')} name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑产品弹窗 */}
      <Modal
        title={t('ops.editProductTitle')}
        open={productEditModalOpen}
        onOk={handleProductEditSubmit}
        onCancel={() => { setProductEditModalOpen(false); productEditForm.resetFields(); }}
        width={480}
      >
        <Form form={productEditForm} layout="vertical">
          <Form.Item label={t('ops.productName')} name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('ops.costPrice')} name="cost" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item label={t('ops.sellingPrice')} name="sellingPrice" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item label={t('ops.stock')} name="stock" rules={[{ required: true }]}>
            <InputNumber min={0} step={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
