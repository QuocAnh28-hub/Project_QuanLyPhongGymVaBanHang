const express = require('express');
const router = express.Router();

const ThueptController = require('../controllers/thuept.controller');

router.get('/', ThueptController.getAll);
router.post('/book', ThueptController.book);
router.get('/account/:TaiKhoanID', ThueptController.getByAccount);
router.get('/detail/:ThuePTID', ThueptController.getDetail);
router.post('/:ThuePTID/confirm', ThueptController.confirm);
router.post('/:ThuePTID/cancel', ThueptController.cancel);
router.post('/:ThuePTID/complete', ThueptController.complete);
router.get('/:ThuePTID', ThueptController.getById);

module.exports = router;
