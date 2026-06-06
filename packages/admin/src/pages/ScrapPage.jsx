import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Popconfirm, Form, Modal, Select, Input, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getScrapRecords, createScrapRecord, approveScrap } from '../api/scrap';
import { getMaterials } from '../api/material';
import dayjs from 'dayjs';

const ScrapPage = () => {
  const [list, setList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchList();
    fetchMaterials();
  }, [pagination.current, pagination.pageSize]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.current, pageSize: pagination.pageSize };
      const data = await getScrapRecords(params);
      setList(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch scrap records error:', error);
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
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createScrapRecord(values);
      message.success('提交成功');
      setModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('Create scrap record error:', error);
    }
  };

  const handleApprove = async (record, rejected = false) => {
    try {
      await approveScrap(record.id, { rejected });
      message.success(rejected ? '已拒绝' : '审核通过');
      fetchList();
    } catch (error) {
      console.error('Approve scrap error:', error);
    }
  };

  const statusMap = {
    pending: { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' },
  };

  const columns = [
    { title: '报废单号', dataIndex: 'scrapNo', key: 'scrapNo', width: 140 },
    { title: '花材', dataIndex: ['material', 'name'], key: 'materialName', width: 120 },
    { title: '数量', key: 'quantity', width: 100, render: (_, r) => `${r.quantity} ${r.material?.unit || ''}` },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, render: (v) => `¥${v}` },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 100, render: (v) => `¥${v}` },
    { title: '报废原因', dataIndex: 'reason', key: 'reason' },
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
    { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => record.status === 'pending' && (
        <>
          <Button type="link" size="small" onClick={() => handleApprove(record, false)}>通过</Button>
          <Popconfirm title="确定拒绝？" onConfirm={() => handleApprove(record, true)}>
            <Button type="link" size="small" danger>拒绝</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">报废管理</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增报废</Button>
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
        title="新增报废记录"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="materialId" label="选择花材" rules={[{ required: true }]}>
            <Select placeholder="请选择花材" showSearch optionFilterProp="children">
              {materials.map(m => (
                <Select.Option key={m.id} value={m.id}>
                  {m.name}（库存：{m.currentStock} {m.unit}）
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="报废数量" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="reason" label="报废原因">
            <Input.TextArea rows={3} placeholder="请输入报废原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScrapPage;
