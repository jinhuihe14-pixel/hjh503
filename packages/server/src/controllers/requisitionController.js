const { MaterialRequisition, Order, User, FlowerMaterial, sequelize, StockRecord } = require('../models');
const dayjs = require('dayjs');

const generateRequisitionNo = () => {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LL${date}${random}`;
};

const getRequisitions = async (req, res) => {
  try {
    const { status, floristId, orderId, page = 1, pageSize = 20 } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (floristId) where.floristId = floristId;
    if (orderId) where.orderId = orderId;

    const { count, rows } = await MaterialRequisition.findAndCountAll({
      where,
      include: [
        { model: Order, as: 'order', attributes: ['id', 'orderNo'] },
        { model: User, as: 'florist', attributes: ['id', 'name'] },
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
    console.error('Get requisitions error:', error);
    res.status(500).json({ message: '获取领料单列表失败' });
  }
};

const getMyRequisitions = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;
    const where = { floristId: req.user.id };
    
    if (status) where.status = status;

    const { count, rows } = await MaterialRequisition.findAndCountAll({
      where,
      include: [{ model: Order, as: 'order', attributes: ['id', 'orderNo'] }],
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
    console.error('Get my requisitions error:', error);
    res.status(500).json({ message: '获取领料单列表失败' });
  }
};

const createRequisition = async (req, res) => {
  try {
    const { orderId, items, remark } = req.body;
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    const requisitionNo = generateRequisitionNo();
    const requisition = await MaterialRequisition.create({
      requisitionNo,
      orderId,
      floristId: req.user.id,
      items,
      remark,
      status: 'pending',
    });

    res.status(201).json(requisition);
  } catch (error) {
    console.error('Create requisition error:', error);
    res.status(500).json({ message: '创建领料单失败' });
  }
};

const approveRequisition = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { rejected = false } = req.body;
    
    const requisition = await MaterialRequisition.findByPk(id, { transaction });
    if (!requisition) {
      await transaction.rollback();
      return res.status(404).json({ message: '领料单不存在' });
    }

    if (requisition.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: '当前状态无法审核' });
    }

    if (rejected) {
      await requisition.update({
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      }, { transaction });
      await transaction.commit();
      return res.json({ message: '已拒绝', requisition });
    }

    const items = requisition.items || [];
    for (const item of items) {
      const material = await FlowerMaterial.findByPk(item.materialId, { transaction });
      if (!material) {
        await transaction.rollback();
        return res.status(400).json({ message: `花材 ${item.name} 不存在` });
      }
      if (parseFloat(material.currentStock) < parseFloat(item.quantity)) {
        await transaction.rollback();
        return res.status(400).json({ message: `花材 ${item.name} 库存不足` });
      }

      const stockBefore = material.currentStock;
      const stockAfter = parseFloat(stockBefore) - parseFloat(item.quantity);

      await material.update({ currentStock: stockAfter }, { transaction });

      await StockRecord.create({
        materialId: item.materialId,
        type: 'out',
        quantity: item.quantity,
        unitPrice: material.averageCost,
        totalAmount: parseFloat(item.quantity) * parseFloat(material.averageCost),
        stockBefore,
        stockAfter,
        relatedType: 'requisition',
        relatedId: requisition.id,
        operatorId: req.user.id,
        remark: `领料单 ${requisition.requisitionNo}`,
      }, { transaction });
    }

    await requisition.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
    }, { transaction });

    await Order.update(
      { status: 'making' },
      { where: { id: requisition.orderId }, transaction }
    );

    await transaction.commit();
    res.json({ message: '审核通过', requisition });
  } catch (error) {
    await transaction.rollback();
    console.error('Approve requisition error:', error);
    res.status(500).json({ message: '审核失败' });
  }
};

module.exports = {
  getRequisitions,
  getMyRequisitions,
  createRequisition,
  approveRequisition,
};
