const express = require('express');
const router = express.Router();

const ThueptController = require('../controllers/thuept.controller');

router.get('/', ThueptController.getAll);
router.post('/book', ThueptController.book);
router.get('/account/:TaiKhoanID', ThueptController.getByAccount);
router.get('/detail/:ThuePTID', ThueptController.getDetail);
router.post('/:ThuePTID/confirm', ThueptController.confirm);
router.post('/:ThuePTID/cancel', ThueptController.cancel);
router.get('/:ThuePTID', ThueptController.getById);
router.post('/', ThueptController.create);
router.put('/:ThuePTID', ThueptController.update);
router.delete('/:ThuePTID', ThueptController.delete);

module.exports = router;
