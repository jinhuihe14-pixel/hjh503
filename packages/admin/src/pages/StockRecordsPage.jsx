import React, { useState, useEffect } from 'react';
import { Table, Tag, Form, Select, DatePicker, Button } from 'antd';
import { getStockRecords } from '../api/material';
import dayjs from 'dayjs';

const StockRecordsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchList();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const data = await getStockRecords(params);
      setList(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch stock records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleSearch = (values) => {
    setFilters({
      type: values.type,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
    });
    setPagination(p => ({ ...p, current: 1 }));
  };

  const typeMap = {
    in: { color: 'green', text: '入库' },
    out: { color: 'orange', text: '出库' },
    scrap: { color: 'red', text: '报废' },
    adjust: { color: 'blue', text: '调整' },
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '花材名称', dataIndex: ['material', 'name'], key: 'materialName', width: 150 },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (t) => {
        const type = typeMap[t] || { color: 'default', text: t };
        return <Tag color={type.color}>{type.text}</Tag>;
      },
    },
    { title: '数量', key: 'quantity', width: 100, render: (_, r) => `${r.quantity} ${r.material?.unit || ''}` },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, render: (v) => `¥${v}` },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 100, render: (v) => `¥${v}` },
    { title: '变动前库存', dataIndex: 'stockBefore', key: 'stockBefore', width: 100 },
    { title: '变动后库存', dataIndex: 'stockAfter', key: 'stockAfter', width: 100 },
    { title: '关联类型', dataIndex: 'relatedType', key: 'relatedType', width: 100 },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    { title: '操作时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
      <div className="page-title">库存流水</div>
      </div>

      <div className="table-toolbar">
        <Form layout="inline" onFinish={handleSearch}>
          <Form.Item name="type" label="类型">
            <Select placeholder="全部类型" allowClear style={{ width: 120 }}>
              {Object.entries(typeMap).map(([key, val]) => (
                <Select.Option key={key} value={key}>{val.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="时间">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">查询</Button>
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

export default StockRecordsPage;
