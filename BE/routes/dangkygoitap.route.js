const express = require('express');
const router = express.Router();

const DangkygoitapController = require('../controllers/dangkygoitap.controller');

router.get('/', DangkygoitapController.getAll);
router.get('/admin', DangkygoitapController.getAdminAll);
router.get('/current/account/:TaiKhoanID', DangkygoitapController.getCurrentByAccount);
router.get('/owned/account/:TaiKhoanID', DangkygoitapController.getOwnedByAccount);
router.get('/detail/:DangKyID', DangkygoitapController.getDetailById);
router.get('/:DangKyID', DangkygoitapController.getById);
router.post('/register', DangkygoitapController.register);
router.post('/:DangKyID/renew', DangkygoitapController.renew);

module.exports = router;
