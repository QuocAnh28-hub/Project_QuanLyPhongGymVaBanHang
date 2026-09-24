const express = require('express');
const router = express.Router();

const DonhangController = require('../controllers/donhang.controller');
const checkout = require('../controllers/shop-checkout.controller');

router.get('/checkout/:accountId', checkout.preview);
router.post('/checkout/:accountId', checkout.create);
router.get('/account/:accountId/orders', checkout.list);
router.get('/account/:accountId/request/:requestKey', checkout.byRequest);
router.get('/account/:accountId/orders/:orderId', checkout.get);
router.post('/account/:accountId/orders/:orderId/demo-confirm', checkout.confirmDemo);
router.post('/:orderId/confirm-payment', checkout.confirmManual);

router.get('/', DonhangController.getAll);
router.get('/:DonHangID', DonhangController.getById);
router.post('/', DonhangController.create);
router.put('/:DonHangID', DonhangController.update);
router.delete('/:DonHangID', DonhangController.delete);

module.exports = router;
