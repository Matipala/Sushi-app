const CategoryService = require('../service/CategoryService');

exports.getAll = async (req, res, next) => {
    try {
        const categories = await CategoryService.getAll();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const category = await CategoryService.getById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const category = await CategoryService.create(req.body);
        res.status(201).json(category);
    } catch (e) {
        next(e);
    }
};

exports.update = async (req, res, next) => {
    try {
        const updated = await CategoryService.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const deleted = await CategoryService.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};
