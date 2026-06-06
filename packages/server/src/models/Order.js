const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('daily', 'festival', 'wedding'),
    allowNull: false,
    comment: '订单类型',
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'making', 'completed', 'cancelled'),
    defaultValue: 'pending',
    comment: 'pending-待排单，assigned-已指派，making-制作中，completed-已完成，cancelled-已取消',
  },
  pickupTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '取花时间',
  },
  deliveryAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '配送地址',
  },
  customerName: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  floristId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: '指派的花艺师',
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pieceRateAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '计件工资金额',
  },
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
