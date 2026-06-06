const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/my', authMiddleware, salaryController.getMySalary);
router.get('/', authMiddleware, requireRole('admin'), salaryController.getSalaryRecords);
router.post('/calculate', authMiddleware, requireRole('admin'), salaryController.calculateSalary);
router.put('/:id', authMiddleware, requireRole('admin'), salaryController.updateSalary);
router.put('/:id/confirm', authMiddleware, requireRole('admin'), salaryController.confirmSalary);

module.exports = router;
