import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Tag, Table } from 'antd';
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { getOverviewStats, getDashboardStats } from '../api/stats';
import dayjs from 'dayjs';

const DashboardPage = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [overviewData, dashboardData] = await Promise.all([
        getOverviewStats(),
        getDashboardStats(),
      ]);
      setStats({ ...dashboardData, ...overviewData });
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: '今日订单', value: stats.todayOrders || 0, icon: <ShoppingCartOutlined style={{ fontSize: 32, color: '#1890ff' }} />, color: '#1890ff' },
    { title: '待排单', value: stats.pendingOrders || 0, icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />, color: '#faad14' },
    { title: '本月营收', value: `¥${(stats.monthRevenue || 0).toFixed(2)}`, icon: <DollarOutlined style={{ fontSize: 32, color: '#52c41a' }} />, color: '#52c41a' },
    { title: '花艺师数量', value: stats.totalFlorsits || 0, icon: <TeamOutlined style={{ fontSize: 32, color: '#722ed1' }} />, color: '#722ed1' },
    { title: '低库存预警', value: stats.lowStockCount || 0, icon: <WarningOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />, color: '#ff4d4f' },
  ];

  const orderColumns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '产品', dataIndex: ['product', 'name'], key: 'productName' },
    { title: '客户', dataIndex: ['customer', 'name'], key: 'customerName' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v) => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待排单' },
          assigned: { color: 'blue', text: '已指派' },
          making: { color: 'processing', text: '制作中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'default', text: '已取消' },
        };
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('MM-DD HH:mm'),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => (
          <Col span={24 / 5} key={index}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#666', marginBottom: 8 }}>{card.title}</div>
                  <div style={{ fontSize: 28, fontWeight: 600 }}>{card.value}</div>
                </div>
                <div>{card.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="最近订单">
            <Table
              rowKey="id"
              columns={orderColumns}
              dataSource={stats.recentOrders || []}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
