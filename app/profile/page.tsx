'use client';

import { useState, useEffect } from 'react';
import { Navbar, BottomNav } from '@/components/Navigation';
import { useWatchStore } from '@/lib/store';
import { User, Settings, Clock, ChevronRight, LogOut, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { history, myList } = useWatchStore();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-black text-white pb-20 md:pb-0 pt-20 md:pt-24">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-[#00FF00] to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,0,0.2)]">
            <User className="w-12 h-12 md:w-16 md:h-16 text-black" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter mb-2">Guest User</h1>
            <p className="text-gray-400 text-sm md:text-base">Enjoying CineStream</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Clock className="w-8 h-8 text-[#00FF00] mb-3" />
            <span className="text-3xl font-black mb-1">{history.length}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Watched</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Heart className="w-8 h-8 text-[#00FF00] mb-3" />
            <span className="text-3xl font-black mb-1">{myList.length}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Saved</span>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Account Settings</h3>
          
          <Link href="/my-list" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#00FF00]/20 transition">
                <Heart className="w-5 h-5 group-hover:text-[#00FF00] transition" />
              </div>
              <span className="font-medium">My List</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition" />
          </Link>

          <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#00FF00]/20 transition">
                <Settings className="w-5 h-5 group-hover:text-[#00FF00] transition" />
              </div>
              <span className="font-medium">App Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-red-500/10 transition group mt-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <span className="font-medium text-red-500">Sign Out</span>
            </div>
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
