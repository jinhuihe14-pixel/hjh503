import React, { useState, useEffect } from 'react';
import { TabBar, Tabs, Button, PullToRefresh, Toast, Dialog } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFloristOrders, updateOrderStatus } from '../api/order';
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
      const data = await getFloristOrders(params);
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

  const handleStartMaking = async (order) => {
    const result = await Dialog.confirm({
      title: '确认开始制作',
      content: '确定开始制作该订单吗？',
    });
    if (result) {
      try {
        await updateOrderStatus(order.id, { status: 'making' });
        Toast.show({ content: '已开始制作', icon: 'success' });
        fetchOrders();
      } catch (error) {
        console.error('Update order status error:', error);
      }
    }
  };

  const handleComplete = async (order) => {
    const result = await Dialog.confirm({
      title: '确认完成',
      content: '确定该订单已制作完成吗？',
    });
    if (result) {
      try {
        await updateOrderStatus(order.id, { status: 'completed' });
        Toast.show({ content: '订单已完成', icon: 'success' });
        fetchOrders();
      } catch (error) {
        console.error('Update order status error:', error);
      }
    }
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
    { key: '/', title: '工作台', icon: <AppOutline /> },
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
        <Tabs.Tab title="待制作" key="assigned" />
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
                  {order.remark && (
                    <div className="order-product-desc" style={{ color: '#e03131' }}>
                      备注：{order.remark}
                    </div>
                  )}
                </div>
              </div>

              {order.status === 'assigned' && (
                <div className="order-footer">
                  <span></span>
                  <Button color="primary" size="small" onClick={() => handleStartMaking(order)}>
                    开始制作
                  </Button>
                </div>
              )}

              {order.status === 'making' && (
                <div className="order-footer">
                  <span style={{ fontSize: 13, color: '#999' }}>
                    计件：¥{order.pieceRateAmount}
                  </span>
                  <Button color="success" size="small" onClick={() => handleComplete(order)}>
                    完成制作
                  </Button>
                </div>
              )}

              {order.status === 'completed' && (
                <div className="order-footer">
                  <span style={{ fontSize: 13, color: '#52c41a' }}>
                    计件工资：¥{order.pieceRateAmount}
                  </span>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {dayjs(order.completedAt).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              )}
            </div>
          ))}

          {orders.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div>暂无订单</div>
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
