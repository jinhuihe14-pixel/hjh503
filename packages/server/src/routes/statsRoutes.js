const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/overview', authMiddleware, statsController.getOverviewStats);
router.get('/dashboard', authMiddleware, statsController.getDashboardStats);
router.get('/revenue', authMiddleware, requireRole('admin'), statsController.getRevenueStats);
router.get('/material', authMiddleware, requireRole('admin'), statsController.getMaterialStats);
router.get('/product-profit', authMiddleware, requireRole('admin'), statsController.getProductProfitStats);
router.get('/florist-performance', authMiddleware, requireRole('admin'), statsController.getFloristPerformance);

module.exports = router;
