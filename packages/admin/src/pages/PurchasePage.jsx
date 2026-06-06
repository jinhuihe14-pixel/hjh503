import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Modal, Form, Select, InputNumber, Input, Space, Popconfirm, Divider } from 'antd';
import { PlusOutlined, ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { getPurchaseOrders, createPurchaseOrder, receivePurchaseOrder, generateAutoPurchase } from '../api/purchase';
import { getMaterials } from '../api/material';
import dayjs from 'dayjs';

const PurchasePage = () => {
  const [list, setList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [autoPurchaseData, setAutoPurchaseData] = useState(null);
  const [autoModalVisible, setAutoModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ materialId: null, name: '', quantity: 0, unitPrice: 0 }]);

  useEffect(() => {
    fetchList();
    fetchMaterials();
  }, [pagination.current, pagination.pageSize]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.current, pageSize: pagination.pageSize };
      const data = await getPurchaseOrders(params);
      setList(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch purchase orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials({ pageSize: 100 });
      setMaterials(data.list);
    } catch (error) {
      console.error('Fetch materials error:', error);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleAdd = () => {
    setItems([{ materialId: null, name: '', quantity: 0, unitPrice: 0 }]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAutoGenerate = async () => {
    try {
      const data = await generateAutoPurchase();
      setAutoPurchaseData(data);
      setAutoModalVisible(true);
    } catch (error) {
      console.error('Generate auto purchase error:', error);
    }
  };

  const handleAutoCreate = async () => {
    try {
      await createPurchaseOrder({
        items: autoPurchaseData.items,
        supplier: '自动生成采购单',
      });
      message.success('创建成功');
      setAutoModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('Create purchase order error:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { materialId: null, name: '', quantity: 0, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'materialId') {
      const material = materials.find(m => m.id === value);
      if (material) {
        newItems[index].name = material.name;
        newItems[index].unit = material.unit;
      }
    }
    newItems[index].totalAmount = newItems[index].quantity * newItems[index].unitPrice;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const validItems = items.filter(item => item.materialId && item.quantity > 0);
      if (validItems.length === 0) {
        message.error('请至少添加一种花材');
        return;
      }
      await createPurchaseOrder({
        ...values,
        items: validItems,
      });
      message.success('创建成功');
      setModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('Create purchase order error:', error);
    }
  };

  const handleReceive = async (record) => {
    try {
      await receivePurchaseOrder(record.id);
      message.success('入库成功');
      fetchList();
    } catch (error) {
      console.error('Receive purchase order error:', error);
    }
  };

  const statusMap = {
    pending: { color: 'orange', text: '待采购' },
    ordered: { color: 'blue', text: '已下单' },
    received: { color: 'green', text: '已入库' },
    cancelled: { color: 'default', text: '已取消' },
  };

  const columns = [
    { title: '采购单号', dataIndex: 'purchaseNo', key: 'purchaseNo', width: 140 },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 120 },
    {
      title: '采购明细',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items?.slice(0, 3).map((item, i) => (
            <div key={i} style={{ fontSize: 12 }}>
              {item.name} × {item.quantity}{item.unit}
            </div>
          ))}
          {items?.length > 3 && <div style={{ fontSize: 12, color: '#999' }}>...共{items.length}种</div>}
        </div>
      ),
    },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 100, render: (v) => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => {
        const status = statusMap[s] || { color: 'default', text: s };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        record.status === 'pending' || record.status === 'ordered' ? (
          <Button type="link" size="small" onClick={() => handleReceive(record)}>入库</Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">采购管理</div>
        <Space>
          <Button icon={<ThunderboltOutlined />} onClick={handleAutoGenerate}>
            智能补货
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增采购单
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title="新增采购单"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="supplier" label="供应商">
            <Input placeholder="请输入供应商" />
          </Form.Item>
          <Form.Item label="采购明细">
            <div>
              {items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <Select
                    style={{ flex: 2 }}
                    placeholder="选择花材"
                    value={item.materialId}
                    showSearch
                    optionFilterProp="children"
                    onChange={(val) => updateItem(index, 'materialId', val)}
                  >
                    {materials.map(m => (
                      <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
                    ))}
                  </Select>
                  <InputNumber
                    style={{ flex: 1 }}
                    placeholder="数量"
                    value={item.quantity}
                    min={0}
                    onChange={(val) => updateItem(index, 'quantity', val)}
                  />
                  <InputNumber
                    style={{ flex: 1 }}
                    placeholder="单价"
                    value={item.unitPrice}
                    min={0}
                    prefix="¥"
                    onChange={(val) => updateItem(index, 'unitPrice', val)}
                  />
                  <Button type="text" danger onClick={() => removeItem(index)}>删除</Button>
                </div>
              ))}
              <Button type="dashed" onClick={addItem} block icon={<PlusOutlined />}>
                添加花材
              </Button>
            </div>
          </Form.Item>
          <Form.Item name="expectedDate" label="预计到货日期">
            <Input type="date" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="智能补货清单"
        open={autoModalVisible}
        onOk={handleAutoCreate}
        onCancel={() => setAutoModalVisible(false)}
        okText="生成采购单"
      >
        <div style={{ marginBottom: 16 }}>
          系统自动检测到 {autoPurchaseData?.items?.length || 0} 种花材库存低于安全线
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {autoPurchaseData?.items?.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span>{item.name}</span>
              <span>{item.quantity} {item.unit} - ¥{item.totalAmount?.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, textAlign: 'right', fontWeight: 600 }}>
          预计总金额：¥{autoPurchaseData?.totalAmount?.toFixed(2) || 0}
        </div>
      </Modal>
    </div>
  );
};

export default PurchasePage;
