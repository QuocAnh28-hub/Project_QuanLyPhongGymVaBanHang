const express = require('express');
const router = express.Router();

const KhoController = require('../controllers/kho.controller');

router.get('/', KhoController.getAll);
router.get('/:KhoID', KhoController.getById);
router.post('/', KhoController.create);
router.put('/:KhoID', KhoController.update);
router.delete('/:KhoID', KhoController.delete);

module.exports = router;
