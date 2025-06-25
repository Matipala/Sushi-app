const { supabase } = require('../config/supabase-config');

class BlogService {
    static async getAll() {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
        *,
        users (
          id,
          name
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(post => ({
            ...post,
            author: post.users,
            users: undefined
        }));
    }

    static async getById(id) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
        *,
        users (
          id,
          name
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw Object.assign(new Error('BlogPost not found'), { status: 404 });
            }
            throw error;
        }
        return {
            ...data,
            author: data.users
        };
    }

    static async delete(id) {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

module.exports = BlogService;
