const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);

router.post('/', authMiddleware, requireRole('admin'), productController.createProduct);
router.put('/:id', authMiddleware, requireRole('admin'), productController.updateProduct);
router.delete('/:id', authMiddleware, requireRole('admin'), productController.deleteProduct);

module.exports = router;
