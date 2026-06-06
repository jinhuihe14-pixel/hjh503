import React, { useState, useEffect } from 'react';
import { NavBar, List, Button, Toast, Modal, Form, Input, Stepper, Selector, Picker } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { getMyRequisitions, createRequisition } from '../api/requisition';
import { getFloristOrders } from '../api/order';
import { getMaterials } from '../api/material';
import dayjs from 'dayjs';

const RequisitionsPage = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([]);
  const [orderPickerVisible, setOrderPickerVisible] = useState(false);
  const [materialPickerVisible, setMaterialPickerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchList();
    fetchOrders();
    fetchMaterials();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getMyRequisitions({ pageSize: 50 });
      setList(data.list);
    } catch (error) {
      console.error('Fetch requisitions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getFloristOrders({ status: 'assigned' });
      setOrders(data.list);
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials({ pageSize: 100 });
      setMaterials(data.list);
    } catch (error) {
      console.error('Fetch materials error:', error);
    }
  };

  const handleAdd = () => {
    setItems([]);
    setSelectedOrder(null);
    form.resetFields();
    setModalVisible(true);
  };

  const addItem = () => {
    setMaterialPickerVisible(true);
  };

  const onMaterialPick = (value) => {
    const material = materials.find(m => m.id == value[0]);
    if (material) {
      setItems([...items, { materialId: material.id, name: material.name, quantity: 1, unit: material.unit }]);
    }
    setMaterialPickerVisible(false);
  };

  const updateItemQuantity = (index, value) => {
    const newItems = [...items];
    newItems[index].quantity = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!selectedOrder) {
      Toast.show({ content: '请选择订单', icon: 'fail' });
      return;
    }
    if (items.length === 0) {
      Toast.show({ content: '请添加花材', icon: 'fail' });
      return;
    }

    try {
      await createRequisition({
        orderId: selectedOrder,
        items,
      });
      Toast.show({ content: '申请提交成功', icon: 'success' });
      setModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('Create requisition error:', error);
    }
  };

  const statusMap = {
    pending: { text: '待审核', color: '#faad14' },
    approved: { text: '已通过', color: '#52c41a' },
    rejected: { text: '已拒绝', color: '#ff4d4f' },
  };

  return (
    <div className="page-container">
      <NavBar onBack={() => navigate(-1)}>领料管理</NavBar>

      <div style={{ padding: 12 }}>
        <Button block color="primary" onClick={handleAdd}>
          + 新建领料申请
        </Button>
      </div>

      <div>
        {list.map((item) => (
          <div key={item.id} className="requisition-card">
            <div className="requisition-header">
              <span className="requisition-no">{item.requisitionNo}</span>
              <span style={{ color: statusMap[item.status]?.color, fontWeight: 500 }}>
                {statusMap[item.status]?.text}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
              订单：{item.order?.orderNo}
            </div>
            <div className="requisition-items">
              {item.items?.map((mat, i) => (
                <div key={i} className="requisition-item">
                  <span>{mat.name}</span>
                  <span>{mat.quantity} {mat.unit}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              申请时间：{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
            </div>
          </div>
        ))}

        {list.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div>暂无领料记录</div>
          </div>
        )}
      </div>

      <Modal
        visible={modalVisible}
        title="新建领料申请"
        onClose={() => setModalVisible(false)}
        footer={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setModalVisible(false),
          },
          {
            key: 'submit',
            text: '提交',
            color: 'primary',
            onClick: handleSubmit,
          },
        ]}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>选择订单</div>
            <div
              onClick={() => setOrderPickerVisible(true)}
              style={{
                padding: 10,
                border: '1px solid #eee',
                borderRadius: 8,
                color: selectedOrder ? '#333' : '#999',
                fontSize: 14,
              }}
            >
              {selectedOrder
                ? orders.find(o => o.id === selectedOrder)?.orderNo
                : '请选择要领料的订单'}
            </div>
            <Picker
              columns={[
                orders.map(o => ({ label: o.orderNo, value: o.id })),
              ]}
              visible={orderPickerVisible}
              onClose={() => setOrderPickerVisible(false)}
              onConfirm={(val) => {
                setSelectedOrder(val[0]);
                setOrderPickerVisible(false);
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>
              花材明细
              <Button size="mini" style={{ marginLeft: 8 }} onClick={addItem}>添加</Button>
            </div>
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <span style={{ flex: 1, fontSize: 14 }}>{item.name}</span>
                <Stepper
                  value={item.quantity}
                  onChange={(val) => updateItemQuantity(index, val)}
                  min={1}
                  style={{ width: 100 }}
                />
                <Button size="mini" color="danger" onClick={() => removeItem(index)} style={{ marginLeft: 8 }}>
                  删除
                </Button>
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                点击上方添加按钮添加花材
              </div>
            )}
            <Picker
              columns={[
                materials.map(m => ({ label: `${m.name} (库存:${m.currentStock}${m.unit})`, value: m.id })),
              ]}
              visible={materialPickerVisible}
              onClose={() => setMaterialPickerVisible(false)}
              onConfirm={onMaterialPick}
            />
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RequisitionsPage;
