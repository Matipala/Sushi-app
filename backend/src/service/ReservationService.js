const { supabase } = require('../config/supabase-config');

class ReservationService {
    static async getAll() {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async getById(id) {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                const notFound = new Error('Reservation not found');
                notFound.status = 404;
                throw notFound;
            }
            throw error;
        }
        return data;
    }

    static async create(fields) {
        const { data, error } = await supabase
            .from('reservations')
            .insert([fields])
            .single();

        if (error) throw error;
        return data;
    }

    static async update(id, fields) {
        const { data, error } = await supabase
            .from('reservations')
            .update(fields)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                const notFound = new Error('Reservation not found');
                notFound.status = 404;
                throw notFound;
            }
            throw error;
        }
        return data;
    }

    static async delete(id) {
        const { error } = await supabase
            .from('reservations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

module.exports = ReservationService;
