
import { VIDEO_PROVIDERS } from '../constants';
import { VideoSource } from '../types';

export const extractorService = {
  getSources(id: number, type: 'movie' | 'tv', season?: number, episode?: number, imdbId?: string): VideoSource[] {
    return VIDEO_PROVIDERS.map((p: any) => ({
      provider: p.name,
      url: type === 'movie' ? p.movie(id, imdbId) : p.tv(id, season || 1, episode || 1, imdbId),
      type: 'iframe' as const,
      quality: 'HD'
    })).filter(s => s.url && s.url.length > 0);
  },

  /**
   * DEEP SNIFFER
   * For the "Minimalist" request, we ensure the native takeover is smooth.
   */
  async resolveToNative(source: VideoSource): Promise<VideoSource> {
    try {
      if (source.provider === 'SuperEmbed') {
        const response = await fetch(source.url);
        if (!response.ok) throw new Error('Failed to fetch SuperEmbed');
        const embeddedUrl = await response.text();
        // If the response is a valid URL, return it as the new source URL
        if (embeddedUrl.startsWith('http')) {
          return { ...source, url: embeddedUrl.trim() };
        }
      }

      // Direct pass-through for reliable iframe providers.
      // Future: Implement .m3u8 extraction for high-performance native playback.
      return source;
    } catch (e) {
      console.error('Error resolving source:', e);
      return source;
    }
  }
};
