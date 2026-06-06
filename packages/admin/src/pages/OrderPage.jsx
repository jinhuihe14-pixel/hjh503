import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Select, DatePicker, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getOrders, assignOrder, updateOrderStatus, cancelOrder } from '../api/order';
import { getFlorists } from '../api/user';
import dayjs from 'dayjs';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({});
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [florists, setFlorists] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchOrders();
    fetchFlorists();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const data = await getOrders(params);
      setOrders(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlorists = async () => {
    try {
      const data = await getFlorists();
      setFlorists(data);
    } catch (error) {
      console.error('Fetch florists error:', error);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleSearch = (values) => {
    setFilters({
      ...values,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
    });
    setPagination(p => ({ ...p, current: 1 }));
  };

  const handleAssign = (order) => {
    setCurrentOrder(order);
    form.setFieldsValue({ floristId: order.floristId });
    setAssignModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    try {
      const values = await form.validateFields();
      await assignOrder(currentOrder.id, values);
      message.success('指派成功');
      setAssignModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('Assign order error:', error);
    }
  };

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatus(order.id, { status });
      message.success('状态更新成功');
      fetchOrders();
    } catch (error) {
      console.error('Update order status error:', error);
    }
  };

  const handleCancel = async (order) => {
    try {
      await cancelOrder(order.id);
      message.success('订单已取消');
      fetchOrders();
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  };

  const statusMap = {
    pending: { color: 'orange', text: '待排单' },
    assigned: { color: 'blue', text: '已指派' },
    making: { color: 'processing', text: '制作中' },
    completed: { color: 'green', text: '已完成' },
    cancelled: { color: 'default', text: '已取消' },
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 140 },
    { title: '产品名称', dataIndex: ['product', 'name'], key: 'productName' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 100, render: (v) => `¥${v}` },
    { title: '客户', dataIndex: ['customer', 'name'], key: 'customerName', width: 100 },
    { title: '客户电话', dataIndex: 'customerPhone', key: 'customerPhone', width: 120 },
    { title: '花艺师', dataIndex: ['florist', 'name'], key: 'floristName', width: 100, render: (v) => v || '-' },
    {
      title: '订单类型',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (c) => {
        const map = { daily: '日常零售', festival: '节日预定', wedding: '婚礼花艺' };
        return map[c] || c;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    { title: '取花时间', dataIndex: 'pickupTime', key: 'pickupTime', width: 160, render: (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => handleAssign(record)}>指派</Button>
          )}
          {record.status === 'assigned' && (
            <Button type="link" size="small" onClick={() => handleStatusChange(record, 'making')}>开始制作</Button>
          )}
          {record.status === 'making' && (
            <Button type="link" size="small" onClick={() => handleStatusChange(record, 'completed')}>完成</Button>
          )}
          {(record.status === 'pending' || record.status === 'assigned') && (
            <Popconfirm title="确定取消该订单？" onConfirm={() => handleCancel(record)}>
              <Button type="link" size="small" danger>取消</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">订单管理</div>
      </div>

      <div className="table-toolbar">
        <Form layout="inline" onFinish={handleSearch}>
          <Form.Item name="status" label="状态">
            <Select placeholder="全部状态" allowClear style={{ width: 120 }}>
              {Object.entries(statusMap).map(([key, val]) => (
                <Select.Option key={key} value={key}>{val.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="category" label="类型">
            <Select placeholder="全部类型" allowClear style={{ width: 120 }}>
              <Select.Option value="daily">日常零售</Select.Option>
              <Select.Option value="festival">节日预定</Select.Option>
              <Select.Option value="wedding">婚礼花艺</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="时间">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title="指派花艺师"
        open={assignModalVisible}
        onOk={handleAssignSubmit}
        onCancel={() => setAssignModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="floristId"
            label="选择花艺师"
            rules={[{ required: true, message: '请选择花艺师' }]}
          >
            <Select placeholder="请选择花艺师">
              {florists.map(f => (
                <Select.Option key={f.id} value={f.id}>
                  {f.name} - {f.position === 'maker' ? '花艺制作' : '场地布置'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderPage;
