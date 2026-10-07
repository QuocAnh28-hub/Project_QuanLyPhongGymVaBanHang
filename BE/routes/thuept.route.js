const express = require('express');
const router = express.Router();

const { requireRole } = require('../middleware/auth');
const ThueptController = require('../controllers/thuept.controller');

router.get('/', ThueptController.getAll);
router.post('/book', ThueptController.book);
router.get('/account/:TaiKhoanID', ThueptController.getByAccount);
router.get('/detail/:ThuePTID', ThueptController.getDetail);
router.post('/:ThuePTID/confirm-payment', requireRole('ADMIN','STAFF'), ThueptController.confirmPayment);
router.post('/:ThuePTID/confirm', requireRole('ADMIN','STAFF'), ThueptController.confirm);
router.post('/:ThuePTID/cancel', ThueptController.cancel);
router.post('/:ThuePTID/complete', requireRole('ADMIN','STAFF'), ThueptController.complete);
router.get('/:ThuePTID', ThueptController.getById);

module.exports = router;
