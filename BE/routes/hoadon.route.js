const express = require('express');
const router = express.Router();

const HoadonController = require('../controllers/hoadon.controller');

router.get('/', HoadonController.getAll);
router.get('/:HoaDonID', HoadonController.getById);
router.post('/', HoadonController.create);
router.put('/:HoaDonID', HoadonController.update);
router.delete('/:HoaDonID', HoadonController.delete);

module.exports = router;
