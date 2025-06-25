const { supabase } = require('../config/supabase-config');

class OrderService {
    static async createOrder(userId, items) {
        const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .insert([{ user_id: userId, total }], { returning: 'representation' })
            .single();
        if (orderErr) throw orderErr;

        const toInsert = items.map(i => ({
            order_id: order.id,
            menu_item_id: i.menu_item_id || i.id,
            quantity: i.quantity,
            price: i.price
        }));

        const { error: itemsErr } = await supabase
            .from('order_items')
            .insert(toInsert);
        if (itemsErr) throw itemsErr;

        return { order, items: toInsert };
    }
}

module.exports = OrderService;
