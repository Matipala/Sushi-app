const router = require('express').Router();
const BlogController = require('../controller/BlogController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/', BlogController.getAll);
router.get('/:id', BlogController.getById);

router.post('/', auth, authorize(['admin', 'editor']), BlogController.create);
router.put('/:id', auth, authorize(['admin', 'editor']), BlogController.update);

router.delete('/:id', auth, authorize('admin'), BlogController.remove);

module.exports = router;
