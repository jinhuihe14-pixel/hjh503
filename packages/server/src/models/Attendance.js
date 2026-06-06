const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'leave', 'weekend', 'holiday'),
    defaultValue: 'present',
    comment: 'present-出勤，absent-缺勤，late-迟到，leave-请假，weekend-周末，holiday-节假日',
  },
  checkInTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  checkOutTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'attendances',
  timestamps: true,
  uniqueKeys: {
    user_date_unique: {
      fields: ['userId', 'date'],
    },
  },
});

module.exports = Attendance;
