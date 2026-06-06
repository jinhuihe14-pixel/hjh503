const { SalaryRecord, User, Order, Attendance, sequelize } = require('../models');
const dayjs = require('dayjs');

const getSalaryRecords = async (req, res) => {
  try {
    const { year, month, userId, status, page = 1, pageSize = 20 } = req.query;
    const where = {};
    
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const { count, rows } = await SalaryRecord.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'position', 'role'] },
      ],
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get salary records error:', error);
    res.status(500).json({ message: '获取薪资记录失败' });
  }
};

const getMySalary = async (req, res) => {
  try {
    const { year, month, page = 1, pageSize = 12 } = req.query;
    const where = { userId: req.user.id };
    
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    const { count, rows } = await SalaryRecord.findAndCountAll({
      where,
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get my salary error:', error);
    res.status(500).json({ message: '获取薪资记录失败' });
  }
};

const calculateSalary = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { userId, year, month } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'florist') {
      return res.status(400).json({ message: '无效的花艺师' });
    }

    const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

    const completedOrders = await Order.findAll({
      where: {
        floristId: userId,
        status: 'completed',
        completedAt: {
          [require('sequelize').Op.between]: [startDate, endDate],
        },
      },
    });

    const pieceRateTotal = completedOrders.reduce((sum, order) => {
      return sum + parseFloat(order.pieceRateAmount || 0);
    }, 0);
    const pieceCount = completedOrders.reduce((sum, order) => sum + order.quantity, 0);

    const attendances = await Attendance.findAll({
      where: {
        userId,
        date: {
          [require('sequelize').Op.between]: [
            startDate,
            endDate,
          ],
        },
      },
    });

    const workDays = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const totalWorkDays = attendances.filter(a => a.status !== 'weekend' && a.status !== 'holiday').length;
    const isFullAttendance = totalWorkDays > 0 && workDays === totalWorkDays && 
      !attendances.some(a => a.status === 'absent' || a.status === 'late');

    const fullAttendanceBonus = isFullAttendance ? (user.fullAttendanceBonus || 300) : 0;

    const netSalary = 
      (user.baseSalary || 0) + 
      pieceRateTotal + 
      fullAttendanceBonus;

    const [salaryRecord, created] = await SalaryRecord.findOrCreate({
      where: { userId, year, month },
      defaults: {
        baseSalary: user.baseSalary || 0,
        pieceRateTotal,
        pieceCount,
        projectCommission: 0,
        fullAttendanceBonus,
        isFullAttendance,
        deductions: 0,
        bonus: 0,
        netSalary,
        status: 'draft',
      },
      transaction,
    });

    if (!created) {
      if (salaryRecord.status === 'locked') {
        await transaction.rollback();
        return res.status(400).json({ message: '薪资记录已锁定，无法重新计算' });
      }
      await salaryRecord.update({
        baseSalary: user.baseSalary || 0,
        pieceRateTotal,
        pieceCount,
        fullAttendanceBonus,
        isFullAttendance,
        netSalary: (user.baseSalary || 0) + pieceRateTotal + fullAttendanceBonus + (salaryRecord.bonus || 0) - (salaryRecord.deductions || 0),
        status: 'draft',
      }, { transaction });
    }

    await transaction.commit();
    res.json(salaryRecord);
  } catch (error) {
    await transaction.rollback();
    console.error('Calculate salary error:', error);
    res.status(500).json({ message: '计算薪资失败' });
  }
};

const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { bonus, deductions, remark } = req.body;
    
    const salary = await SalaryRecord.findByPk(id);
    if (!salary) {
      return res.status(404).json({ message: '薪资记录不存在' });
    }

    if (salary.status === 'locked') {
      return res.status(400).json({ message: '薪资记录已锁定，无法修改' });
    }

    const netSalary = 
      parseFloat(salary.baseSalary) + 
      parseFloat(salary.pieceRateTotal) + 
      parseFloat(salary.projectCommission) + 
      parseFloat(salary.fullAttendanceBonus) + 
      parseFloat(bonus || 0) - 
      parseFloat(deductions || 0);

    await salary.update({
      bonus: bonus || 0,
      deductions: deductions || 0,
      remark,
      netSalary,
    });

    res.json(salary);
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({ message: '修改薪资失败' });
  }
};

const confirmSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { lock = false } = req.body;
    
    const salary = await SalaryRecord.findByPk(id);
    if (!salary) {
      return res.status(404).json({ message: '薪资记录不存在' });
    }

    const newStatus = lock ? 'locked' : 'confirmed';
    await salary.update({
      status: newStatus,
      confirmedBy: req.user.id,
      confirmedAt: new Date(),
    });

    res.json({ message: lock ? '已锁定' : '已确认', salary });
  } catch (error) {
    console.error('Confirm salary error:', error);
    res.status(500).json({ message: '操作失败' });
  }
};

module.exports = {
  getSalaryRecords,
  getMySalary,
  calculateSalary,
  updateSalary,
  confirmSalary,
};
