const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('admin', 'florist', 'customer'),
    allowNull: false,
    defaultValue: 'customer',
  },
  position: {
    type: DataTypes.ENUM('maker', 'decorator'),
    allowNull: true,
    comment: '花艺师岗位：maker-花艺制作，decorator-场地布置',
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  baseSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '基本工资',
  },
  fullAttendanceBonus: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 300,
    comment: '全勤奖',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
