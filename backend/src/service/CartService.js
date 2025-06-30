const { supabase } = require('../config/supabase-config');

class CartService {
    static async addOrUpdate(user_id, menu_item_id, quantity) {
        const { data, error } = await supabase
            .from('cart_items')
            .upsert(
                { user_id, menu_item_id, quantity },
                { onConflict: ['user_id', 'menu_item_id'], returning: 'representation' }
            );
        if (error) throw error;
        return Array.isArray(data) ? data[0] : data;
    }

    static async list(user_id) {
        const { data, error } = await supabase
            .from('cart_items')
            .select(`id, quantity, menu_items (
          id, name, description, price, image_url
        )`)
            .eq('user_id', user_id);
        if (error) throw error;
        return data.map(row => ({
            id: row.id,
            quantity: row.quantity,
            menu_item_id: row.menu_items.id,
            name: row.menu_items.name,
            description: row.menu_items.description,
            price: row.menu_items.price,
            image_url: row.menu_items.image_url
        }));
    }

    static async changeQty(id, quantity) {
        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }

    static async remove(id) {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

module.exports = CartService;
