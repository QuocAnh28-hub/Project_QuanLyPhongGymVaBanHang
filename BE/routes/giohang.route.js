const express = require('express');
const router = express.Router();

const GiohangController = require('../controllers/giohang.controller');

router.get('/', GiohangController.getAll);
router.get('/:GioHangID', GiohangController.getById);
router.post('/', GiohangController.create);
router.put('/:GioHangID', GiohangController.update);
router.delete('/:GioHangID', GiohangController.delete);

module.exports = router;
