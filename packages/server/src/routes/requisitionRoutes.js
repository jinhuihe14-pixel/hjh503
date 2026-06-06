const express = require('express');
const router = express.Router();
const requisitionController = require('../controllers/requisitionController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/my', authMiddleware, requireRole('florist'), requisitionController.getMyRequisitions);
router.get('/material/:materialId', authMiddleware, requisitionController.getMaterialRequisitions);
router.get('/:id', authMiddleware, requisitionController.getRequisitionDetail);
router.get('/', authMiddleware, requisitionController.getRequisitions);
router.post('/', authMiddleware, requireRole('florist'), requisitionController.createRequisition);
router.put('/:id', authMiddleware, requireRole('florist'), requisitionController.updateRequisition);
router.put('/:id/approve', authMiddleware, requireRole('admin'), requisitionController.approveRequisition);

module.exports = router;
