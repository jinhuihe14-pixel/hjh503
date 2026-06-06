import React, { useState, useEffect } from 'react';
import { NavBar, Button, Toast, Stepper, DatePicker, Input, Form, TextArea } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductDetail } from '../api/product';
import { createOrder } from '../api/order';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pickupTimeVisible, setPickupTimeVisible] = useState(false);
  const [pickupTime, setPickupTime] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await getProductDetail(id);
      setProduct(data);
    } catch (error) {
      console.error('Fetch product detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }

    if (product.category === 'festival' && !pickupTime) {
      Toast.show({ content: '请选择取花时间', icon: 'fail' });
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        productId: product.id,
        quantity,
        category: product.category,
        customerName: customerName || user.name,
        customerPhone: customerPhone || user.phone,
        deliveryAddress: address,
        remark,
      };
      if (pickupTime) {
        orderData.pickupTime = pickupTime;
      }

      await createOrder(orderData);
      Toast.show({ content: '下单成功', icon: 'success' });
      navigate('/orders');
    } catch (error) {
      console.error('Create order error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryMap = {
    daily: '日常零售',
    festival: '节日预定',
    wedding: '婚礼花艺',
  };

  if (!product) {
    return <div style={{ padding: 20 }}>加载中...</div>;
  }

  return (
    <div className="detail-page">
      <NavBar onBack={() => navigate(-1)}>{product.name}</NavBar>
      
      <div className="detail-image">
        {product.category === 'daily' ? '💐' : product.category === 'festival' ? '🎉' : '💒'}
      </div>

      <div className="detail-content">
        <div className="detail-category">{categoryMap[product.category]}</div>
        <div className="detail-name">{product.name}</div>
        <div className="detail-price">¥{product.price}</div>
        <div className="detail-desc">{product.description}</div>

        <div className="section-card" style={{ margin: '16px -20px -20px', borderRadius: 0, borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>填写订单</div>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>购买数量</div>
            <Stepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={99}
            />
          </div>

          {(product.category === 'festival' || product.category === 'wedding') && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>取花时间</div>
              <div
                style={{
                  padding: '10px 12px',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  color: pickupTime ? '#333' : '#999',
                }}
                onClick={() => setPickupTimeVisible(true)}
              >
                {pickupTime ? new Date(pickupTime).toLocaleString() : '请选择取花时间'}
              </div>
              <DatePicker
                visible={pickupTimeVisible}
                onClose={() => setPickupTimeVisible(false)}
                onConfirm={(val) => {
                  setPickupTime(val.toISOString());
                  setPickupTimeVisible(false);
                }}
                min={new Date()}
              />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>联系人</div>
            <Input
              placeholder="请输入联系人姓名"
              value={customerName}
              onChange={setCustomerName}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>联系电话</div>
            <Input
              placeholder="请输入联系电话"
              value={customerPhone}
              onChange={setCustomerPhone}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>配送地址</div>
            <Input
              placeholder="请输入配送地址（自提可选填）"
              value={address}
              onChange={setAddress}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>备注</div>
            <TextArea
              placeholder="填写您的特殊需求..."
              value={remark}
              onChange={setRemark}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="detail-footer">
        <div className="detail-footer-price">
          <div className="detail-footer-price-label">合计</div>
          <div className="detail-footer-price-value">¥{(product.price * quantity).toFixed(2)}</div>
        </div>
        <button
          className="buy-button"
          onClick={handleOrder}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '立即下单'}
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
