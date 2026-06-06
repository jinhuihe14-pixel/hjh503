const { ScrapRecord, FlowerMaterial, sequelize, StockRecord } = require('../models');
const dayjs = require('dayjs');

const generateScrapNo = () => {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BF${date}${random}`;
};

const getScrapRecords = async (req, res) => {
  try {
    const { status, materialId, startDate, endDate, page = 1, pageSize = 20 } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    
    if (status) where.status = status;
    if (materialId) where.materialId = materialId;
    if (startDate) where.createdAt = { ...where.createdAt, [Op.gte]: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, [Op.lte]: endDate };

    const { count, rows } = await ScrapRecord.findAndCountAll({
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
    console.error('Get scrap records error:', error);
    res.status(500).json({ message: '获取报废记录失败' });
  }
};

const createScrapRecord = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { materialId, quantity, reason } = req.body;
    
    const material = await FlowerMaterial.findByPk(materialId, { transaction });
    if (!material) {
      await transaction.rollback();
      return res.status(404).json({ message: '花材不存在' });
    }

    const scrapNo = generateScrapNo();
    const unitPrice = material.averageCost;
    const totalAmount = parseFloat(quantity) * parseFloat(unitPrice);

    const scrapRecord = await ScrapRecord.create({
      scrapNo,
      materialId,
      quantity,
      unitPrice,
      totalAmount,
      reason,
      operatorId: req.user.id,
      status: 'pending',
    }, { transaction });

    await transaction.commit();
    res.status(201).json(scrapRecord);
  } catch (error) {
    await transaction.rollback();
    console.error('Create scrap record error:', error);
    res.status(500).json({ message: '创建报废记录失败' });
  }
};

const approveScrap = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { rejected = false } = req.body;
    
    const scrap = await ScrapRecord.findByPk(id, { transaction });
    if (!scrap) {
      await transaction.rollback();
      return res.status(404).json({ message: '报废记录不存在' });
    }

    if (scrap.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: '当前状态无法审核' });
    }

    if (rejected) {
      await scrap.update({
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      }, { transaction });
      await transaction.commit();
      return res.json({ message: '已拒绝', scrap });
    }

    const material = await FlowerMaterial.findByPk(scrap.materialId, { transaction });
    if (material && parseFloat(material.currentStock) >= parseFloat(scrap.quantity)) {
      const stockBefore = material.currentStock;
      const stockAfter = parseFloat(stockBefore) - parseFloat(scrap.quantity);

      await material.update({ currentStock: stockAfter }, { transaction });

      await StockRecord.create({
        materialId: scrap.materialId,
        type: 'scrap',
        quantity: scrap.quantity,
        unitPrice: scrap.unitPrice,
        totalAmount: scrap.totalAmount,
        stockBefore,
        stockAfter,
        relatedType: 'scrap',
        relatedId: scrap.id,
        operatorId: req.user.id,
        remark: `报废单 ${scrap.scrapNo}`,
      }, { transaction });
    }

    await scrap.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
    }, { transaction });

    await transaction.commit();
    res.json({ message: '审核通过', scrap });
  } catch (error) {
    await transaction.rollback();
    console.error('Approve scrap error:', error);
    res.status(500).json({ message: '审核失败' });
  }
};

module.exports = {
  getScrapRecords,
  createScrapRecord,
  approveScrap,
};
