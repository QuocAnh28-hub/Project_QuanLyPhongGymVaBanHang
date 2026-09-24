const express = require('express');
const router = express.Router();

const DangkygoitapController = require('../controllers/dangkygoitap.controller');

router.get('/', DangkygoitapController.getAll);
router.get('/current/account/:TaiKhoanID', DangkygoitapController.getCurrentByAccount);
router.get('/detail/:DangKyID', DangkygoitapController.getDetailById);
router.get('/:DangKyID', DangkygoitapController.getById);
router.post('/register', DangkygoitapController.register);
router.post('/', DangkygoitapController.create);
router.put('/:DangKyID', DangkygoitapController.update);
router.delete('/:DangKyID', DangkygoitapController.delete);

module.exports = router;
