const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const FavoriteController = require('../controller/FavoriteBlogController');

router.use(auth);

router.get('/', FavoriteController.list);
router.post('/', FavoriteController.add);
router.delete('/:postId', FavoriteController.remove);

module.exports = router;
