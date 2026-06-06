import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  GiftOutlined,
  StockOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
    { key: '/orders', icon: <ShoppingOutlined />, label: '订单管理' },
    { key: '/products', icon: <GiftOutlined />, label: '花束产品' },
    { 
      key: 'inventory', 
      icon: <StockOutlined />, 
      label: '库存管理',
      children: [
        { key: '/materials', label: '花材管理' },
        { key: '/stock-records', label: '库存流水' },
        { key: '/requisitions', label: '领料管理' },
        { key: '/scraps', label: '报废管理' },
        { key: '/purchases', label: '采购管理' },
      ],
    },
    { key: '/florists', icon: <TeamOutlined />, label: '花艺师管理' },
    { key: '/salary', icon: <DollarOutlined />, label: '薪资管理' },
    { key: '/stats', icon: <BarChartOutlined />, label: '数据统计' },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userMenu = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const selectedKeys = [location.pathname];
  const openKeys = location.pathname.startsWith('/materials') || 
    location.pathname.startsWith('/stock-records') ||
    location.pathname.startsWith('/requisitions') ||
    location.pathname.startsWith('/scraps') ||
    location.pathname.startsWith('/purchases') ? ['inventory'] : [];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 600 }}>
          🌸 花艺工作室
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>管理后台</div>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user.name || '管理员'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 0, padding: 24, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
