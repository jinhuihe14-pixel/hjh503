const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/low-stock', authMiddleware, materialController.getLowStockMaterials);
router.get('/:id', authMiddleware, materialController.getMaterialDetail);
router.get('/', authMiddleware, materialController.getMaterials);

router.post('/', authMiddleware, requireRole('admin'), materialController.createMaterial);
router.put('/:id', authMiddleware, requireRole('admin'), materialController.updateMaterial);
router.delete('/:id', authMiddleware, requireRole('admin'), materialController.deleteMaterial);

router.post('/stock-in', authMiddleware, requireRole('admin'), materialController.stockIn);
router.post('/stock-out', authMiddleware, requireRole('admin'), materialController.stockOut);
router.get('/stock/records', authMiddleware, materialController.getStockRecords);

module.exports = router;
