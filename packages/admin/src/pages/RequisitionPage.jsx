import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Popconfirm, Select, Form } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getRequisitions, approveRequisition } from '../api/requisition';
import dayjs from 'dayjs';

const RequisitionPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [status, setStatus] = useState();

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
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleApprove = async (record, rejected = false) => {
    try {
      await approveRequisition(record.id, { rejected });
      message.success(rejected ? '已拒绝' : '审核通过');
      fetchList();
    } catch (error) {
      console.error('Approve requisition error:', error);
    }
  };

  const statusMap = {
    pending: { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' },
  };

  const columns = [
    { title: '领料单号', dataIndex: 'requisitionNo', key: 'requisitionNo', width: 140 },
    { title: '关联订单', dataIndex: ['order', 'orderNo'], key: 'orderNo', width: 140 },
    { title: '花艺师', dataIndex: ['florist', 'name'], key: 'floristName', width: 100 },
    {
      title: '领料明细',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items?.map((item, i) => (
            <div key={i} style={{ fontSize: 12 }}>
              {item.name} × {item.quantity}{item.unit}
            </div>
          ))}
        </div>
      ),
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
        <div className="page-title">领料管理</div>
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
      />
    </div>
  );
};

export default RequisitionPage;
