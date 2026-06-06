const { sequelize, User, Product, FlowerMaterial } = require('../models');

const seed = async () => {
  try {
    console.log('开始初始化种子数据...');

    await sequelize.sync({ force: true });
    console.log('数据库表重建完成');

    await User.bulkCreate([
      {
        username: 'admin',
        password: '123456',
        name: '系统管理员',
        phone: '13800138000',
        role: 'admin',
      },
      {
        username: 'florist1',
        password: '123456',
        name: '张小花',
        phone: '13800138001',
        role: 'florist',
        position: 'maker',
        baseSalary: 3000,
        fullAttendanceBonus: 300,
      },
      {
        username: 'florist2',
        password: '123456',
        name: '李花艺',
        phone: '13800138002',
        role: 'florist',
        position: 'maker',
        baseSalary: 3000,
        fullAttendanceBonus: 300,
      },
      {
        username: 'decorator1',
        password: '123456',
        name: '王布置',
        phone: '13800138003',
        role: 'florist',
        position: 'decorator',
        baseSalary: 3500,
        fullAttendanceBonus: 300,
      },
      {
        username: 'customer1',
        password: '123456',
        name: '刘小姐',
        phone: '13900139001',
        role: 'customer',
      },
    ], { individualHooks: true });
    console.log('用户数据初始化完成');

    await FlowerMaterial.bulkCreate([
      { name: '红玫瑰', category: '鲜花', unit: '支', safetyStock: 100, currentStock: 200, averageCost: 3.5, supplier: '云南花卉基地' },
      { name: '粉玫瑰', category: '鲜花', unit: '支', safetyStock: 80, currentStock: 150, averageCost: 3.2, supplier: '云南花卉基地' },
      { name: '白玫瑰', category: '鲜花', unit: '支', safetyStock: 60, currentStock: 50, averageCost: 3.8, supplier: '云南花卉基地' },
      { name: '向日葵', category: '鲜花', unit: '支', safetyStock: 50, currentStock: 30, averageCost: 5, supplier: '云南花卉基地' },
      { name: '百合', category: '鲜花', unit: '支', safetyStock: 40, currentStock: 60, averageCost: 8, supplier: '云南花卉基地' },
      { name: '康乃馨', category: '鲜花', unit: '支', safetyStock: 80, currentStock: 120, averageCost: 2.5, supplier: '云南花卉基地' },
      { name: '满天星', category: '配花', unit: '扎', safetyStock: 20, currentStock: 35, averageCost: 15, supplier: '云南花卉基地' },
      { name: '尤加利叶', category: '叶材', unit: '扎', safetyStock: 30, currentStock: 25, averageCost: 12, supplier: '云南花卉基地' },
      { name: '情人草', category: '配花', unit: '扎', safetyStock: 20, currentStock: 15, averageCost: 10, supplier: '云南花卉基地' },
      { name: '粉色包装纸', category: '包装材料', unit: '张', safetyStock: 50, currentStock: 100, averageCost: 2, supplier: '包装材料商行' },
      { name: '透明玻璃纸', category: '包装材料', unit: '张', safetyStock: 50, currentStock: 80, averageCost: 1.5, supplier: '包装材料商行' },
      { name: '丝带', category: '包装材料', unit: '米', safetyStock: 100, currentStock: 200, averageCost: 0.5, supplier: '包装材料商行' },
      { name: '花泥', category: '辅材', unit: '块', safetyStock: 30, currentStock: 45, averageCost: 8, supplier: '包装材料商行' },
    ]);
    console.log('花材数据初始化完成');

    await Product.bulkCreate([
      {
        name: '浪漫红玫瑰花束',
        category: 'daily',
        description: '精选19支红玫瑰，搭配满天星与尤加利叶，浪漫满分',
        price: 199,
        pieceRate: 25,
        materials: [
          { materialId: 1, name: '红玫瑰', quantity: 19, unit: '支' },
          { materialId: 7, name: '满天星', quantity: 1, unit: '扎' },
          { materialId: 8, name: '尤加利叶', quantity: 1, unit: '扎' },
          { materialId: 10, name: '粉色包装纸', quantity: 5, unit: '张' },
          { materialId: 12, name: '丝带', quantity: 2, unit: '米' },
        ],
        status: 'active',
        sortOrder: 1,
      },
      {
        name: '粉色甜心花束',
        category: 'daily',
        description: '11支粉玫瑰搭配情人草，甜美可爱',
        price: 129,
        pieceRate: 18,
        materials: [
          { materialId: 2, name: '粉玫瑰', quantity: 11, unit: '支' },
          { materialId: 9, name: '情人草', quantity: 1, unit: '扎' },
          { materialId: 10, name: '粉色包装纸', quantity: 3, unit: '张' },
          { materialId: 12, name: '丝带', quantity: 1.5, unit: '米' },
        ],
        status: 'active',
        sortOrder: 2,
      },
      {
        name: '向日葵阳光花束',
        category: 'daily',
        description: '6支向日葵，阳光活力，适合送朋友',
        price: 99,
        pieceRate: 15,
        materials: [
          { materialId: 4, name: '向日葵', quantity: 6, unit: '支' },
          { materialId: 8, name: '尤加利叶', quantity: 1, unit: '扎' },
          { materialId: 11, name: '透明玻璃纸', quantity: 3, unit: '张' },
          { materialId: 12, name: '丝带', quantity: 1.5, unit: '米' },
        ],
        status: 'active',
        sortOrder: 3,
      },
      {
        name: '白色恋人花束',
        category: 'daily',
        description: '11支白玫瑰搭配满天星，纯洁高雅',
        price: 149,
        pieceRate: 20,
        materials: [
          { materialId: 3, name: '白玫瑰', quantity: 11, unit: '支' },
          { materialId: 7, name: '满天星', quantity: 1, unit: '扎' },
          { materialId: 11, name: '透明玻璃纸', quantity: 4, unit: '张' },
          { materialId: 12, name: '丝带', quantity: 2, unit: '米' },
        ],
        status: 'active',
        sortOrder: 4,
      },
      {
        name: '温馨康乃馨花束',
        category: 'daily',
        description: '20支康乃馨，送给妈妈的爱',
        price: 159,
        pieceRate: 20,
        materials: [
          { materialId: 6, name: '康乃馨', quantity: 20, unit: '支' },
          { materialId: 8, name: '尤加利叶', quantity: 1, unit: '扎' },
          { materialId: 10, name: '粉色包装纸', quantity: 4, unit: '张' },
          { materialId: 12, name: '丝带', quantity: 2, unit: '米' },
        ],
        status: 'active',
        sortOrder: 5,
      },
      {
        name: '情人节专属红玫瑰',
        category: 'festival',
        description: '99支红玫瑰，情人节限定款，提前预定更优惠',
        price: 999,
        pieceRate: 80,
        materials: [
          { materialId: 1, name: '红玫瑰', quantity: 99, unit: '支' },
          { materialId: 7, name: '满天星', quantity: 3, unit: '扎' },
          { materialId: 10, name: '粉色包装纸', quantity: 10, unit: '张' },
          { materialId: 12, name: '丝带', quantity: 5, unit: '米' },
          { materialId: 13, name: '花泥', quantity: 1, unit: '块' },
        ],
        status: 'active',
        sortOrder: 10,
      },
      {
        name: '母亲节感恩花礼',
        category: 'festival',
        description: '康乃馨+百合组合，母亲节特别款',
        price: 299,
        pieceRate: 35,
        materials: [
          { materialId: 6, name: '康乃馨', quantity: 30, unit: '支' },
          { materialId: 5, name: '百合', quantity: 5, unit: '支' },
          { materialId: 8, name: '尤加利叶', quantity: 2, unit: '扎' },
          { materialId: 10, name: '粉色包装纸', quantity: 8, unit: '张' },
          { materialId: 12, name: '丝带', quantity: 3, unit: '米' },
        ],
        status: 'active',
        sortOrder: 11,
      },
      {
        name: '婚礼新娘手捧花',
        category: 'wedding',
        description: '定制新娘手捧花，多种款式可选',
        price: 599,
        pieceRate: 80,
        materials: [
          { materialId: 3, name: '白玫瑰', quantity: 20, unit: '支' },
          { materialId: 2, name: '粉玫瑰', quantity: 10, unit: '支' },
          { materialId: 7, name: '满天星', quantity: 2, unit: '扎' },
          { materialId: 13, name: '花泥', quantity: 1, unit: '块' },
          { materialId: 12, name: '丝带', quantity: 3, unit: '米' },
        ],
        status: 'active',
        sortOrder: 20,
      },
    ]);
    console.log('产品数据初始化完成');

    console.log('种子数据初始化完成！');
    console.log('管理员账号: admin / 123456');
    console.log('花艺师账号: florist1 / 123456');
    console.log('客户账号: customer1 / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('初始化种子数据失败:', error);
    process.exit(1);
  }
};

seed();
