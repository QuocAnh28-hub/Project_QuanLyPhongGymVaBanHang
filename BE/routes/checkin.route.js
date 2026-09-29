const express = require('express');
const router = express.Router();

const CheckinController = require('../controllers/checkin.controller');

router.get('/', CheckinController.getAll);
router.get('/admin/today', CheckinController.getAdminToday);
router.get('/admin/history', CheckinController.getAdminHistory);
router.get('/admin/members', CheckinController.searchAdminMembers);
router.post('/token', CheckinController.createToken);
router.post('/scan', CheckinController.scan);
router.get('/history/account/:TaiKhoanID', CheckinController.getHistoryByAccount);
router.post('/:CheckInID/checkout', CheckinController.checkout);
router.get('/:CheckInID', CheckinController.getById);
router.post('/', CheckinController.create);
router.put('/:CheckInID', CheckinController.update);
router.delete('/:CheckInID', CheckinController.delete);

module.exports = router;
