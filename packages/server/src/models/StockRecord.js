const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockRecord = sequelize.define('StockRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'flower_materials',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'scrap', 'adjust'),
    allowNull: false,
    comment: 'in-入库，out-出库，scrap-报废，adjust-调整',
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '单价',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '总金额',
  },
  stockBefore: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '变动前库存',
  },
  stockAfter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '变动后库存',
  },
  relatedType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '关联类型：order-订单，purchase-采购，scrap-报废',
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联ID',
  },
  operatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'stock_records',
  timestamps: true,
});

module.exports = StockRecord;
