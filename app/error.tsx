'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Navbar, BottomNav } from '@/components/Navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-4 font-sans">
      <Navbar />
      <div className="text-center">
        <h1 className="text-4xl font-black text-red-500 mb-4">Something went wrong!</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="bg-white/10 text-white px-8 py-3 rounded font-bold hover:bg-white/20 transition-colors"
          >
            Try again
          </button>
          <Link 
            href="/"
            className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-white/80 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
