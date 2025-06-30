const { supabase } = require('../config/supabase-config');

class FavoriteBlogService {
    static async addFavorite(userId, postId) {
        const { data, error } = await supabase
            .from('favorite_blog_posts')
            .insert([{ user_id: userId, post_id: postId }])
            .single();
        if (error) throw error;
        return data;
    }

    static async listFavorites(userId) {
        const { data, error } = await supabase
            .from('favorite_blog_posts')
            .select('post_id')
            .eq('user_id', userId);
        if (error) throw error;
        return data.map(r => r.post_id);
    }

    static async removeFavorite(userId, postId) {
        const { error } = await supabase
            .from('favorite_blog_posts')
            .delete()
            .match({ user_id: userId, post_id: postId });
        if (error) throw error;
    }
}

module.exports = FavoriteBlogService;
