'use client';

import Link from 'next/link';
import { Search, Home, Filter, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const pathname = usePathname();
  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Filter, label: 'Filter', href: '/filter' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          Cine<span className="text-[#00FF00]">Stream</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-[#00FF00]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search" className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
            <Search className="w-5 h-5 text-white" />
          </Link>
          <div className="hidden md:block w-8 h-8 rounded-full bg-gradient-to-tr from-[#00FF00] to-blue-500" />
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
    { icon: Filter, label: 'Filter', href: '/filter' },
  ];

  return (
    <div className="fixed bottom-0 w-full z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-[#00FF00]' : 'text-gray-400'}`}>
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
