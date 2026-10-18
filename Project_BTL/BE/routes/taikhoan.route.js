const express = require('express');
const router = express.Router();

const TaikhoanController = require('../controllers/taikhoan.controller');

router.get('/', TaikhoanController.getAll);
router.get('/:TaiKhoanID', TaikhoanController.getById);
router.post('/', TaikhoanController.create);
router.post('/register', require('../controllers/register.controller'));
router.post('/:TaiKhoanID/change-password', TaikhoanController.changePassword);
router.put('/:TaiKhoanID', TaikhoanController.update);
router.delete('/:TaiKhoanID', TaikhoanController.delete);

module.exports = router;
