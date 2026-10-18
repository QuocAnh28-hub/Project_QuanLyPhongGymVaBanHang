const router = require('express').Router();
const controller = require('../controllers/thongbao.controller');

router.get('/account/:TaiKhoanID', controller.list);
router.post('/account/:TaiKhoanID/read-all', controller.markAllRead);
router.get('/preferences/account/:TaiKhoanID', controller.preferences);
router.put('/preferences/account/:TaiKhoanID', controller.updatePreferences);
router.post('/:ThongBaoID/read', controller.markRead);

module.exports = router;
