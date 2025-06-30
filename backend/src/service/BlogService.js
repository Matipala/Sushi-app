const { supabase } = require('../config/supabase-config');

class BlogService {
    static async getAll() {
        const { data: posts, error: postsErr } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (postsErr) throw postsErr;

        const authorIds = [...new Set(posts.map(p => p.author_id))];

        const { data: users, error: usersErr } = await supabase
            .from('users')
            .select('id, name')
            .in('id', authorIds);
        if (usersErr) throw usersErr;

        return posts.map(p => ({
            ...p,
            author: users.find(u => u.id === p.author_id) || { id: null, name: 'Unknown author' }
        }));
    }

    static async getById(id) {
        const { data: post, error: postErr } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();
        if (postErr) {
            if (postErr.code === 'PGRST116') {
                throw Object.assign(new Error('BlogPost not found'), { status: 404 });
            }
            throw postErr;
        }

        const { data: user, error: userErr } = await supabase
            .from('users')
            .select('id, name')
            .eq('id', post.author_id)
            .single();
        if (userErr) throw userErr;

        return {
            ...post,
            author: user || { id: null, name: 'Unknown author' }
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
