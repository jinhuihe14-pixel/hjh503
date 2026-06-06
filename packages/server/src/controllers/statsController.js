const { Order, Product, FlowerMaterial, StockRecord, ScrapRecord, User, sequelize } = require('../models');
const dayjs = require('dayjs');

const getDashboardStats = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();

    const todayOrders = await Order.count({
      where: { createdAt: { [Op.between]: [todayStart, todayEnd] } },
    });

    const pendingOrders = await Order.count({
      where: { status: 'pending' },
    });

    const monthRevenue = await Order.sum('totalAmount', {
      where: {
        status: 'completed',
        completedAt: { [Op.between]: [monthStart, monthEnd] },
      },
    });

    const totalFlorsits = await User.count({
      where: { role: 'florist', status: 'active' },
    });

    const { count: lowStockCount } = await FlowerMaterial.findAndCountAll({
      where: {
        status: 'active',
        currentStock: { [Op.lte]: require('sequelize').col('safetyStock') },
      },
    });

    const recentOrders = await Order.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: User, as: 'customer', attributes: ['id', 'name'] },
      ],
    });

    res.json({
      todayOrders,
      pendingOrders,
      monthRevenue: monthRevenue || 0,
      totalFlorsits,
      lowStockCount,
      recentOrders,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: '获取统计数据失败' });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate, type = 'day' } = req.query;
    const { Op } = require('sequelize');
    
    const start = startDate ? dayjs(startDate).toDate() : dayjs().subtract(30, 'day').toDate();
    const end = endDate ? dayjs(endDate).toDate() : dayjs().toDate();

    const orders = await Order.findAll({
      where: {
        status: 'completed',
        completedAt: { [Op.between]: [start, end] },
      },
      attributes: [
        'completedAt',
        'totalAmount',
        'category',
      ],
      order: [['completedAt', 'ASC']],
    });

    const dailyData = {};
    let current = dayjs(start);
    const endDay = dayjs(end);
    
    while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
      const key = current.format('YYYY-MM-DD');
      dailyData[key] = { date: key, revenue: 0, orderCount: 0 };
      current = current.add(1, 'day');
    }

    orders.forEach(order => {
      const date = dayjs(order.completedAt).format('YYYY-MM-DD');
      if (dailyData[date]) {
        dailyData[date].revenue += parseFloat(order.totalAmount);
        dailyData[date].orderCount += 1;
      }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const totalOrders = orders.length;

    const categoryStats = {};
    orders.forEach(order => {
      if (!categoryStats[order.category]) {
        categoryStats[order.category] = { revenue: 0, count: 0 };
      }
      categoryStats[order.category].revenue += parseFloat(order.totalAmount);
      categoryStats[order.category].count += 1;
    });

    res.json({
      dailyStats: Object.values(dailyData),
      totalRevenue,
      totalOrders,
      categoryStats,
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ message: '获取营收统计失败' });
  }
};

const getMaterialStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { Op } = require('sequelize');
    
    const start = startDate ? dayjs(startDate).toDate() : dayjs().startOf('month').toDate();
    const end = endDate ? dayjs(endDate).toDate() : dayjs().endOf('month').toDate();

    const scrapRecords = await ScrapRecord.findAll({
      where: {
        status: 'approved',
        createdAt: { [Op.between]: [start, end] },
      },
      include: [{ model: FlowerMaterial, as: 'material', attributes: ['id', 'name', 'category'] }],
    });

    const scrapStats = {};
    scrapRecords.forEach(record => {
      const materialId = record.materialId;
      if (!scrapStats[materialId]) {
        scrapStats[materialId] = {
          materialId,
          materialName: record.material?.name,
          category: record.material?.category,
          quantity: 0,
          totalAmount: 0,
        };
      }
      scrapStats[materialId].quantity += parseFloat(record.quantity);
      scrapStats[materialId].totalAmount += parseFloat(record.totalAmount);
    });

    const stockInRecords = await StockRecord.findAll({
      where: {
        type: 'in',
        createdAt: { [Op.between]: [start, end] },
      },
    });

    const stockOutRecords = await StockRecord.findAll({
      where: {
        type: 'out',
        createdAt: { [Op.between]: [start, end] },
      },
    });

    const totalStockInAmount = stockInRecords.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
    const totalStockOutAmount = stockOutRecords.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
    const totalScrapAmount = scrapRecords.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);

    res.json({
      scrapStats: Object.values(scrapStats),
      totalStockInAmount,
      totalStockOutAmount,
      totalScrapAmount,
      scrapRate: totalStockInAmount > 0 ? (totalScrapAmount / totalStockInAmount * 100).toFixed(2) : 0,
    });
  } catch (error) {
    console.error('Get material stats error:', error);
    res.status(500).json({ message: '获取花材统计失败' });
  }
};

