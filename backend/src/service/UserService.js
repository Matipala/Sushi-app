const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase-config');
require('dotenv').config();

class UserService {
    static async register({ name, email, password }) {
        const passwordHash = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ name, email, password_hash: passwordHash }])
            .select('id, name, email, role')
            .single();

        if (error) {
            if (error.code === '23505') {
                const err = new Error('Email already in use');
                err.status = 409;
                throw err;
            }
            throw error;
        }

        return user;
    }

    static async login({ email, password }) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, password_hash, role')
            .eq('email', email)
            .single();

        if (error) {
            const err = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            const err = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        };
    }
}

module.exports = UserService;
