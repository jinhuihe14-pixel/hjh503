const { PurchaseOrder, FlowerMaterial, sequelize, StockRecord } = require('../models');
const dayjs = require('dayjs');

const generatePurchaseNo = () => {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CG${date}${random}`;
};

const getPurchaseOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, pageSize = 20 } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    
    if (status) where.status = status;
    if (startDate) where.createdAt = { ...where.createdAt, [Op.gte]: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, [Op.lte]: endDate };

    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where,
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
    console.error('Get purchase orders error:', error);
    res.status(500).json({ message: '获取采购单列表失败' });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const { items, supplier, expectedDate, remark } = req.body;
    
    const purchaseNo = generatePurchaseNo();
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * parseFloat(item.quantity)), 0);

    const purchaseOrder = await PurchaseOrder.create({
      purchaseNo,
      items,
      supplier,
      expectedDate,
      totalAmount,
      remark,
      operatorId: req.user.id,
      status: 'pending',
    });

    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ message: '创建采购单失败' });
  }
};

const receivePurchaseOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const purchaseOrder = await PurchaseOrder.findByPk(id, { transaction });
    if (!purchaseOrder) {
      await transaction.rollback();
      return res.status(404).json({ message: '采购单不存在' });
    }

    if (purchaseOrder.status !== 'pending' && purchaseOrder.status !== 'ordered') {
      await transaction.rollback();
      return res.status(400).json({ message: '当前状态无法入库' });
    }

    const items = purchaseOrder.items || [];
    for (const item of items) {
      let material = await FlowerMaterial.findByPk(item.materialId, { transaction });
      
      if (!material) {
        material = await FlowerMaterial.create({
          name: item.name,
          unit: item.unit,
          currentStock: 0,
          averageCost: 0,
          status: 'active',
        }, { transaction });
      }

      const stockBefore = material.currentStock;
      const stockAfter = parseFloat(stockBefore) + parseFloat(item.quantity);
      const totalAmount = parseFloat(item.quantity) * parseFloat(item.unitPrice);

      const newAverageCost = stockAfter > 0
        ? (parseFloat(material.averageCost) * parseFloat(stockBefore) + totalAmount) / stockAfter
        : item.unitPrice;

      await material.update({
        currentStock: stockAfter,
        averageCost: newAverageCost,
      }, { transaction });

      await StockRecord.create({
        materialId: material.id,
        type: 'in',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount,
        stockBefore,
        stockAfter,
        relatedType: 'purchase',
        relatedId: purchaseOrder.id,
        operatorId: req.user.id,
        remark: `采购单 ${purchaseOrder.purchaseNo}`,
      }, { transaction });
    }

    await purchaseOrder.update({
      status: 'received',
      receivedAt: new Date(),
    }, { transaction });

    await transaction.commit();
    res.json({ message: '入库成功', purchaseOrder });
  } catch (error) {
    await transaction.rollback();
    console.error('Receive purchase order error:', error);
    res.status(500).json({ message: '入库失败' });
  }
};

const generateAutoPurchase = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const lowStockMaterials = await FlowerMaterial.findAll({
      where: {
        status: 'active',
        currentStock: { [Op.lte]: require('sequelize').col('safetyStock') },
      },
    });

    const items = lowStockMaterials.map(m => {
      const purchaseQty = Math.max(m.safetyStock * 2 - m.currentStock, m.safetyStock);
      return {
        materialId: m.id,
        name: m.name,
        unit: m.unit,
        quantity: purchaseQty,
        unitPrice: m.averageCost || 0,
        totalAmount: purchaseQty * (m.averageCost || 0),
      };
    });

    res.json({
      items,
      totalAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
    });
  } catch (error) {
    console.error('Generate auto purchase error:', error);
    res.status(500).json({ message: '生成采购清单失败' });
  }
};

module.exports = {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  generateAutoPurchase,
};
