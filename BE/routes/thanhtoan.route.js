const express = require('express');
const router = express.Router();

const ThanhtoanController = require('../controllers/thanhtoan.controller');

router.get('/', ThanhtoanController.getAll);
router.get('/:ThanhToanID', ThanhtoanController.getById);
router.post('/', ThanhtoanController.create);
router.put('/:ThanhToanID', ThanhtoanController.update);
router.delete('/:ThanhToanID', ThanhtoanController.delete);

module.exports = router;
