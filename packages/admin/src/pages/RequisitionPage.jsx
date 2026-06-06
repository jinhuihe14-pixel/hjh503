import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Popconfirm, Select, Form, Modal, Input } from 'antd';
import { SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { getRequisitions, approveRequisition } from '../api/requisition';
import dayjs from 'dayjs';

const { TextArea } = Input;

const RequisitionPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [status, setStatus] = useState();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [currentRequisition, setCurrentRequisition] = useState(null);

  useEffect(() => {
    fetchList();
  }, [pagination.current, pagination.pageSize, status]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (status) params.status = status;
      const data = await getRequisitions(params);
      setList(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch requisitions error:', error);
      message.error('获取列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleApprove = async (record) => {
    try {
      await approveRequisition(record.id, { rejected: false });
      message.success('审核通过');
      fetchList();
    } catch (error) {
      console.error('Approve requisition error:', error);
      const insufficientItems = error.response?.data?.insufficientItems;
      if (insufficientItems && insufficientItems.length > 0) {
        const names = insufficientItems.map(i => 
          `${i.name}（库存:${i.currentStock || 0}${i.unit}，申领:${i.requested}${i.unit}）`
        ).join('、');
        message.error(`库存不足：${names}`);
      } else {
        message.error(error.response?.data?.message || '审核失败');
      }
    }
  };

  const handleRejectClick = (record) => {
    setCurrentRequisition(record);
    rejectForm.resetFields();
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    try {
      const values = await rejectForm.validateFields();
      await approveRequisition(currentRequisition.id, { 
        rejected: true, 
        rejectReason: values.rejectReason 
      });
      message.success('已拒绝');
      setRejectModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('Reject requisition error:', error);
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleExpandAll = () => {
    if (expandedRowKeys.length === list.length) {
      setExpandedRowKeys([]);
    } else {
      setExpandedRowKeys(list.map(item => item.id));
    }
  };

  const statusMap = {
    pending: { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' },
  };

  const expandedRowRender = (record) => (
    <div style={{ padding: '0 20px', background: '#fafafa' }}>
      <div style={{ marginBottom: 8, fontWeight: 500 }}>花材明细：</div>
      <Table
        size="small"
        pagination={false}
        dataSource={record.items || []}
        rowKey={(item, index) => index}
        columns={[
          { title: '花材名称', dataIndex: 'name', key: 'name' },
          { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
          { title: '申领数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
        ]}
      />
      {record.rejectReason && (
        <div style={{ marginTop: 8, color: '#ff4d4f' }}>
          拒绝原因：{record.rejectReason}
        </div>
      )}
      {record.remark && (
        <div style={{ marginTop: 8, color: '#666' }}>
          备注：{record.remark}
        </div>
      )}
      {record.approver && (
        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
          {record.status === 'approved' ? '通过人' : '拒绝人'}：{record.approver.name}
          ，时间：{dayjs(record.approvedAt).format('YYYY-MM-DD HH:mm')}
        </div>
      )}
    </div>
  );

  const columns = [
    { title: '领料单号', dataIndex: 'requisitionNo', key: 'requisitionNo', width: 140 },
    { title: '花艺师', dataIndex: ['florist', 'name'], key: 'floristName', width: 100 },
    { title: '关联订单', dataIndex: ['order', 'orderNo'], key: 'orderNo', width: 140, render: (v) => v || '-' },
    {
      title: '花材种类',
      key: 'itemCount',
      width: 100,
      render: (_, record) => `${record.items?.length || 0} 种`,
    },
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
      width: 200,
      render: (_, record) => record.status === 'pending' && (
        <>
          <Button type="link" size="small" onClick={() => handleApprove(record)}>通过</Button>
          <Button type="link" size="small" danger onClick={() => handleRejectClick(record)}>拒绝</Button>
        </>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">领料管理</div>
        <Button onClick={handleExpandAll}>
          {expandedRowKeys.length === list.length ? '全部收起' : '全部展开'}
        </Button>
      </div>

      <div className="table-toolbar">
        <Form layout="inline">
          <Form.Item label="状态">
            <Select
              placeholder="全部状态"
              allowClear
              style={{ width: 120 }}
              value={status}
              onChange={setStatus}
            >
              {Object.entries(statusMap).map(([key, val]) => (
                <Select.Option key={key} value={key}>{val.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
        }}
      />

      <Modal
        title="拒绝领料申请"
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalVisible(false)}
        okText="确认拒绝"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: 12 }}>
          领料单：<strong>{currentRequisition?.requisitionNo}</strong>
        </div>
        <Form form={rejectForm} layout="vertical">
          <Form.Item 
            name="rejectReason" 
            label="拒绝原因" 
            rules={[{ required: true, message: '请输入拒绝原因' }]}
          >
            <TextArea rows={4} placeholder="请输入拒绝原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RequisitionPage;
