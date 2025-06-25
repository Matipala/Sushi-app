const OrderService = require('../service/OrderService');

exports.create = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const items = req.body.items;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }
        const result = await OrderService.createOrder(userId, items);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};
