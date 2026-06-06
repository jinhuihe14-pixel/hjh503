import React, { useState, useEffect } from 'react';
import { TabBar, PullToRefresh, Grid } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts } from '../api/product';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { pageSize: 50 };
      if (activeCategory !== 'all') params.category = activeCategory;
      const data = await getProducts(params);
      setProducts(data.list);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchProducts();
  };

  const tabs = [
    { key: '/', title: '首页', icon: <AppOutline /> },
    { key: '/orders', title: '订单', icon: <UnorderedListOutline /> },
    { key: '/profile', title: '我的', icon: <UserOutline /> },
  ];

  const categories = [
    { key: 'all', name: '全部', icon: '🌸' },
    { key: 'daily', name: '日常', icon: '💐' },
    { key: 'festival', name: '节日', icon: '🎉' },
    { key: 'wedding', name: '婚礼', icon: '💒' },
  ];

  const productEmojis = ['🌹', '🌷', '🌸', '💐', '🌻', '🌺'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">🌸 花艺工作室</div>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div style={{ padding: '0 12px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
              color: '#fff',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
                遇见美好
              </div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                从一束花开始，让生活充满芬芳
              </div>
            </div>
          </div>

          <div className="section-title" style={{ paddingTop: 0 }}>分类</div>
          <Grid columns={4} gap={12} style={{ marginBottom: 16 }}>
            {categories.map(cat => (
              <div
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  textAlign: 'center',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  background: activeCategory === cat.key ? '#fff0f5' : '#fff',
                  border: activeCategory === cat.key ? '2px solid #ff6b9d' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, color: '#333' }}>{cat.name}</div>
              </div>
            ))}
          </Grid>

          <div className="section-title" style={{ paddingLeft: 0 }}>热门花束</div>
          <div>
            {products.map((product, index) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="product-image">
                  {productEmojis[index % productEmojis.length]}
                </div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-desc">{product.description}</div>
                  <div className="product-price">
                    <span className="product-price-unit">¥</span>
                    {product.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🌸</div>
              <div>暂无商品</div>
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
