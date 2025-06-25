const { supabase } = require('../config/supabase-config');

class MenuItemService {
    static async getAll() {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async getById(id) {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                const notFound = new Error('MenuItem not found');
                notFound.status = 404;
                throw notFound;
            }
            throw error;
        }
        return data;
    }

    static async create(fields) {
        const { data, error } = await supabase
            .from('menu_items')
            .insert([fields])
            .single();

        if (error) throw error;
        return data;
    }

    static async update(id, fields) {
        const { data, error } = await supabase
            .from('menu_items')
            .update(fields)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                const notFound = new Error('MenuItem not found');
                notFound.status = 404;
                throw notFound;
            }
            throw error;
        }
        return data;
    }

    static async delete(id) {
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

module.exports = MenuItemService;
