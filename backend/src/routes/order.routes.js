const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const OrderController = require('../controller/OrderController');

router.post('/', auth, OrderController.create);

module.exports = router;
