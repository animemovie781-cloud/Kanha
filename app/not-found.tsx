import Link from 'next/link';
import { Navbar, BottomNav } from '@/components/Navigation';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-4 font-sans">
      <Navbar />
      <div className="text-center">
        <h1 className="text-6xl font-black text-[#E50914] mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/"
          className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-white/80 transition-colors inline-flex items-center gap-2"
        >
          Return Home
        </Link>
      </div>
      <BottomNav />
    </main>
  );
}
