'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Home, Bookmark, User, Bell, Info } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="px-4 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-[#E50914] text-2xl md:text-3xl font-black tracking-tighter">
            ANIMEFLIX
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-300">
            <Link href="/" className="text-white font-medium hover:text-gray-300 transition">Home</Link>
            <Link href="/" className="hover:text-gray-300 transition">TV Shows</Link>
            <Link href="/" className="hover:text-gray-300 transition">Movies</Link>
            <Link href="/" className="hover:text-gray-300 transition">New & Popular</Link>
            <Link href="/my-list" className="hover:text-gray-300 transition">My List</Link>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-white">
          <Link href="/search" className="hover:text-gray-300 transition">
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
          <button className="hidden md:block hover:text-gray-300 transition">
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <Link href="/profile" className="flex items-center gap-2 hover:text-gray-300 transition">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Bookmark, label: 'My List', href: '/my-list' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 w-full z-50 bg-[#141414] border-t border-white/10 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-white' : 'text-gray-500'}`}>
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
