import React, { useState, useEffect } from 'react';
import { TabBar, Grid, PullToRefresh } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFloristOrders } from '../api/order';
import { getMySalary } from '../api/salary';
import dayjs from 'dayjs';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    makingOrders: 0,
    completedOrders: 0,
    thisMonthSalary: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [ordersRes, salaryRes] = await Promise.all([
        getFloristOrders({ pageSize: 100 }),
        getMySalary({ pageSize: 1 }),
      ]);

      const today = dayjs().format('YYYY-MM-DD');
      const todayOrders = ordersRes.list.filter(o => 
        dayjs(o.createdAt).format('YYYY-MM-DD') === today
      ).length;

      const pendingOrders = ordersRes.list.filter(o => o.status === 'assigned' || o.status === 'pending').length;
      const makingOrders = ordersRes.list.filter(o => o.status === 'making').length;
      const completedOrders = ordersRes.list.filter(o => o.status === 'completed').length;

      let thisMonthSalary = 0;
      const currentMonth = dayjs().month() + 1;
      const currentYear = dayjs().year();
      const currentSalary = salaryRes.list.find(s => s.year === currentYear && s.month === currentMonth);
      if (currentSalary) {
        thisMonthSalary = currentSalary.netSalary;
      }

      setStats({
        todayOrders,
        pendingOrders,
        makingOrders,
        completedOrders,
        thisMonthSalary,
      });
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchStats();
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const quickActions = [
    { icon: '📋', label: '我的订单', onClick: () => navigate('/orders') },
    { icon: '📦', label: '领料申请', onClick: () => navigate('/requisitions') },
    { icon: '🗑️', label: '报废登记', onClick: () => navigate('/scraps') },
    { icon: '💰', label: '薪资查询', onClick: () => navigate('/salary') },
  ];

  const tabs = [
    { key: '/', title: '工作台', icon: <AppOutline /> },
    { key: '/orders', title: '订单', icon: <UnorderedListOutline /> },
    { key: '/profile', title: '我的', icon: <UserOutline /> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">💐 花艺师工作台</div>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div style={{ padding: '0 12px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #0050b3 100%)',
              borderRadius: 16,
              padding: 24,
              color: '#fff',
              marginTop: -10,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
              你好，{user.name || '花艺师'} 👋
            </div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {dayjs().format('YYYY年MM月DD日 dddd')}
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.todayOrders}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>今日订单</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.makingOrders}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>制作中</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>¥{stats.thisMonthSalary}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>本月薪资</div>
              </div>
            </div>
          </div>

          <Grid columns={4} gap={12} style={{ marginBottom: 20 }}>
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.onClick}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '16px 8px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{action.icon}</div>
                <div style={{ fontSize: 13, color: '#333' }}>{action.label}</div>
              </div>
            ))}
          </Grid>

          <div className="section-title" style={{ paddingLeft: 0 }}>待处理订单</div>
          {stats.pendingOrders > 0 ? (
            <div
              style={{
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ color: '#d48806', fontSize: 14, marginBottom: 8 }}>
                您有 {stats.pendingOrders} 个待处理订单
              </div>
              <button
                style={{
                  padding: '8px 20px',
                  background: '#1677ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  fontSize: 13,
                }}
                onClick={() => navigate('/orders')}
              >
                立即查看
              </button>
            </div>
          ) : (
            <div
              style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ color: '#52c41a', fontSize: 14 }}>暂无待处理订单</div>
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

export default HomePage;
