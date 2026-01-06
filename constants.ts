export const TMDB_API_KEY = '4f10ec4dbb0a90737737dc9ffd5506c3';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const VIDEO_PROVIDERS = [
  {
    id: 'rive',
    name: 'Rive',
    movie: (id: number) => `https://rivestream.org/embed?type=movie&id=${id}&autoplay=1&autoPlay=true`,
    tv: (id: number, s: number, e: number) => `https://rivestream.org/embed?type=tv&id=${id}&season=${s}&episode=${e}&autoplay=1&autoPlay=true`,
  },
  {
    id: 'vidsrccc',
    name: 'VidSrc.CC',
    movie: (id: number) => `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=true&u=1`,
    tv: (id: number, s: number, e: number) => `https://vidsrc.cc/v3/embed/tv/${id}/${s}/${e}?autoPlay=true&u=1`,
  },
  {
    id: 'vidking',
    name: 'VidKing',
    movie: (id: number) => `https://www.vidking.net/embed/movie/${id}?color=34cfeb&autoPlay=true`,
    tv: (id: number, s: number, e: number) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}?color=34cfeb&autoPlay=true&nextEpisode=true&episodeSelector=true`,
  },
];