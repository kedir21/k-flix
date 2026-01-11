
import { Movie, Episode } from '../types';

export interface PlaybackMetadata {
    contentType: 'movie' | 'tv';
    contentId: number | string;
    seasonNumber?: number;
    episodeNumber?: number;
    timestamp: number;
    userId?: string;
    deviceType: string;
}

/**
 * Generates a unique playback ID using UUID v4.
 * Fallback to manual generation if crypto.randomUUID is not available.
 */
export function generatePlaybackId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Creates the initial metadata object for a playback session.
 */
export function createPlaybackMetadata(
    content: { id: number | string; type: 'movie' | 'tv' },
    episode?: { season: number; episode: number },
    userId?: string
): PlaybackMetadata {
    return {
        contentType: content.type,
        contentId: content.id,
        seasonNumber: episode?.season,
        episodeNumber: episode?.episode,
        timestamp: Date.now(),
        userId: userId || 'anonymous',
        deviceType: getDeviceType(),
    };
}

/**
 * Simple helper to detect device type.
 */
function getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    if (/smart-tv|tv|webos|tizen/i.test(ua)) return 'tv';
    return 'desktop';
}
