import React, { useState, useEffect } from 'react';
import { TabBar, Tabs, Empty, PullToRefresh } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyOrders } from '../api/order';
import dayjs from 'dayjs';

const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { pageSize: 50 };
      if (activeTab !== 'all') params.status = activeTab;
      const data = await getMyOrders(params);
      setOrders(data.list);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchOrders();
  };

  const statusMap = {
    pending: { text: '待排单', color: '#faad14' },
    assigned: { text: '已指派', color: '#1890ff' },
    making: { text: '制作中', color: '#722ed1' },
    completed: { text: '已完成', color: '#52c41a' },
    cancelled: { text: '已取消', color: '#999' },
  };

  const productEmojis = ['🌹', '💐', '🌸', '🌷', '🌻', '🌺'];

  const tabs = [
    { key: '/', title: '首页', icon: <AppOutline /> },
    { key: '/orders', title: '订单', icon: <UnorderedListOutline /> },
    { key: '/profile', title: '我的', icon: <UserOutline /> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">我的订单</div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ background: '#fff' }}
      >
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab title="待排单" key="pending" />
        <Tabs.Tab title="制作中" key="making" />
        <Tabs.Tab title="已完成" key="completed" />
      </Tabs>

      <PullToRefresh onRefresh={handleRefresh}>
        <div style={{ padding: '12px 0' }}>
          {orders.map((order, index) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-no">{order.orderNo}</span>
                <span className="order-status" style={{ color: statusMap[order.status]?.color }}>
                  {statusMap[order.status]?.text}
                </span>
              </div>
              
              <div className="order-product">
                <div className="order-product-img">
                  {productEmojis[index % productEmojis.length]}
                </div>
                <div className="order-product-info">
                  <div className="order-product-name">{order.product?.name}</div>
                  <div className="order-product-desc">
                    数量：{order.quantity} 束
                  </div>
                  {order.pickupTime && (
                    <div className="order-product-desc">
                      取花时间：{dayjs(order.pickupTime).format('YYYY-MM-DD HH:mm')}
                    </div>
                  )}
                </div>
              </div>

              <div className="order-footer">
                <span className="order-amount">
                  实付 <strong>¥{order.totalAmount}</strong>
                </span>
                <span style={{ fontSize: 12, color: '#999' }}>
                  {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
            </div>
          ))}

          {orders.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div>暂无订单</div>
              <button
                style={{
                  marginTop: 16,
                  padding: '10px 24px',
                  background: '#ff6b9d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 20,
                  fontSize: 14,
                }}
                onClick={() => navigate('/')}
              >
                去逛逛
              </button>
            </div>
          )}
        </div>
      </PullToRefresh>

      <div className="tab-bar">
        <TabBar
          activeKey={location.pathname}
          onChange={(key) => navigate(key)}
        >
          {tabs.map(item => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default OrdersPage;
