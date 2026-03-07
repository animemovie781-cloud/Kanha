'use client';

import { useState, useEffect } from 'react';
import { Navbar, BottomNav } from '@/components/Navigation';
import { AnimeCard } from '@/components/AnimeCard';
import { searchAnime } from '@/lib/tmdb';
import { Search as SearchIcon, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    let active = true;
    const fetchResults = async () => {
      if (debouncedQuery) {
        setLoading(true);
        try {
          const data = await searchAnime(debouncedQuery);
          if (active) {
            setResults(data?.results || []);
          }
        } finally {
          if (active) setLoading(false);
        }
      } else {
        setResults([]);
      }
    };
    fetchResults();
    return () => { active = false; };
  }, [debouncedQuery]);

  return (
    <main className="min-h-screen bg-black text-white pb-20 md:pb-0 pt-20 md:pt-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-3xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime series or movies..."
            className="w-full bg-white/10 border border-white/20 rounded-full py-4 pl-12 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] transition-all shadow-lg"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center mt-12">
            <div className="w-8 h-8 border-2 border-[#00FF00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="mt-8 md:mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} type={anime.media_type === 'movie' ? 'movie' : 'tv'} />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            No results found for &quot;{query}&quot;
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
