import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser } from '../api/user';

const FloristPage = () => {
  const [florists, setFlorists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFlorist, setCurrentFlorist] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFlorists();
  }, [pagination.current, pagination.pageSize]);

  const fetchFlorists = async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        role: 'florist',
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      setFlorists(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch florists error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleAdd = () => {
    setModalType('add');
    setCurrentFlorist(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalType('edit');
    setCurrentFlorist(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalType === 'add') {
        await createUser({ ...values, role: 'florist' });
        message.success('创建成功');
      } else {
        await updateUser(currentFlorist.id, values);
        message.success('更新成功');
      }
      setModalVisible(false);
      fetchFlorists();
    } catch (error) {
      console.error('Submit florist error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchFlorists();
    } catch (error) {
      console.error('Delete florist error:', error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 120 },
    {
      title: '岗位',
      dataIndex: 'position',
      key: 'position',
      width: 100,
      render: (v) => v === 'maker' ? '花艺制作' : '场地布置',
    },
    { title: '基本工资', dataIndex: 'baseSalary', key: 'baseSalary', width: 100, render: (v) => `¥${v}` },
    { title: '全勤奖', dataIndex: 'fullAttendanceBonus', key: 'fullAttendanceBonus', width: 100, render: (v) => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => v === 'active' ? <Tag color="green">在职</Tag> : <Tag color="red">离职</Tag>,
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
        <div className="page-title">花艺师管理</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增花艺师</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={florists}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={modalType === 'add' ? '新增花艺师' : '编辑花艺师'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          {modalType === 'add' && (
            <Form.Item name="password" label="密码" rules={[{ required: true }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="position" label="岗位" rules={[{ required: true }]}>
            <Select placeholder="请选择岗位">
              <Select.Option value="maker">花艺制作</Select.Option>
              <Select.Option value="decorator">场地布置</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="baseSalary" label="基本工资">
            <InputNumber style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="fullAttendanceBonus" label="全勤奖">
            <InputNumber style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          {modalType === 'edit' && (
            <Form.Item name="status" label="状态">
              <Select>
                <Select.Option value="active">在职</Select.Option>
                <Select.Option value="inactive">离职</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default FloristPage;
