const express = require('express');
const router = express.Router();

const GoitapController = require('../controllers/goitap.controller');

router.get('/', GoitapController.getAll);
router.get('/active', GoitapController.getActive);
router.get('/active/:GoiTapID', GoitapController.getActiveById);
router.get('/:GoiTapID', GoitapController.getById);
router.post('/', GoitapController.create);
router.put('/:GoiTapID', GoitapController.update);
router.delete('/:GoiTapID', GoitapController.delete);

module.exports = router;
