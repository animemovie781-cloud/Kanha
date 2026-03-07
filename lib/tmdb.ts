const TMDB_API_KEY = '2e211dfda888f7cc55ce433d743f9bc3';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchTMDB = async (endpoint: string, params: Record<string, string | number> = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  return response.json();
};

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://picsum.photos/seed/anime/500/750';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getTrendingAnime = () => fetchTMDB('/discover/tv', {
  with_original_language: 'ja',
  with_genres: '16',
  sort_by: 'popularity.desc',
  page: 1
});

export const getPopularAnime = () => fetchTMDB('/discover/tv', {
  with_original_language: 'ja',
  with_genres: '16',
  sort_by: 'popularity.desc',
  page: 2
});

export const getTopRatedAnime = () => fetchTMDB('/discover/tv', {
  with_original_language: 'ja',
  with_genres: '16',
  sort_by: 'vote_average.desc',
  'vote_count.gte': 200,
  page: 1
});

export const getAnimeMovies = (page = 1) => fetchTMDB('/discover/movie', {
  with_original_language: 'ja',
  with_genres: '16',
  sort_by: 'popularity.desc',
  page
});

export const getRecentlyAddedAnime = () => fetchTMDB('/discover/tv', {
  with_original_language: 'ja',
  with_genres: '16',
  sort_by: 'first_air_date.desc',
  'vote_count.gte': 10,
  page: 1
});

export const getAnimeByGenre = (genreId: number, type: 'tv' | 'movie' = 'tv') => fetchTMDB(`/discover/${type}`, {
  with_original_language: 'ja',
  with_genres: `16,${genreId}`,
  sort_by: 'popularity.desc',
  page: 1
});

export const searchAnime = (query: string, page = 1) => fetchTMDB('/search/multi', {
  query,
  page
}).then(data => {
  // Filter for Japanese animation only
  if (data?.results) {
    data.results = data.results.filter((item: any) => 
      item.original_language === 'ja' && 
      item.genre_ids?.includes(16)
    );
  }
  return data;
});

export const getAnimeDetails = (id: string, type: 'tv' | 'movie' = 'tv') => fetchTMDB(`/${type}/${id}`, {
  append_to_response: 'recommendations,credits'
});

export const getAnimeSeason = (id: string, seasonNumber: number) => fetchTMDB(`/tv/${id}/season/${seasonNumber}`);
