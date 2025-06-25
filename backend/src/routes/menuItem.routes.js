const express = require('express');
const MenuItemController = require('../controller/MenuItemController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', MenuItemController.getAll);
router.get('/:id', MenuItemController.getById);

router.post('/', auth, authorize('admin'), MenuItemController.create);
router.put('/:id', auth, authorize('admin'), MenuItemController.update);
router.delete('/:id', auth, authorize('admin'), MenuItemController.remove);

module.exports = router;
