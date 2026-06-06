const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaterialRequisition = sequelize.define('MaterialRequisition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  requisitionNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  floristId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    comment: 'pending-待审核，approved-已通过，rejected-已拒绝',
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '领料明细：[{materialId, name, quantity, unit}]',
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  approvedBy: {
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
  rejectReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '拒绝原因',
  },
}, {
  tableName: 'material_requisitions',
  timestamps: true,
});

module.exports = MaterialRequisition;
