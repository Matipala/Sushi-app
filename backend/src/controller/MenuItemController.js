const MenuItemService = require('../service/MenuItemService');

exports.getAll = async (req, res, next) => {
    try {
        const items = await MenuItemService.getAll();
        res.json(items);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const item = await MenuItemService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const newItem = await MenuItemService.create(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const updated = await MenuItemService.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const deleted = await MenuItemService.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};
