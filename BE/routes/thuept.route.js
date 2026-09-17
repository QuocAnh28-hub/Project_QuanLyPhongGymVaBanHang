const express = require('express');
const router = express.Router();

const ThueptController = require('../controllers/thuept.controller');

router.get('/', ThueptController.getAll);
router.get('/:ThuePTID', ThueptController.getById);
router.post('/', ThueptController.create);
router.put('/:ThuePTID', ThueptController.update);
router.delete('/:ThuePTID', ThueptController.delete);

module.exports = router;
