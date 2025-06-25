const BlogService = require('../service/BlogService');

exports.getAll = async (req, res, next) => {
    try {
        const posts = await BlogService.getAll();
        res.json(posts);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const post = await BlogService.getById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const newPost = await BlogService.create(req.body);
        res.status(201).json(newPost);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const updatedPost = await BlogService.update(req.params.id, req.body);
        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(updatedPost);
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const deleted = await BlogService.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};
