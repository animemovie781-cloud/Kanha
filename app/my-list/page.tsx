'use client';

import { useState, useEffect } from 'react';
import { Navbar, BottomNav } from '@/components/Navigation';
import { AnimeCard } from '@/components/AnimeCard';
import { useWatchStore } from '@/lib/store';
import { Bookmark } from 'lucide-react';

export default function MyListPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { myList } = useWatchStore();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-black text-white pb-20 md:pb-0 pt-20 md:pt-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <Bookmark className="w-8 h-8 text-[#00FF00]" />
          <h1 className="text-2xl md:text-3xl font-bold">My List</h1>
        </div>

        {myList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bookmark className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your list is empty</h2>
            <p className="text-gray-400 max-w-md">
              Save shows and movies to keep track of what you want to watch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {myList.map((item) => (
              <AnimeCard 
                key={item.id} 
                anime={{
                  id: item.id,
                  name: item.title,
                  title: item.title,
                  poster_path: item.posterPath,
                  vote_average: item.voteAverage,
                  first_air_date: item.releaseDate,
                  release_date: item.releaseDate
                }} 
                type={item.type} 
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
