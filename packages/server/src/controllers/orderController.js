const { Order, Product, User, sequelize } = require('../models');
const dayjs = require('dayjs');

const generateOrderNo = () => {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FD${date}${random}`;
};

const getOrders = async (req, res) => {
  try {
    const { status, category, floristId, customerId, startDate, endDate, page = 1, pageSize = 20 } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (category) where.category = category;
    if (floristId) where.floristId = floristId;
    if (customerId) where.customerId = customerId;
    if (startDate) where.createdAt = { ...where.createdAt, [require('sequelize').Op.gte]: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, [require('sequelize').Op.lte]: endDate };

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'images', 'pieceRate'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'florist', attributes: ['id', 'name', 'position'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: '获取订单列表失败' });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'florist', attributes: ['id', 'name', 'position'] },
      ],
    });
    
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ message: '获取订单详情失败' });
  }
};

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productId, quantity = 1, category, pickupTime, deliveryAddress, customerName, customerPhone, remark } = req.body;
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }

    const orderNo = generateOrderNo();
    const totalAmount = product.price * quantity;

    const order = await Order.create({
      orderNo,
      customerId: req.user.id,
      productId,
      quantity,
      totalAmount,
      category: category || product.category,
      pickupTime,
      deliveryAddress,
      customerName,
      customerPhone,
      remark,
      status: 'pending',
      pieceRateAmount: product.pieceRate * quantity,
    }, { transaction });

    await transaction.commit();
    
    const orderWithDetails = await Order.findByPk(order.id, {
      include: [{ model: Product, as: 'product' }],
    });
    
    res.status(201).json(orderWithDetails);
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: '创建订单失败' });
  }
};

const assignOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { floristId } = req.body;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status !== 'pending' && order.status !== 'assigned') {
      return res.status(400).json({ message: '当前订单状态不支持指派' });
    }

    const florist = await User.findByPk(floristId);
    if (!florist || florist.role !== 'florist' || florist.status !== 'active') {
      return res.status(400).json({ message: '无效的花艺师' });
    }

    await order.update({
      floristId,
      status: 'assigned',
      assignedAt: new Date(),
    });

    res.json(order);
  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({ message: '指派订单失败' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await order.update(updateData);
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: '更新订单状态失败' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status === 'completed' || order.status === 'making') {
      return res.status(400).json({ message: '当前状态无法取消订单' });
    }

    await order.update({ status: 'cancelled' });
    res.json({ message: '订单已取消' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: '取消订单失败' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;
    const where = { customerId: req.user.id };
    
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: Product, as: 'product' }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: '获取我的订单失败' });
  }
};

const getFloristOrders = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;
    const where = { floristId: req.user.id };
    
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: Product, as: 'product' }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get florist orders error:', error);
    res.status(500).json({ message: '获取订单列表失败' });
  }
};

module.exports = {
  getOrders,
  getOrderDetail,
  createOrder,
  assignOrder,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getFloristOrders,
};
