
import { supabase } from './supabaseClient';
import { PlaybackMetadata } from '../utils/playbackId';

export const playbackService = {
    /**
     * Logs the start of a playback session.
     */
    async startPlayback(playbackId: string, metadata: PlaybackMetadata) {
        console.log(`[Playback] Start: ${playbackId}`, metadata);

        // Attempt to persist to Supabase
        // Note: This table might need to be created in your Supabase project
        const { error } = await supabase.from('playback_sessions').insert([{
            id: playbackId,
            user_id: metadata.userId === 'anonymous' ? null : metadata.userId,
            content_id: metadata.contentId,
            content_type: metadata.contentType,
            season_number: metadata.seasonNumber,
            episode_number: metadata.episodeNumber,
            device_type: metadata.deviceType,
            started_at: new Date(metadata.timestamp).toISOString(),
            status: 'playing',
        }]);

        if (error) {
            // It's expected to fail if the table doesn't exist, so we just warn
            console.warn('[Playback] Error syncing start (backend might be missing table):', error.message);
        }
    },

    /**
     * Updates the playback progress / heartbeat.
     * Can be called periodically (e.g. every 30s) or on pause.
     */
    async updatePlayback(playbackId: string, progressSeconds: number) {
        console.log(`[Playback] Update: ${playbackId} - ${progressSeconds}s`);

        const { error } = await supabase.from('playback_sessions').update({
            last_position_seconds: progressSeconds,
            updated_at: new Date().toISOString()
        }).eq('id', playbackId);

        if (error) {
            console.warn('[Playback] Error syncing update:', error.message);
        }
    },

    /**
     * Logs the end of a playback session.
     */
    async endPlayback(playbackId: string, finalPosition: number) {
        console.log(`[Playback] End: ${playbackId} at ${finalPosition}s`);

        const { error } = await supabase.from('playback_sessions').update({
            status: 'stopped',
            last_position_seconds: finalPosition,
            ended_at: new Date().toISOString()
        }).eq('id', playbackId);

        if (error) {
            console.warn('[Playback] Error syncing end:', error.message);
        }
    }
};
