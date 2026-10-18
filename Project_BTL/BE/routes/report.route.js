const router = require('express').Router();
router.get('/admin', require('../controllers/report.controller').getAdmin);
module.exports = router;
