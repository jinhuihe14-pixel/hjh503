require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const materialRoutes = require('./routes/materialRoutes');
const requisitionRoutes = require('./routes/requisitionRoutes');
const scrapRoutes = require('./routes/scrapRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/scraps', scrapRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '花艺工作室系统 API 运行正常' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    await sequelize.sync();
    console.log('数据库模型同步完成');
    
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
