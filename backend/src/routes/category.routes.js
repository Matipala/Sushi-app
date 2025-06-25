const express = require('express');
const CategoryController = require('../controller/CategoryController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

router.post('/', auth, authorize('admin'), CategoryController.create);
router.put('/:id', auth, authorize('admin'), CategoryController.update);
router.delete('/:id', auth, authorize('admin'), CategoryController.remove);

module.exports = router;
