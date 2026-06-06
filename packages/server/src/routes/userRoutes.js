const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/florists', authMiddleware, userController.getFlorists);

router.get('/', authMiddleware, requireRole('admin'), userController.getUsers);
router.get('/:id', authMiddleware, requireRole('admin'), userController.getUserDetail);
router.post('/', authMiddleware, requireRole('admin'), userController.createUser);
router.put('/:id', authMiddleware, requireRole('admin'), userController.updateUser);
router.delete('/:id', authMiddleware, requireRole('admin'), userController.deleteUser);

module.exports = router;
