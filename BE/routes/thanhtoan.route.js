const express = require('express');
const router = express.Router();

const { requireRole } = require('../middleware/auth');
const ThanhtoanController = require('../controllers/thanhtoan.controller');

router.get('/', ThanhtoanController.getAll);
router.get('/history/account/:TaiKhoanID', ThanhtoanController.getHistoryByAccount);
router.get('/package/:ThanhToanID', ThanhtoanController.getPackagePaymentDetail);
router.get('/registration/:DangKyID', ThanhtoanController.getByRegistration);
router.post('/package', ThanhtoanController.createPackagePayment);
router.post('/:ThanhToanID/confirm', requireRole('ADMIN','STAFF'), ThanhtoanController.confirmPackagePayment);
router.post('/:ThanhToanID/cancel', requireRole('ADMIN'), ThanhtoanController.cancelPackagePayment);
router.get('/:ThanhToanID', ThanhtoanController.getById);

module.exports = router;
