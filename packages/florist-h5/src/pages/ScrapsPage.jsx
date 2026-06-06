import React, { useState, useEffect } from 'react';
import { NavBar, Button, Toast, Modal, Form, Input, Picker, TextArea, Stepper } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { getScrapRecords, createScrapRecord } from '../api/scrap';
import { getMaterials } from '../api/material';
import dayjs from 'dayjs';

const ScrapsPage = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    fetchList();
    fetchMaterials();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getScrapRecords({ pageSize: 50 });
      setList(data.list);
    } catch (error) {
      console.error('Fetch scrap records error:', error);
    } finally {
      setLoading(false);
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
    setSelectedMaterial(null);
    setQuantity(1);
    setReason('');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedMaterial) {
      Toast.show({ content: '请选择花材', icon: 'fail' });
      return;
    }
    if (quantity <= 0) {
      Toast.show({ content: '请输入正确的数量', icon: 'fail' });
      return;
    }

    try {
      await createScrapRecord({
        materialId: selectedMaterial,
        quantity,
        reason,
      });
      Toast.show({ content: '提交成功', icon: 'success' });
      setModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('Create scrap record error:', error);
    }
  };

  const statusMap = {
    pending: { text: '待审核', color: '#faad14' },
    approved: { text: '已通过', color: '#52c41a' },
    rejected: { text: '已拒绝', color: '#ff4d4f' },
  };

  return (
    <div className="page-container">
      <NavBar onBack={() => navigate(-1)}>报废登记</NavBar>

      <div style={{ padding: 12 }}>
        <Button block color="danger" onClick={handleAdd}>
          + 新增报废登记
        </Button>
      </div>

      <div>
        {list.map((item) => (
          <div key={item.id} className="requisition-card">
            <div className="requisition-header">
              <span className="requisition-no">{item.scrapNo}</span>
              <span style={{ color: statusMap[item.status]?.color, fontWeight: 500 }}>
                {statusMap[item.status]?.text}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 14 }}>{item.material?.name}</span>
              <span style={{ fontSize: 14 }}>
                {item.quantity} {item.material?.unit}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 13, color: '#999' }}>单价</span>
              <span style={{ fontSize: 13, color: '#999' }}>¥{item.unitPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>总金额</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#ff4d4f' }}>¥{item.totalAmount}</span>
            </div>
            {item.reason && (
              <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                原因：{item.reason}
              </div>
            )}
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              申请时间：{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
            </div>
          </div>
        ))}

        {list.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🗑️</div>
            <div>暂无报废记录</div>
          </div>
        )}
      </div>

      <Modal
        visible={modalVisible}
        title="新增报废记录"
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
            color: 'danger',
            onClick: handleSubmit,
          },
        ]}
      >
        <Form layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>选择花材</div>
            <div
              onClick={() => setPickerVisible(true)}
              style={{
                padding: 10,
                border: '1px solid #eee',
                borderRadius: 8,
                color: selectedMaterial ? '#333' : '#999',
                fontSize: 14,
              }}
            >
              {selectedMaterial
                ? materials.find(m => m.id === selectedMaterial)?.name
                : '请选择报废花材'}
            </div>
            <Picker
              columns={[
                materials.map(m => ({
                  label: `${m.name} (库存:${m.currentStock}${m.unit})`,
                  value: m.id,
                })),
              ]}
              visible={pickerVisible}
              onClose={() => setPickerVisible(false)}
              onConfirm={(val) => {
                setSelectedMaterial(val[0]);
                setPickerVisible(false);
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>报废数量</div>
            <Stepper value={quantity} onChange={setQuantity} min={0} />
          </div>

          <div>
            <div style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>报废原因</div>
            <TextArea
              value={reason}
              onChange={setReason}
              placeholder="请输入报废原因"
              rows={3}
            />
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ScrapsPage;
