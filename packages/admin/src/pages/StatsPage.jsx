import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, DatePicker, Select } from 'antd';
import ReactECharts from 'echarts-for-react';
import { getRevenueStats, getMaterialStats, getProductProfitStats, getFloristPerformance } from '../api/stats';
import dayjs from 'dayjs';

const StatsPage = () => {
  const [revenueData, setRevenueData] = useState({});
  const [materialData, setMaterialData] = useState({});
  const [productData, setProductData] = useState({});
  const [floristData, setFloristData] = useState({});
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllStats();
  }, [dateRange]);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0]?.format('YYYY-MM-DD');
      const endDate = dateRange[1]?.format('YYYY-MM-DD');
      
      const [revenue, material, product, florist] = await Promise.all([
        getRevenueStats({ startDate, endDate }),
        getMaterialStats({ startDate, endDate }),
        getProductProfitStats({ startDate, endDate }),
        getFloristPerformance({ startDate, endDate }),
      ]);
      
      setRevenueData(revenue);
      setMaterialData(material);
      setProductData(product);
      setFloristData(florist);
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const revenueChartOption = {
    title: { text: '营收趋势', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['营收', '订单数'], bottom: 0 },
    xAxis: {
      type: 'category',
      data: revenueData.dailyStats?.map(d => d.date) || [],
    },
    yAxis: [
      { type: 'value', name: '营收(元)' },
      { type: 'value', name: '订单数' },
    ],
    series: [
      {
        name: '营收',
        type: 'line',
        smooth: true,
        data: revenueData.dailyStats?.map(d => d.revenue) || [],
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: revenueData.dailyStats?.map(d => d.orderCount) || [],
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  const categoryChartOption = {
    title: { text: '订单分类占比', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: Object.entries(revenueData.categoryStats || {}).map(([key, value]) => ({
          name: key === 'daily' ? '日常零售' : key === 'festival' ? '节日预定' : '婚礼花艺',
          value: value.revenue,
        })),
      },
    ],
  };

  const productColumns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 60, render: (_, __, i) => i + 1 },
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
    { title: '销量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '营收', dataIndex: 'revenue', key: 'revenue', width: 120, render: (v) => `¥${v?.toFixed(2)}` },
  ];

  const floristColumns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 60, render: (_, __, i) => i + 1 },
    { title: '花艺师', dataIndex: 'floristName', key: 'floristName' },
    { title: '岗位', dataIndex: 'position', key: 'position', width: 100, render: (v) => v === 'maker' ? '花艺制作' : '场地布置' },
    { title: '订单数', dataIndex: 'orderCount', key: 'orderCount', width: 80 },
    { title: '计件数量', dataIndex: 'pieceCount', key: 'pieceCount', width: 100 },
    { title: '计件工资', dataIndex: 'pieceRateTotal', key: 'pieceRateTotal', width: 120, render: (v) => `¥${v?.toFixed(2)}` },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={revenueChartOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={categoryChartOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>总营收</div>
              <div style={{ fontSize: 32, fontWeight: 600, color: '#1890ff' }}>
                ¥{revenueData.totalRevenue?.toFixed(2) || 0}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>总订单数</div>
              <div style={{ fontSize: 32, fontWeight: 600, color: '#52c41a' }}>
                {revenueData.totalOrders || 0}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>损耗率</div>
              <div style={{ fontSize: 32, fontWeight: 600, color: '#faad14' }}>
                {materialData.scrapRate || 0}%
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="产品销量排行">
            <Table
              rowKey="productId"
              columns={productColumns}
              dataSource={productData.products || []}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="花艺师业绩排行">
            <Table
              rowKey="floristId"
              columns={floristColumns}
              dataSource={floristData.florists || []}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatsPage;
