const { FlowerMaterial, StockRecord, sequelize } = require('../models');

const getMaterials = async (req, res) => {
  try {
    const { category, status, keyword, lowStock, page = 1, pageSize = 20 } = req.query;
    const where = {};
    const { Op } = require('sequelize');
    
    if (category) where.category = category;
    if (status) where.status = status;
    else where.status = 'active';
    
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    
    if (lowStock === 'true') {
      where.currentStock = { [Op.lte]: require('sequelize').col('safety_stock') };
    }

    const { count, rows } = await FlowerMaterial.findAndCountAll({
      where,
      order: [['id', 'DESC']],
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
    console.error('Get materials error:', error);
    res.status(500).json({ message: '获取花材列表失败' });
  }
};

const getMaterialDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await FlowerMaterial.findByPk(id);
    
    if (!material) {
      return res.status(404).json({ message: '花材不存在' });
    }

    res.json(material);
  } catch (error) {
    console.error('Get material detail error:', error);
    res.status(500).json({ message: '获取花材详情失败' });
  }
};

const createMaterial = async (req, res) => {
  try {
    const material = await FlowerMaterial.create(req.body);
    res.status(201).json(material);
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ message: '创建花材失败' });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await FlowerMaterial.findByPk(id);
    
    if (!material) {
      return res.status(404).json({ message: '花材不存在' });
    }

    await material.update(req.body);
    res.json(material);
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: '更新花材失败' });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await FlowerMaterial.findByPk(id);
    
    if (!material) {
      return res.status(404).json({ message: '花材不存在' });
    }

    await material.update({ status: 'inactive' });
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: '删除失败' });
  }
};

const stockIn = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { materialId, quantity, unitPrice, remark, relatedType, relatedId } = req.body;
    
    const material = await FlowerMaterial.findByPk(materialId, { transaction });
    if (!material) {
      await transaction.rollback();
      return res.status(404).json({ message: '花材不存在' });
    }

    const stockBefore = material.currentStock;
    const stockAfter = parseFloat(stockBefore) + parseFloat(quantity);
    const totalAmount = parseFloat(quantity) * parseFloat(unitPrice);

    const newAverageCost = stockAfter > 0
      ? (parseFloat(material.averageCost) * parseFloat(stockBefore) + totalAmount) / stockAfter
      : unitPrice;

    await material.update({
      currentStock: stockAfter,
      averageCost: newAverageCost,
    }, { transaction });

    await StockRecord.create({
      materialId,
      type: 'in',
      quantity,
      unitPrice,
      totalAmount,
      stockBefore,
      stockAfter,
      relatedType,
      relatedId,
      operatorId: req.user.id,
      remark,
    }, { transaction });

    await transaction.commit();
    res.json({ message: '入库成功', stock: stockAfter });
  } catch (error) {
    await transaction.rollback();
    console.error('Stock in error:', error);
    res.status(500).json({ message: '入库失败' });
  }
};

const stockOut = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { materialId, quantity, remark, relatedType, relatedId } = req.body;
    
    const material = await FlowerMaterial.findByPk(materialId, { transaction });
    if (!material) {
      await transaction.rollback();
      return res.status(404).json({ message: '花材不存在' });
    }

    const stockBefore = material.currentStock;
    if (parseFloat(stockBefore) < parseFloat(quantity)) {
      await transaction.rollback();
      return res.status(400).json({ message: '库存不足' });
    }

    const stockAfter = parseFloat(stockBefore) - parseFloat(quantity);
    const totalAmount = parseFloat(quantity) * parseFloat(material.averageCost);

    await material.update({ currentStock: stockAfter }, { transaction });

    await StockRecord.create({
      materialId,
      type: 'out',
      quantity,
      unitPrice: material.averageCost,
      totalAmount,
      stockBefore,
      stockAfter,
      relatedType,
      relatedId,
      operatorId: req.user.id,
      remark,
    }, { transaction });

    await transaction.commit();
    res.json({ message: '出库成功', stock: stockAfter });
  } catch (error) {
    await transaction.rollback();
    console.error('Stock out error:', error);
    res.status(500).json({ message: '出库失败' });
  }
};

const getStockRecords = async (req, res) => {
  try {
    const { materialId, type, startDate, endDate, page = 1, pageSize = 20 } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    
    if (materialId) where.materialId = materialId;
    if (type) where.type = type;
    if (startDate) where.createdAt = { ...where.createdAt, [Op.gte]: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, [Op.lte]: endDate };

    const { count, rows } = await StockRecord.findAndCountAll({
      where,
      include: [
        { model: FlowerMaterial, as: 'material', attributes: ['id', 'name', 'unit'] },
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
    console.error('Get stock records error:', error);
    res.status(500).json({ message: '获取库存记录失败' });
  }
};

const getLowStockMaterials = async (req, res) => {
  try {
    const { Op, col } = require('sequelize');
    const materials = await FlowerMaterial.findAll({
      where: {
        status: 'active',
        [Op.and]: [
          { currentStock: { [Op.lte]: col('safety_stock') } },
        ],
      },
      order: [['currentStock', 'ASC']],
    });

    res.json(materials);
  } catch (error) {
    console.error('Get low stock materials error:', error);
    res.status(500).json({ message: '获取低库存花材失败' });
  }
};

module.exports = {
  getMaterials,
  getMaterialDetail,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  stockIn,
  stockOut,
  getStockRecords,
  getLowStockMaterials,
};
