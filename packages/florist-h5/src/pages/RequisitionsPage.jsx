import React, { useState, useEffect } from 'react';
import { NavBar, List, Button, Toast, Modal, Form, Input, Stepper, Selector, Picker, PullToRefresh, TextArea } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { getMyRequisitions, createRequisition, updateRequisition } from '../api/requisition';
import { getFloristOrders } from '../api/order';
import { getMaterials } from '../api/material';
import dayjs from 'dayjs';

const RequisitionsPage = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([]);
  const [orderPickerVisible, setOrderPickerVisible] = useState(false);
  const [materialPickerVisible, setMaterialPickerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [remark, setRemark] = useState('');

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
      Toast.show({ content: '获取列表失败', icon: 'fail' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getMyRequisitions({ pageSize: 50 });
      setList(data.list);
    } catch (error) {
      console.error('Refresh requisitions error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getFloristOrders({ status: 'assigned' });
      setOrders(data.list || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials({ pageSize: 100, status: 'active' });
      setMaterials(data.list || []);
    } catch (error) {
      console.error('Fetch materials error:', error);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditId(null);
    setItems([]);
    setSelectedOrder(null);
    setRemark('');
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setEditId(record.id);
    setItems(record.items || []);
    setSelectedOrder(record.orderId || null);
    setRemark(record.remark || '');
    form.resetFields();
    setModalVisible(true);
  };

  const addItem = () => {
    const availableMaterials = materials.filter(
      m => !items.find(i => i.materialId === m.id)
    );
    if (availableMaterials.length === 0) {
      Toast.show({ content: '没有更多花材可选', icon: 'fail' });
      return;
    }
    setMaterialPickerVisible(true);
  };

  const onMaterialPick = (value) => {
    const material = materials.find(m => m.id == value[0]);
    if (material) {
      if (parseFloat(material.currentStock) <= 0) {
        Toast.show({ content: `${material.name} 库存为0`, icon: 'fail' });
        setMaterialPickerVisible(false);
        return;
      }
      setItems([...items, { 
        materialId: material.id, 
        name: material.name, 
        quantity: 1, 
        unit: material.unit,
        currentStock: parseFloat(material.currentStock),
      }]);
    }
    setMaterialPickerVisible(false);
  };

  const updateItemQuantity = (index, value) => {
    const newItems = [...items];
    const material = materials.find(m => m.id === newItems[index].materialId);
    const maxQty = material ? parseFloat(material.currentStock) : 9999;
    if (value > maxQty) {
      Toast.show({ content: `不能超过库存 ${maxQty}${newItems[index].unit}`, icon: 'fail' });
      value = maxQty;
    }
    newItems[index].quantity = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const validateItems = () => {
    for (const item of items) {
      const material = materials.find(m => m.id === item.materialId);
      if (material && parseFloat(item.quantity) > parseFloat(material.currentStock)) {
        Toast.show({ 
          content: `${item.name} 申领数量 ${item.quantity}${item.unit} 超过库存 ${material.currentStock}${material.unit}`, 
          icon: 'fail' 
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Toast.show({ content: '请添加花材', icon: 'fail' });
      return;
    }

    if (!validateItems()) {
      return;
    }

    try {
      const submitItems = items.map(item => ({
        materialId: item.materialId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      }));

      if (editMode && editId) {
        await updateRequisition(editId, {
          items: submitItems,
          remark,
        });
        Toast.show({ content: '修改成功，已重新提交审批', icon: 'success' });
      } else {
        await createRequisition({
          orderId: selectedOrder || null,
          items: submitItems,
          remark,
        });
        Toast.show({ content: '申请提交成功', icon: 'success' });
      }
      setModalVisible(false);
      fetchList();
      fetchMaterials();
    } catch (error) {
      console.error('Submit requisition error:', error);
      const msg = error.response?.data?.message || '提交失败';
      const insufficientItems = error.response?.data?.insufficientItems;
      if (insufficientItems && insufficientItems.length > 0) {
        const names = insufficientItems.map(i => `${i.name}(${i.currentStock || 0}/${i.requested}${i.unit})`).join('、');
        Toast.show({ content: `库存不足：${names}`, icon: 'fail' });
      } else {
        Toast.show({ content: msg, icon: 'fail' });
      }
    }
  };

  const statusMap = {
    pending: { text: '待审核', color: '#faad14' },
    approved: { text: '已通过', color: '#52c41a' },
    rejected: { text: '已拒绝', color: '#ff4d4f' },
  };

  const renderMaterialPickerColumns = () => {
    const availableMaterials = materials.filter(
      m => !items.find(i => i.materialId === m.id) && parseFloat(m.currentStock) > 0
    );
    return [
      availableMaterials.map(m => ({ 
        label: `${m.name} (库存:${m.currentStock}${m.unit})`, 
        value: m.id 
      })),
    ];
  };

  return (
    <div className="page-container">
      <NavBar onBack={() => navigate(-1)}>领料管理</NavBar>

      <div style={{ padding: 12 }}>
        <Button block color="primary" onClick={handleAdd}>
          + 新建领料申请
        </Button>
      </div>

      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div>
          {list.map((item) => (
            <div key={item.id} className="requisition-card">
              <div className="requisition-header">
                <span className="requisition-no">{item.requisitionNo}</span>
                <span style={{ color: statusMap[item.status]?.color, fontWeight: 500 }}>
                  {statusMap[item.status]?.text}
                </span>
              </div>
              {item.order && (
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                  订单：{item.order.orderNo}
                </div>
              )}
              <div className="requisition-items">
                {item.items?.map((mat, i) => (
                  <div key={i} className="requisition-item">
                    <span>{mat.name}</span>
                    <span>{mat.quantity} {mat.unit}</span>
                  </div>
                ))}
              </div>
              {item.rejectReason && (
                <div style={{ 
                  fontSize: 12, 
                  color: '#ff4d4f', 
                  marginTop: 8, 
                  padding: '6px 8px',
                  background: '#fff1f0',
                  borderRadius: 4,
                }}>
                  拒绝原因：{item.rejectReason}
                </div>
              )}
              {item.status === 'rejected' && (
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <Button size="mini" color="primary" onClick={() => handleEdit(item)}>
                    修改后重新提交
                  </Button>
                </div>
              )}
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                申请时间：{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
              </div>
              {item.approvedAt && (
                <div style={{ fontSize: 12, color: '#999' }}>
                  {item.status === 'approved' ? '通过时间' : '拒绝时间'}：
                  {dayjs(item.approvedAt).format('YYYY-MM-DD HH:mm')}
                </div>
              )}
            </div>
          ))}

          {list.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div>暂无领料记录</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                下拉可刷新
              </div>
            </div>
          )}
        </div>
      </PullToRefresh>

      <Modal
        visible={modalVisible}
        title={editMode ? '修改领料申请' : '新建领料申请'}
        onClose={() => setModalVisible(false)}
        footer={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setModalVisible(false),
          },
          {
            key: 'submit',
            text: editMode ? '重新提交' : '提交',
            color: 'primary',
            onClick: handleSubmit,
          },
        ]}
      >
        <Form form={form} layout="vertical">
          {!editMode && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>
                关联订单（选填）
              </div>
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
                  : '不关联订单（日常领料）'}
              </div>
              {orders.length > 0 && (
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
              )}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>
              花材明细
              <Button size="mini" style={{ marginLeft: 8 }} onClick={addItem}>添加</Button>
            </div>
            {items.map((item, index) => {
              const material = materials.find(m => m.id === item.materialId);
              const stock = material ? parseFloat(material.currentStock) : item.currentStock || 0;
              const isOverStock = item.quantity > stock;
              return (
                <div
                  key={index}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item.name}</span>
                    <Button size="mini" color="danger" onClick={() => removeItem(index)}>
                      删除
                    </Button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: isOverStock ? '#ff4d4f' : '#999' }}>
                      库存：{stock}{item.unit}
                    </span>
                    <Stepper
                      value={item.quantity}
                      onChange={(val) => updateItemQuantity(index, val)}
                      min={1}
                      max={stock}
                      style={{ marginLeft: 'auto', width: 120 }}
                    />
                  </div>
                  {isOverStock && (
                    <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 2 }}>
                      申领数量超过库存
                    </div>
                  )}
                </div>
              );
            })}
            {items.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                点击上方添加按钮添加花材
              </div>
            )}
            <Picker
              columns={renderMaterialPickerColumns()}
              visible={materialPickerVisible}
              onClose={() => setMaterialPickerVisible(false)}
              onConfirm={onMaterialPick}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>备注（选填）</div>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入备注信息"
              rows={3}
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #eee',
                borderRadius: 8,
                fontSize: 14,
                resize: 'none',
              }}
            />
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RequisitionsPage;
