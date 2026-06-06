import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, stockIn, getLowStockMaterials } from '../api/material';
import { Search from 'antd/es/transfer/search';

const MaterialPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();
  const [lowStockWarning, setLowStockWarning] = useState([]);

  useEffect(() => {
    fetchMaterials();
    fetchLowStock();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const data = await getMaterials(params);
      setMaterials(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch materials error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const data = await getLowStockMaterials();
      setLowStockWarning(data);
    } catch (error) {
      console.error('Fetch low stock error:', error);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleSearch = (e) => {
    setFilters({ keyword: e.target.value });
    setPagination(p => ({ ...p, current: 1 }));
  };

  const handleAdd = () => {
    setModalType('add');
    setCurrentMaterial(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalType('edit');
    setCurrentMaterial(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalType === 'add') {
        await createMaterial(values);
        message.success('创建成功');
      } else {
        await updateMaterial(currentMaterial.id, values);
        message.success('更新成功');
      }
      setModalVisible(false);
      fetchMaterials();
    } catch (error) {
      console.error('Submit material error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id);
      message.success('删除成功');
      fetchMaterials();
    } catch (error) {
      console.error('Delete material error:', error);
    }
  };

  const handleStockIn = (record) => {
    setCurrentMaterial(record);
    stockForm.resetFields();
    setStockModalVisible(true);
  };

  const handleStockInSubmit = async () => {
    try {
      const values = await stockForm.validateFields();
      await stockIn({
        materialId: currentMaterial.id,
        ...values,
      });
      message.success('入库成功');
      setStockModalVisible(false);
      fetchMaterials();
      fetchLowStock();
    } catch (error) {
      console.error('Stock in error:', error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '花材名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '规格', dataIndex: 'spec', key: 'spec', width: 100 },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      render: (v, record) => {
        const isLow = parseFloat(v) <= parseFloat(record.safetyStock);
        return (
          <span style={{ color: isLow ? '#ff4d4f' : '#000', fontWeight: isLow ? 600 : 400 }}>
            {v} {record.unit}
            {isLow && <Tag color="red" style={{ marginLeft: 8 }}>低库存</Tag>}
          </span>
        );
      },
    },
    { title: '安全库存', dataIndex: 'safetyStock', key: 'safetyStock', width: 100 },
    { title: '平均成本', dataIndex: 'averageCost', key: 'averageCost', width: 100, render: (v) => `¥${v}` },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<InboxOutlined />} onClick={() => handleStockIn(record)}>入库</Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">花材管理</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增花材</Button>
      </div>

      {lowStockWarning.length > 0 && (
        <div style={{ padding: 12, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4, marginBottom: 16 }}>
          <span style={{ color: '#ff4d4f', fontWeight: 500 }}>
            ⚠️ 低库存预警 ({lowStockWarning.length} 种花材库存不足安全线)：
            {lowStockWarning.slice(0, 5).map((m, i) => (
              <span key={m.id} style={{ marginLeft: 8 }}>
                {m.name}（{m.currentStock}/{m.safetyStock}{m.unit}
                {i < Math.min(lowStockWarning.length, 5) - 1 ? '、' : ''}
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="table-toolbar">
        <Input.Search
          placeholder="搜索花材名称"
          allowClear
          style={{ width: 240 }}
          onSearch={handleSearch}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={materials}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={modalType === 'add' ? '新增花材' : '编辑花材'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="花材名称" rules={[{ required: true }]}>
            <Input placeholder="请输入花材名称" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="请选择分类">
              <Select.Option value="鲜花">鲜花</Select.Option>
              <Select.Option value="配花">配花</Select.Option>
              <Select.Option value="叶材">叶材</Select.Option>
              <Select.Option value="包装材料">包装材料</Select.Option>
              <Select.Option value="辅材">辅材</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="unit" label="单位" rules={[{ required: true }]}>
            <Input placeholder="如：支、扎、张、米" />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input placeholder="规格说明" />
          </Form.Item>
          <Form.Item name="safetyStock" label="安全库存">
            <InputNumber style={{ width: '100%' }} placeholder="请输入安全库存" />
          </Form.Item>
          <Form.Item name="currentStock" label="当前库存">
            <InputNumber style={{ width: '100%' }} placeholder="请输入当前库存" />
          </Form.Item>
          <Form.Item name="averageCost" label="平均成本">
            <InputNumber style={{ width: '100%' }} placeholder="请输入平均成本" />
          </Form.Item>
          <Form.Item name="supplier" label="供应商">
            <Input placeholder="供应商名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="花材入库"
        open={stockModalVisible}
        onOk={handleStockInSubmit}
        onCancel={() => setStockModalVisible(false)}
      >
        <Form form={stockForm} layout="vertical">
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <div>花材：{currentMaterial?.name}</div>
            <div>当前库存：{currentMaterial?.currentStock} {currentMaterial?.unit}</div>
          </div>
          <Form.Item name="quantity" label="入库数量" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="请输入入库数量" min={0} />
          </Form.Item>
          <Form.Item name="unitPrice" label="单价" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="请输入单价" min={0} prefix="¥" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialPage;
