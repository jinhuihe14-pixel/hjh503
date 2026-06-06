const { Product } = require('../models');

const getProducts = async (req, res) => {
  try {
    const { category, status, page = 1, pageSize = 20 } = req.query;
    const where = {};
    
    if (category) where.category = category;
    if (status) where.status = status;
    else where.status = 'active';

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
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
    console.error('Get products error:', error);
    res.status(500).json({ message: '获取产品列表失败' });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ message: '获取产品详情失败' });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: '创建产品失败' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: '更新产品失败' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }

    await product.update({ status: 'inactive' });
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: '删除失败' });
  }
};

module.exports = {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
};
