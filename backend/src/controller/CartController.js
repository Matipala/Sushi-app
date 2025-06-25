const CartService = require('../service/CartService');

exports.list = async (req, res, next) => {
    try {
        const items = await CartService.list(req.user.id);
        res.json(items);
    } catch (err) {
        next(err);
    }
};

exports.addOrUpdate = async (req, res, next) => {
    try {
        const { menu_item_id, quantity } = req.body;
        const item = await CartService.addOrUpdate(req.user.id, menu_item_id, quantity);
        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
};

exports.changeQty = async (req, res, next) => {
    try {
        const quantity = Number(req.body.quantity);
        const item = await CartService.changeQty(req.params.id, quantity);
        res.json(item);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await CartService.remove(req.params.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};
