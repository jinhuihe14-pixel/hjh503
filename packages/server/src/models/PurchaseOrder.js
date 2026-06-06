const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  purchaseNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'ordered', 'received', 'cancelled'),
    defaultValue: 'pending',
    comment: 'pending-待采购，ordered-已下单，received-已入库，cancelled-已取消',
  },
  supplier: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '采购明细：[{materialId, name, quantity, unit, unitPrice, totalAmount}]',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  expectedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '预计到货日期',
  },
  receivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
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
  tableName: 'purchase_orders',
  timestamps: true,
});

module.exports = PurchaseOrder;
