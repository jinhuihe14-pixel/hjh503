import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Select, Input, InputNumber, message, DatePicker } from 'antd';
import { CalculatorOutlined, SearchOutlined, LockOutlined } from '@ant-design/icons';
import { getSalaryRecords, calculateSalary, updateSalary, confirmSalary } from '../api/salary';
import { getFlorists } from '../api/user';
import dayjs from 'dayjs';

const SalaryPage = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [calcModalVisible, setCalcModalVisible] = useState(false);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [florists, setFlorists] = useState([]);
  const [form] = Form.useForm();
  const [calcForm] = Form.useForm();

  useEffect(() => {
    fetchSalaries();
    fetchFlorists();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const data = await getSalaryRecords(params);
      setSalaries(data.list);
      setPagination(p => ({ ...p, total: data.total }));
    } catch (error) {
      console.error('Fetch salaries error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlorists = async () => {
    try {
      const data = await getFlorists();
      setFlorists(data);
    } catch (error) {
      console.error('Fetch florists error:', error);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(p => ({ ...p, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleSearch = (values) => {
    setFilters({
      year: values.month?.year(),
      month: values.month?.month() + 1,
    });
    setPagination(p => ({ ...p, current: 1 }));
  };

  const handleCalculate = () => {
    calcForm.resetFields();
    setCalcModalVisible(true);
  };

  const handleCalcSubmit = async () => {
    try {
      const values = await calcForm.validateFields();
      const month = values.month;
      await calculateSalary({
        userId: values.userId,
        year: month.year(),
        month: month.month() + 1,
      });
      message.success('计算成功');
      setCalcModalVisible(false);
      fetchSalaries();
    } catch (error) {
      console.error('Calculate salary error:', error);
    }
  };

  const handleEdit = (record) => {
    if (record.status === 'locked') {
      message.warning('薪资已锁定，无法修改');
      return;
    }
    setCurrentSalary(record);
    form.setFieldsValue({
      bonus: record.bonus,
      deductions: record.deductions,
      remark: record.remark,
    });
    setModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateSalary(currentSalary.id, values);
      message.success('修改成功');
      setModalVisible(false);
      fetchSalaries();
    } catch (error) {
      console.error('Update salary error:', error);
    }
  };

  const handleConfirm = async (record, lock = false) => {
    try {
      await confirmSalary(record.id, { lock });
      message.success(lock ? '已锁定' : '已确认');
      fetchSalaries();
    } catch (error) {
      console.error('Confirm salary error:', error);
    }
  };

  const statusMap = {
    draft: { color: 'orange', text: '草稿' },
    confirmed: { color: 'blue', text: '已确认' },
    locked: { color: 'green', text: '已锁定' },
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '花艺师', dataIndex: ['user', 'name'], key: 'userName', width: 100 },
    {
      title: '岗位',
      dataIndex: ['user', 'position'],
      key: 'position',
      width: 100,
      render: (v) => v === 'maker' ? '花艺制作' : '场地布置',
    },
    { title: '年月', key: 'month', width: 100, render: (_, r) => `${r.year}年${r.month}月` },
    { title: '基本工资', dataIndex: 'baseSalary', key: 'baseSalary', width: 100, render: (v) => `¥${v}` },
    { title: '计件数量', dataIndex: 'pieceCount', key: 'pieceCount', width: 100 },
    { title: '计件工资', dataIndex: 'pieceRateTotal', key: 'pieceRateTotal', width: 100, render: (v) => `¥${v}` },
    { title: '全勤奖', dataIndex: 'fullAttendanceBonus', key: 'fullAttendanceBonus', width: 100, render: (v) => `¥${v}` },
    { title: '奖金', dataIndex: 'bonus', key: 'bonus', width: 100, render: (v) => `¥${v}` },
    { title: '扣款', dataIndex: 'deductions', key: 'deductions', width: 100, render: (v) => `¥${v}` },
    {
      title: '实发工资',
      dataIndex: 'netSalary',
      key: 'netSalary',
      width: 120,
      render: (v) => <span style={{ fontWeight: 600, color: '#52c41a' }}>¥{v}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" disabled={record.status === 'locked'} onClick={() => handleEdit(record)}>
            修改
          </Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => handleConfirm(record, false)}>
              确认
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button type="link" size="small" icon={<LockOutlined />} onClick={() => handleConfirm(record, true)}>
              锁定
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">薪资管理</div>
        <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCalculate}>
          计算薪资
        </Button>
      </div>

      <div className="table-toolbar">
        <Form layout="inline" onFinish={handleSearch}>
          <Form.Item name="month" label="月份">
            <DatePicker picker="month" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
          </Form.Item>
        </Form>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={salaries}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title="计算薪资"
        open={calcModalVisible}
        onOk={handleCalcSubmit}
        onCancel={() => setCalcModalVisible(false)}
      >
        <Form form={calcForm} layout="vertical">
          <Form.Item name="userId" label="选择花艺师" rules={[{ required: true }]}>
            <Select placeholder="请选择花艺师">
              {florists.map(f => (
                <Select.Option key={f.id} value={f.id}>
                  {f.name} - {f.position === 'maker' ? '花艺制作' : '场地布置'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="month" label="薪资月份" rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="修改薪资"
        open={modalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="bonus" label="奖金/其他奖励">
            <InputNumber style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="deductions" label="扣款">
            <InputNumber style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalaryPage;
