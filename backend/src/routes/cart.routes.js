const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const CartController = require('../controller/CartController');

router.use(auth);
router.get('/', CartController.list);
router.post('/', CartController.addOrUpdate);
router.put('/:id', CartController.changeQty);
router.delete('/:id', CartController.remove);

module.exports = router;
