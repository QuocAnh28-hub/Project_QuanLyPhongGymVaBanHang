const express = require('express');
const router = express.Router();

const DonhangController = require('../controllers/donhang.controller');
const { requireRole } = require('../middleware/auth');
const checkout = require('../controllers/shop-checkout.controller');

router.get('/checkout/:accountId', checkout.preview);
router.post('/checkout/:accountId', checkout.create);
router.get('/account/:accountId/orders', checkout.list);
router.get('/account/:accountId/request/:requestKey', checkout.byRequest);
router.get('/account/:accountId/orders/:orderId', checkout.get);
router.post('/:orderId/confirm-payment', requireRole('ADMIN', 'STAFF'), checkout.confirmManual);

router.get('/', DonhangController.getAll);
router.get('/:DonHangID', DonhangController.getById);
router.patch('/:DonHangID/delivery', DonhangController.updateDelivery);
router.post('/:DonHangID/status', DonhangController.transitionStatus);

module.exports = router;
