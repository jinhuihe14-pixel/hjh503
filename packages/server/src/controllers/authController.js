const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'flower-studio-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isValid = await user.validatePassword(password);
    
    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: '账户已被禁用' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        position: user.position,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败' });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, name, phone, role = 'customer' } = req.body;
    
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
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '注册失败' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      role: user.role,
      position: user.position,
      avatar: user.avatar,
      address: user.address,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, address } = req.body;
    const user = req.user;

    await user.update({ name, phone, avatar, address });

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '更新失败' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
};
