const express = require('express');
const router = express.Router();
const scrapController = require('../controllers/scrapController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/', authMiddleware, scrapController.getScrapRecords);
router.post('/', authMiddleware, scrapController.createScrapRecord);
router.put('/:id/approve', authMiddleware, requireRole('admin'), scrapController.approveScrap);

module.exports = router;
