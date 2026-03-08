'use client';

import { useState, useEffect } from 'react';
import { Navbar, BottomNav } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { ContentRail } from '@/components/ContentRail';
import { useWatchStore } from '@/lib/store';
import {
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  getAnimeMovies,
  getRecentlyAddedAnime,
  getAnimeByGenre
} from '@/lib/tmdb';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { history } = useWatchStore();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          trending,
          popular,
          topRated,
          movies,
          recentlyAdded,
          action,
          romance,
          comedy,
          fantasy
        ] = await Promise.all([
          getTrendingAnime(),
          getPopularAnime(),
          getTopRatedAnime(),
          getAnimeMovies(),
          getRecentlyAddedAnime(),
          getAnimeByGenre(10759), // Action & Adventure
          getAnimeByGenre(10749), // Romance
          getAnimeByGenre(35),    // Comedy
          getAnimeByGenre(10765)  // Sci-Fi & Fantasy
        ]);

        setData({
          trending,
          popular,
          topRated,
          movies,
          recentlyAdded,
          action,
          romance,
          comedy,
          fantasy
        });
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load content. Please try again later.");
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-[#E50914] text-white px-6 py-2 rounded font-bold">Retry</button>
        </div>
      </main>
    );
  }

  if (!data || !data.trending?.results?.length) {
    return (
      <main className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const heroAnime = data.trending.results[0];

  // Map history items to TMDB anime format for the ContentRail
  const continueWatchingItems = isMounted ? history.map(h => ({
    id: h.id,
    name: h.title,
    title: h.title,
    poster_path: h.posterPath,
    backdrop_path: h.backdropPath,
    media_type: h.type,
    vote_average: 0 // Placeholder
  })) : [];

  return (
    <main className="min-h-screen bg-[#141414] text-white pb-20 md:pb-0 font-sans">
      <Navbar />
      <Hero anime={heroAnime} />
      
      <div className="-mt-20 sm:-mt-32 relative z-10 space-y-2 sm:space-y-4 md:space-y-6 pb-8">
        {continueWatchingItems.length > 0 && (
          <ContentRail title="Continue Watching" items={continueWatchingItems} />
        )}
        <ContentRail title="Trending Now" items={data.trending.results.slice(1)} />
        <ContentRail title="Popular on Animeflix" items={data.popular.results} />
        <ContentRail title="Top Rated" items={data.topRated.results} />
        <ContentRail title="Anime Movies" items={data.movies.results} type="movie" />
        <ContentRail title="Recently Added" items={data.recentlyAdded.results} />
        <ContentRail title="Action Packed" items={data.action.results} />
        <ContentRail title="Romance" items={data.romance.results} />
        <ContentRail title="Comedy" items={data.comedy.results} />
        <ContentRail title="Fantasy Worlds" items={data.fantasy.results} />
      </div>

      <BottomNav />
    </main>
  );
}

