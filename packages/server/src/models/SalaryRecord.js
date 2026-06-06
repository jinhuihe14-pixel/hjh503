const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalaryRecord = sequelize.define('SalaryRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  baseSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '基本工资',
  },
  pieceRateTotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '计件工资总额',
  },
  pieceCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '计件数量',
  },
  projectCommission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '项目提成',
  },
  fullAttendanceBonus: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '全勤奖',
  },
  isFullAttendance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否全勤',
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '扣款',
  },
  bonus: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '奖金/其他奖励',
  },
  netSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '实发工资',
  },
  status: {
    type: DataTypes.ENUM('draft', 'confirmed', 'locked'),
    defaultValue: 'draft',
    comment: 'draft-草稿，confirmed-已确认，locked-已锁定',
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  confirmedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'salary_records',
  timestamps: true,
  uniqueKeys: {
    user_month_unique: {
      fields: ['userId', 'year', 'month'],
    },
  },
});

module.exports = SalaryRecord;
