import React, { useState, useEffect } from 'react';
import { TabBar, Button, Dialog } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
  SetOutline,
  PhoneOutline,
  OrderedListOutline,
  HeartOutline,
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProfile } from '../api/auth';

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
      setUser(userData);
    } else {
      navigate('/login');
    }
  }, []);

  const handleLogout = async () => {
    const result = await Dialog.confirm({
      title: '提示',
      content: '确定要退出登录吗？',
    });
    if (result) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: <OrderedListOutline />, label: '我的订单', onClick: () => navigate('/orders') },
    { icon: <HeartOutline />, label: '我的收藏', onClick: () => {} },
    { icon: <PhoneOutline />, label: '联系客服', onClick: () => {} },
    { icon: <SetOutline />, label: '设置', onClick: () => {} },
  ];

  const tabs = [
    { key: '/', title: '首页', icon: <AppOutline /> },
    { key: '/orders', title: '订单', icon: <UnorderedListOutline /> },
    { key: '/profile', title: '我的', icon: <UserOutline /> },
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ paddingBottom: 32 }}>
        <div className="page-title">个人中心</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 20,
            marginTop: -20,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: '#fff',
            }}
          >
            {user.name?.[0] || '🌸'}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 4 }}>
              {user.name || '用户'}
            </div>
            <div style={{ fontSize: 13, color: '#999' }}>
              {user.phone || '未设置手机号'}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                borderBottom: index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: 15,
                color: '#333',
              }}
            >
              <span style={{ marginRight: 12, fontSize: 20 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ color: '#ccc' }}>{'>'}</span>
            </div>
          ))}
        </div>

        <Button
          block
          style={{ marginTop: 24, background: '#fff', color: '#e03131', border: 'none' }}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </div>

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

export default ProfilePage;
