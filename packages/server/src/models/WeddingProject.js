const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeddingProject = sequelize.define('WeddingProject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '项目名称',
  },
  customerName: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  weddingDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '婚礼日期',
  },
  venue: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '婚礼场地',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '项目总金额',
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: '提成比例（百分比）',
  },
  commissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '提成金额',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
    comment: 'pending-待开始，in_progress-进行中，completed-已完成，cancelled-已取消',
  },
  decorators: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '参与的场地布置花艺师：[{userId, name, commissionAmount}]',
  },
  materials: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '所需花材清单',
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'wedding_projects',
  timestamps: true,
});

module.exports = WeddingProject;
