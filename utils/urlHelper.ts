
/**
 * URL Helper for parsing and constructing playback URLs.
 * Format:
 * - Movie: /watch/movie/{tmdbId}
 * - TV: /watch/tv/{tmdbId}/season/{season}/episode/{episode}
 * - TV (Compact - optional support): /watch/tv/{tmdbId}-s{season}e{episode}
 */

interface WatchParams {
    type: 'movie' | 'tv';
    id: number;
    season?: number;
    episode?: number;
}

export const urlHelper = {
    /**
     * Parses the current window path or a given path string.
     */
    parseWatchUrl(path: string = window.location.pathname): WatchParams | null {
        // Regex for Movie: /watch/movie/123
        const movieRegex = /\/watch\/movie\/(\d+)/;
        const movieMatch = path.match(movieRegex);
        if (movieMatch) {
            return {
                type: 'movie',
                id: parseInt(movieMatch[1], 10),
            };
        }

        // Regex for TV Standard: /watch/tv/123/season/1/episode/1
        const tvRegex = /\/watch\/tv\/(\d+)\/season\/(\d+)\/episode\/(\d+)/;
        const tvMatch = path.match(tvRegex);
        if (tvMatch) {
            return {
                type: 'tv',
                id: parseInt(tvMatch[1], 10),
                season: parseInt(tvMatch[2], 10),
                episode: parseInt(tvMatch[3], 10),
            };
        }

        // Regex for TV Compact: /watch/tv/123-s1e1 (Optional variant)
        const tvCompactRegex = /\/watch\/tv\/(\d+)-s(\d+)e(\d+)/;
        const tvCompactMatch = path.match(tvCompactRegex);
        if (tvCompactMatch) {
            return {
                type: 'tv',
                id: parseInt(tvCompactMatch[1], 10),
                season: parseInt(tvCompactMatch[2], 10),
                episode: parseInt(tvCompactMatch[3], 10),
            };
        }

        return null;
    },

    /**
     * Constructs a URL for the given parameters.
     */
    constructWatchUrl(params: WatchParams): string {
        if (params.type === 'movie') {
            return `/watch/movie/${params.id}`;
        } else {
            // Defaulting to the standard verbose format for clarity
            const s = params.season || 1;
            const e = params.episode || 1;
            return `/watch/tv/${params.id}/season/${s}/episode/${e}`;
        }
    },

    /**
     * Reverts URL to base state (e.g. home) or checks previous history.
     * For this app, checking previous might be complex without router, 
     * so we might default to clearing the watch path.
     */
    clearWatchUrl() {
        // Basic implementation: go back if we can, otherwise replace history to root
        if (window.location.pathname.startsWith('/watch')) {
            const url = new URL(window.location.href);
            // If we have an id search param (legacy), we might want to preserve it or just go home
            // Ideally, we go back to the details page if possible.
            // For now, let's just strip the path.
            window.history.pushState({}, '', '/');
        }
    }
};
