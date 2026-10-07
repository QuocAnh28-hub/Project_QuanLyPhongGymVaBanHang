const express = require('express');
const router = express.Router();

const CheckinController = require('../controllers/checkin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', CheckinController.getAll);
router.get('/admin/today', CheckinController.getAdminToday);
router.get('/admin/history', CheckinController.getAdminHistory);
router.get('/admin/members', CheckinController.searchAdminMembers);
router.post('/admin/preview', requireRole('ADMIN', 'STAFF'), CheckinController.preview);
router.post('/admin/confirm', requireRole('ADMIN', 'STAFF'), CheckinController.confirm);
router.post('/token', CheckinController.createToken);
// app.js permits the legacy /scan path through; authenticate it here.
router.post('/scan', requireAuth, requireRole('ADMIN', 'STAFF'), CheckinController.scan);
router.get('/history/account/:TaiKhoanID', CheckinController.getHistoryByAccount);
router.post('/:CheckInID/checkout', CheckinController.checkout);
router.get('/:CheckInID', CheckinController.getById);

module.exports = router;