const getProductProfitStats = async (req, res) => {
  try {
    const { startDate, endDate, top = 10 } = req.query;
    const { Op } = require('sequelize');
    
    const start = startDate ? dayjs(startDate).toDate() : dayjs().startOf('month').toDate();
    const end = endDate ? dayjs(endDate).toDate() : dayjs().endOf('month').toDate();

    const orders = await Order.findAll({
      where: {
        status: 'completed',
        completedAt: { [Op.between]: [start, end] },
      },
      include: [{ model: Product, as: 'product' }],
    });

    const productStats = {};
    orders.forEach(order => {
      const productId = order.productId;
      if (!productStats[productId]) {
        productStats[productId] = {
          productId,
          productName: order.product?.name,
          category: order.product?.category,
          quantity: 0,
          revenue: 0,
        };
      }
      productStats[productId].quantity += order.quantity;
      productStats[productId].revenue += parseFloat(order.totalAmount);
    });

    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(top));

    res.json({
      products: sortedProducts,
      totalProducts: Object.keys(productStats).length,
    });
  } catch (error) {
    console.error('Get product profit stats error:', error);
    res.status(500).json({ message: '获取产品利润统计失败' });
  }
};

const getFloristPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { Op } = require('sequelize');
    
    const start = startDate ? dayjs(startDate).toDate() : dayjs().startOf('month').toDate();
    const end = endDate ? dayjs(endDate).toDate() : dayjs().endOf('month').toDate();

    const orders = await Order.findAll({
      where: {
        status: 'completed',
        completedAt: { [Op.between]: [start, end] },
        floristId: { [Op.ne]: null },
      },
      include: [{ model: User, as: 'florist', attributes: ['id', 'name', 'position'] }],
    });

    const floristStats = {};
    orders.forEach(order => {
      const floristId = order.floristId;
      if (!floristStats[floristId]) {
        floristStats[floristId] = {
          floristId,
          floristName: order.florist?.name,
          position: order.florist?.position,
          orderCount: 0,
          pieceCount: 0,
          pieceRateTotal: 0,
        };
      }
      floristStats[floristId].orderCount += 1;
      floristStats[floristId].pieceCount += order.quantity;
      floristStats[floristId].pieceRateTotal += parseFloat(order.pieceRateAmount);
    });

    res.json({
      florists: Object.values(floristStats).sort((a, b) => b.pieceRateTotal - a.pieceRateTotal),
    });
  } catch (error) {
    console.error('Get florist performance error:', error);
    res.status(500).json({ message: '获取花艺师业绩失败' });
  }
};

const getOverviewStats = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();

    const todayOrders = await Order.count({
      where: { createdAt: { [Op.between]: [todayStart, todayEnd] } },
    });

    const pendingOrders = await Order.count({
      where: { status: 'pending' },
    });

    const monthRevenue = await Order.sum('totalAmount', {
      where: {
        status: 'completed',
        completedAt: { [Op.between]: [monthStart, monthEnd] },
      },
    });

    const lowStockCount = await FlowerMaterial.count({
      where: {
        status: 'active',
        currentStock: { [Op.lte]: require('sequelize').col('safetyStock') },
      },
    });

    res.json({
      todayOrders,
      pendingOrders,
      monthRevenue: monthRevenue || 0,
      lowStockCount,
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ message: '获取概览数据失败' });
  }
};

module.exports = {
  getDashboardStats,
  getOverviewStats,
  getRevenueStats,
  getMaterialStats,
  getProductProfitStats,
  getFloristPerformance,
};
