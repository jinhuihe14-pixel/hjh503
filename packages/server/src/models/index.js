const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const FlowerMaterial = require('./FlowerMaterial');
const StockRecord = require('./StockRecord');
const MaterialRequisition = require('./MaterialRequisition');
const ScrapRecord = require('./ScrapRecord');
const PurchaseOrder = require('./PurchaseOrder');
const SalaryRecord = require('./SalaryRecord');
const Attendance = require('./Attendance');
const WeddingProject = require('./WeddingProject');

Order.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
Order.belongsTo(User, { as: 'florist', foreignKey: 'floristId' });
Order.belongsTo(Product, { as: 'product', foreignKey: 'productId' });

User.hasMany(Order, { as: 'customerOrders', foreignKey: 'customerId' });
User.hasMany(Order, { as: 'floristOrders', foreignKey: 'floristId' });

StockRecord.belongsTo(FlowerMaterial, { as: 'material', foreignKey: 'materialId' });
StockRecord.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

MaterialRequisition.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
MaterialRequisition.belongsTo(User, { as: 'florist', foreignKey: 'floristId' });
MaterialRequisition.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

ScrapRecord.belongsTo(FlowerMaterial, { as: 'material', foreignKey: 'materialId' });
ScrapRecord.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });
ScrapRecord.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

PurchaseOrder.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

SalaryRecord.belongsTo(User, { as: 'user', foreignKey: 'userId' });
SalaryRecord.belongsTo(User, { as: 'confirmer', foreignKey: 'confirmedBy' });

Attendance.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  FlowerMaterial,
  StockRecord,
  MaterialRequisition,
  ScrapRecord,
  PurchaseOrder,
  SalaryRecord,
  Attendance,
  WeddingProject,
};
