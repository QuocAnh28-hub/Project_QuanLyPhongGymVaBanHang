const express = require('express');
const router = express.Router();

const GoitapController = require('../controllers/goitap.controller');

router.get('/', GoitapController.getAll);
router.get('/active', GoitapController.getActive);
router.get('/active/:GoiTapID/voucher', require('../controllers/package-voucher.controller'));
router.get('/active/:GoiTapID', GoitapController.getActiveById);
router.get('/admin/:GoiTapID', GoitapController.getAdminById);
router.get('/:GoiTapID', GoitapController.getById);
router.post('/', GoitapController.create);
router.put('/:GoiTapID', GoitapController.update);
router.patch('/:GoiTapID/status', GoitapController.setStatus);
router.delete('/:GoiTapID', GoitapController.delete);

module.exports = router;
