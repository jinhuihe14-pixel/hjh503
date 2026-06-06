import React, { useState, useEffect } from 'react';
import { NavBar, Tabs, PullToRefresh } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { getMySalary } from '../api/salary';
import dayjs from 'dayjs';

const SalaryPage = () => {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonthSalary, setCurrentMonthSalary] = useState(null);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const data = await getMySalary({ pageSize: 12 });
      setSalaries(data.list);
      
      const currentMonth = dayjs().month() + 1;
      const currentYear = dayjs().year();
      const current = data.list.find(s => s.year === currentYear && s.month === currentMonth);
      setCurrentMonthSalary(current);
    } catch (error) {
      console.error('Fetch salaries error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchSalaries();
  };

  const statusMap = {
    draft: { text: '草稿', color: '#faad14' },
    confirmed: { text: '已确认', color: '#1890ff' },
    locked: { text: '已锁定', color: '#52c41a' },
  };

  return (
    <div className="page-container">
      <NavBar onBack={() => navigate(-1)}>薪资查询</NavBar>

      <div className="salary-card">
        <div className="salary-label">本月预估薪资</div>
        <div className="salary-amount">
          ¥{currentMonthSalary?.netSalary?.toFixed(2) || '0.00'}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          状态：{statusMap[currentMonthSalary?.status]?.text || '待计算'}
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="salary-detail">
            <span>基本工资</span>
            <span>¥{currentMonthSalary?.baseSalary || 0}</span>
          </div>
          <div className="salary-detail">
            <span>计件工资（{currentMonthSalary?.pieceCount || 0}件）</span>
            <span>¥{currentMonthSalary?.pieceRateTotal || 0}</span>
          </div>
          <div className="salary-detail">
            <span>全勤奖</span>
            <span>¥{currentMonthSalary?.fullAttendanceBonus || 0}</span>
          </div>
          <div className="salary-detail">
            <span>奖金</span>
            <span>¥{currentMonthSalary?.bonus || 0}</span>
          </div>
          <div className="salary-detail">
            <span>扣款</span>
            <span>-¥{currentMonthSalary?.deductions || 0}</span>
          </div>
        </div>
      </div>

      <div className="section-title">历史薪资</div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div style={{ padding: '0 12px' }}>
          {salaries.map((salary) => (
            <div
              key={salary.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>
                  {salary.year}年{salary.month}月
                </span>
                <span style={{ color: statusMap[salary.status]?.color, fontSize: 13 }}>
                  {statusMap[salary.status]?.text}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#666', fontSize: 14 }}>实发工资</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>
                  ¥{salary.netSalary?.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: '#999' }}>
                <span>计件 {salary.pieceCount} 件</span>
                <span>全勤奖 ¥{salary.fullAttendanceBonus}</span>
              </div>
            </div>
          ))}

          {salaries.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <div>暂无薪资记录</div>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};

export default SalaryPage;
