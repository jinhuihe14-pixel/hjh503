const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/my', authMiddleware, orderController.getMyOrders);
router.get('/florist', authMiddleware, requireRole('florist'), orderController.getFloristOrders);
router.get('/:id', authMiddleware, orderController.getOrderDetail);
router.get('/', authMiddleware, orderController.getOrders);

router.post('/', authMiddleware, orderController.createOrder);
router.put('/:id/assign', authMiddleware, requireRole('admin'), orderController.assignOrder);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;
