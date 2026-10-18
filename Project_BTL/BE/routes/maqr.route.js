const express = require('express');
const router = express.Router();

const MaqrController = require('../controllers/maqr.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', MaqrController.getAll);
router.get('/admin', MaqrController.getAdmin);
router.delete('/admin/expired', requireAuth, requireRole('ADMIN', 'STAFF'), MaqrController.cleanupExpired);
router.get('/:MaQRID', MaqrController.getById);
router.patch('/:MaQRID/revoke', MaqrController.revoke);

module.exports = router;
