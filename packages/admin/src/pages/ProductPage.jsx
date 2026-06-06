import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/product';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const data = await getProducts(params);
      setProducts(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleCategoryChange = (value) => {
    setFilters({ category: value || undefined });
    setPagination(p => ({ ...p, current: 1 }));
  };

  const handleAdd = () => {
    setModalType('add');
    setCurrentProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalType('edit');
    setCurrentProduct(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalType === 'add') {
        await createProduct(values);
        message.success('创建成功');
      } else {
        await updateProduct(currentProduct.id, values);
        message.success('更新成功');
      }
      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error('Submit product error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success('删除成功');
      fetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  const categoryMap = {
    daily: { color: 'blue', text: '日常零售' },
    festival: { color: 'orange', text: '节日预定' },
    wedding: { color: 'purple', text: '婚礼花艺' },
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '产品名称', dataIndex: 'name', key: 'name' },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (c) => {
        const cat = categoryMap[c] || { color: 'default', text: c };
        return <Tag color={cat.color}>{cat.text}</Tag>;
      },
    },
    { title: '售价', dataIndex: 'price', key: 'price', width: 100, render: (v) => `¥${v}` },
    { title: '计件单价', dataIndex: 'pieceRate', key: 'pieceRate', width: 100, render: (v) => `¥${v}` },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => v === 'active' ? <Tag color="green">上架</Tag> : <Tag color="default">下架</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space size="small">
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
        <div className="page-title">花束产品</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增产品</Button>
      </div>

      <div className="table-toolbar">
        <Select
          placeholder="全部类型"
          allowClear
          style={{ width: 150 }}
          onChange={handleCategoryChange}
        >
          <Select.Option value="daily">日常零售</Select.Option>
          <Select.Option value="festival">节日预定</Select.Option>
          <Select.Option value="wedding">婚礼花艺</Select.Option>
        </Select>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={modalType === 'add' ? '新增产品' : '编辑产品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="产品名称" rules={[{ required: true }]}>
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item name="category" label="产品分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              <Select.Option value="daily">日常零售</Select.Option>
              <Select.Option value="festival">节日预定</Select.Option>
              <Select.Option value="wedding">婚礼花艺</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="产品描述">
            <Input.TextArea rows={3} placeholder="请输入产品描述" />
          </Form.Item>
          <Form.Item name="price" label="售价" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} prefix="¥" min={0} />
          </Form.Item>
          <Form.Item name="pieceRate" label="计件单价">
            <InputNumber style={{ width: '100%' }} prefix="¥" min={0} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="active">上架</Select.Option>
              <Select.Option value="inactive">下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;
