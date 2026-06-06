import React, { useState, useEffect } from 'react';
import { TabBar, Dialog } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
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
    { icon: '📋', label: '我的订单', onClick: () => navigate('/orders') },
    { icon: '📦', label: '领料记录', onClick: () => navigate('/requisitions') },
    { icon: '🗑️', label: '报废记录', onClick: () => navigate('/scraps') },
    { icon: '💰', label: '薪资查询', onClick: () => navigate('/salary') },
    { icon: '⚙️', label: '设置', onClick: () => {} },
  ];

  const tabs = [
    { key: '/', title: '工作台', icon: <AppOutline /> },
    { key: '/orders', title: '订单', icon: <UnorderedListOutline /> },
    { key: '/profile', title: '我的', icon: <UserOutline /> },
  ];

  const positionMap = {
    maker: '花艺制作',
    decorator: '场地布置',
  };

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
            padding: 24,
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
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1677ff 0%, #0050b3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              color: '#fff',
            }}
          >
            💐
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 4 }}>
              {user.name || '花艺师'}
            </div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>
              {user.phone || '未设置手机号'}
            </div>
            <div style={{ fontSize: 12, color: '#1677ff', background: '#e6f4ff', padding: '2px 8px', borderRadius: 10, display: 'inline-block' }}>
              {positionMap[user.position] || '花艺师'}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', padding: '0 16px' }}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={item.onClick}
            >
              <span className="menu-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              <span className="menu-item-arrow">{'>'}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: 24,
            padding: '14px',
            background: '#fff',
            color: '#ff4d4f',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
          }}
        >
          退出登录
        </button>
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
