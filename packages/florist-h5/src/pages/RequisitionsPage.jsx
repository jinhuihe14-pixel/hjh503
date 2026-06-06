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
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([]);
  const [orderPickerVisible, setOrderPickerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [remark, setRemark] = useState('');
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    fetchList();
    fetchOrders();
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      fetchMaterials();
    }
  }, [modalVisible]);

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
    setMaterialsLoading(true);
    try {
      const data = await getMaterials({ pageSize: 100, status: 'active' });
      setMaterials(data.list || []);
    } catch (error) {
      console.error('Fetch materials error:', error);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditId(null);
    setItems([]);
    setSelectedOrder(null);
    setRemark('');
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setEditId(record.id);
    setItems(record.items || []);
    setSelectedOrder(record.orderId || null);
    setRemark(record.remark || '');
    setModalVisible(true);
  };

  const toggleMaterial = (material) => {
    const isSelected = items.some(item => item.materialId === material.id);
    if (isSelected) {
      setItems(items.filter(item => item.materialId !== material.id));
    } else {
      const stock = parseFloat(material.currentStock);
      if (stock <= 0) {
        Toast.show({ content: `${material.name} 库存为0`, icon: 'fail' });
        return;
      }
      setItems([...items, {
        materialId: material.id,
        name: material.name,
        quantity: 1,
        unit: material.unit,
        currentStock: stock,
      }]);
    }
  };

  const updateItemQuantity = (materialId, value) => {
    setItems(items.map(item => {
      if (item.materialId === materialId) {
        const material = materials.find(m => m.id === materialId);
        const maxQty = material ? parseFloat(material.currentStock) : item.currentStock || 9999;
        if (value > maxQty) {
          Toast.show({ content: `不能超过库存 ${maxQty}${item.unit}`, icon: 'fail' });
          value = maxQty;
        }
        return { ...item, quantity: value };
      }
      return item;
    }));
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
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setModalVisible(false),
          },
          {
            key: 'submit',
            text: editMode ? '重新提交' : '提交',
            primary: true,
            onClick: handleSubmit,
          },
        ]}
        content={
          <Form layout="vertical">
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
                选择花材
                <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                  已选 {items.length} 项
                </span>
              </div>
              {materialsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                  加载中...
                </div>
              ) : (
                <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  {materials.map((material) => {
                    const isSelected = items.some(item => item.materialId === material.id);
                    const selectedItem = items.find(item => item.materialId === material.id);
                    const stock = parseFloat(material.currentStock);
                    const isOutOfStock = stock <= 0;
                    const isOverStock = selectedItem && selectedItem.quantity > stock;

                    return (
                      <div
                        key={material.id}
                        onClick={() => !isOutOfStock && toggleMaterial(material)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          padding: '12px 14px',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: isSelected ? '#e6f4ff' : 'transparent',
                          opacity: isOutOfStock ? 0.5 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            border: `2px solid ${isSelected ? '#1677ff' : '#d9d9d9'}`,
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            marginTop: 1,
                            flexShrink: 0,
                            backgroundColor: isSelected ? '#1677ff' : 'transparent',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                          }}
                        >
                          {isSelected && '✓'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: 15, color: '#333', fontWeight: 500 }}>
                              {material.name}
                            </span>
                            {isOutOfStock && (
                              <span style={{
                                fontSize: 11,
                                color: '#ff4d4f',
                                marginLeft: 8,
                                padding: '1px 6px',
                                background: '#fff1f0',
                                borderRadius: 4,
                              }}>
                                库存为0
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: isOverStock ? '#ff4d4f' : '#999', marginTop: 4 }}>
                            当前库存：{stock}{material.unit}
                          </div>
                          {isSelected && (
                            <div
                              style={{ marginTop: 10 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#666', marginRight: 10 }}>
                                  申领数量：
                                </span>
                                <Stepper
                                  value={selectedItem?.quantity || 1}
                                  onChange={(val) => updateItemQuantity(material.id, val)}
                                  min={1}
                                  max={stock}
                                  style={{ width: 120 }}
                                />
                                <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                                  {material.unit}
                                </span>
                              </div>
                              {isOverStock && (
                                <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
                                  申领数量超过库存
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {materials.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#999' }}>
                      暂无花材数据
                    </div>
                  )}
                </div>
              )}
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
        }
      />
    </div>
  );
};

export default RequisitionsPage;
