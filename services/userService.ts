
import { supabase } from './supabaseClient';
import { Movie } from '../types';

export const userService = {
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    async updateProfile(userId: string, updates: any) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
        return data;
    },

    async getWatchlist(userId: string) {
        const { data, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', userId)
            .order('added_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async addToWatchlist(userId: string, movie: Movie) {
        const { error } = await supabase
            .from('watchlist')
            .insert([
                {
                    user_id: userId,
                    content_id: movie.id,
                    content_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
                    content_data: movie
                }
            ]);

        if (error) throw error;
    },

    async removeFromWatchlist(userId: string, contentId: number) {
        const { error } = await supabase
            .from('watchlist')
            .delete()
            .eq('user_id', userId)
            .eq('content_id', contentId);

        if (error) throw error;
    },

    async getFavorites(userId: string) {
        const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    async toggleFavorite(userId: string, movie: Movie) {
        // Check if exists
        const { data: existing } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .eq('content_id', movie.id)
            .single();

        if (existing) {
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('content_id', movie.id);
        } else {
            await supabase
                .from('favorites')
                .insert([
                    {
                        user_id: userId,
                        content_id: movie.id,
                        content_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
                        content_data: movie
                    }
                ]);
        }
    }
};
