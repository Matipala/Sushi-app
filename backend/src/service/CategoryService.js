const { supabase } = require('../config/supabase-config');

class CategoryService {
    static async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*');

        if (error) throw error;
        return data;
    }

    static async getById(id) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            error.status = error.code === 'PGRST116' ? 404 : error.code; // supabase "no row" code
            throw error;
        }
        return data;
    }

    static async create({ name }) {
        if (!name || typeof name !== 'string') {
            const err = new Error('El campo "name" es obligatorio y debe ser texto');
            err.status = 400;
            throw err;
        }

        const { data, error } = await supabase
            .from('categories')
            .insert(
                [{ name }],
                { returning: 'representation' }
            )
            .single();

        if (error) {
            if (error.code === '23505') {
                const err = new Error(`Ya existe una categoría con el nombre "${name}"`);
                err.status = 409;
                throw err;
            }
            throw error;
        }

        return data;
    }

    static async update(id, { name }) {
        if (name != null && typeof name !== 'string') {
            const err = new Error('Si envías "name", debe ser texto');
            err.status = 400;
            throw err;
        }

        const { data: existing, error: fetchErr } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchErr) {
            fetchErr.status = fetchErr.code === 'PGRST116' ? 404 : fetchErr.code;
            throw fetchErr;
        }

        const { data, error } = await supabase
            .from('categories')
            .update(
                { name: name ?? existing.name },
                { returning: 'representation' }
            )
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === '23505') {
                const err = new Error(`Ya existe una categoría con el nombre "${name}"`);
                err.status = 409;
                throw err;
            }
            throw error;
        }

        return data;
    }

    static async delete(id) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            error.status = error.code === 'PGRST116' ? 404 : error.code;
            throw error;
        }
    }
}

module.exports = CategoryService;
