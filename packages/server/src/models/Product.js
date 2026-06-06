const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('daily', 'festival', 'wedding'),
    allowNull: false,
    comment: 'daily-日常零售，festival-节日预定，wedding-婚礼花艺',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pieceRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '单件计件薪资',
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  materials: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '所需花材清单，格式：[{materialId, quantity, unit}]',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
