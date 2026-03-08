'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar, BottomNav } from '@/components/Navigation';
import { AnimeCard } from '@/components/AnimeCard';
import { getAnimeMovies, fetchTMDB } from '@/lib/tmdb';

export default function FilterPage() {
  const [activeTab, setActiveTab] = useState<'tv' | 'movie'>('tv');
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      let data;
      if (activeTab === 'tv') {
        data = await fetchTMDB('/discover/tv', {
          with_original_language: 'ja',
          with_genres: '16',
          sort_by: 'popularity.desc',
          page
        });
      } else {
        data = await getAnimeMovies(page);
      }

      if (!data?.results || data.results.length === 0 || page >= data.total_pages) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...data.results]);
        setPage(p => p + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, loading, hasMore]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [activeTab]);

  useEffect(() => {
    if (page === 1 && items.length === 0) {
      fetchMore();
    }
  }, [page, items, fetchMore]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchMore]);

  return (
    <main className="min-h-screen bg-[#141414] text-white pb-20 md:pb-0 pt-20 md:pt-24 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-6 py-2.5 rounded font-bold whitespace-nowrap transition-all ${
              activeTab === 'tv' 
                ? 'bg-white text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Anime Series
          </button>
          <button
            onClick={() => setActiveTab('movie')}
            className={`px-6 py-2.5 rounded font-bold whitespace-nowrap transition-all ${
              activeTab === 'movie' 
                ? 'bg-white text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Anime Movies
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {items.map((anime, index) => {
            if (items.length === index + 1) {
              return (
                <div ref={lastElementRef} key={anime.id}>
                  <AnimeCard anime={anime} type={activeTab} />
                </div>
              );
            }
            return <AnimeCard key={anime.id} anime={anime} type={activeTab} />;
          })}
        </div>

        {loading && (
          <div className="flex justify-center mt-12 pb-8">
            <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
