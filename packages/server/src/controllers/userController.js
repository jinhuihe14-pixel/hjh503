const { User } = require('../models');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const { role, position, status, keyword, page = 1, pageSize = 20 } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    
    if (role) where.role = role;
    if (position) where.position = position;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { username: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']],
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
    console.error('Get users error:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ message: '获取用户详情失败' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, name, phone, role, position, baseSalary, fullAttendanceBonus } = req.body;
    
    if (!username || !password || !name) {
      return res.status(400).json({ message: '请填写必要信息' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const user = await User.create({
      username,
      password,
      name,
      phone,
      role,
      position,
      baseSalary,
      fullAttendanceBonus,
    });

    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json(userData);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: '创建用户失败' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, position, status, baseSalary, fullAttendanceBonus, password } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const updateData = { name, phone, role, position, status, baseSalary, fullAttendanceBonus };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    const userData = user.toJSON();
    delete userData.password;

    res.json(userData);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: '更新用户失败' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.update({ status: 'inactive' });
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '删除失败' });
  }
};

const getFlorists = async (req, res) => {
  try {
    const { position } = req.query;
    const where = { role: 'florist', status: 'active' };
    if (position) where.position = position;

    const florists = await User.findAll({
      where,
      attributes: ['id', 'name', 'phone', 'position'],
      order: [['id', 'ASC']],
    });

    res.json(florists);
  } catch (error) {
    console.error('Get florists error:', error);
    res.status(500).json({ message: '获取花艺师列表失败' });
  }
};

module.exports = {
  getUsers,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  getFlorists,
};
