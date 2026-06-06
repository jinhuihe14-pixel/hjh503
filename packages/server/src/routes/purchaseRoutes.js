const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/', authMiddleware, purchaseController.getPurchaseOrders);
router.get('/auto-generate', authMiddleware, requireRole('admin'), purchaseController.generateAutoPurchase);
router.post('/', authMiddleware, requireRole('admin'), purchaseController.createPurchaseOrder);
router.put('/:id/receive', authMiddleware, requireRole('admin'), purchaseController.receivePurchaseOrder);

module.exports = router;
