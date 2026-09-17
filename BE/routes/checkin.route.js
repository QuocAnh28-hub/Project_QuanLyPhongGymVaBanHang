const express = require('express');
const router = express.Router();

const CheckinController = require('../controllers/checkin.controller');

router.get('/', CheckinController.getAll);
router.get('/:CheckInID', CheckinController.getById);
router.post('/', CheckinController.create);
router.put('/:CheckInID', CheckinController.update);
router.delete('/:CheckInID', CheckinController.delete);

module.exports = router;
