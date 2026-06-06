const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FlowerMaterial = sequelize.define('FlowerMaterial', {
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
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '分类：鲜花、叶材、包装材料等',
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '单位：支、束、个、米等',
  },
  spec: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '规格',
  },
  safetyStock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '安全库存',
  },
  currentStock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '当前库存',
  },
  averageCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '平均成本',
  },
  supplier: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'flower_materials',
  timestamps: true,
});

module.exports = FlowerMaterial;
