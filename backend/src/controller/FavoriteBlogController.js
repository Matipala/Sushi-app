const FavoriteBlogService = require('../service/FavoriteBlogService');

exports.list = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const favorites = await FavoriteBlogService.listFavorites(userId);
        res.json(favorites);
    } catch (err) {
        next(err);
    }
};

exports.add = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { postId } = req.body;
        const fav = await FavoriteBlogService.addFavorite(userId, postId);
        res.status(201).json(fav);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({ error: 'postId is required' });
        }
        await FavoriteBlogService.removeFavorite(userId, postId);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};
