import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';

export const Hero = ({ anime, type = 'tv' }: { anime: any; type?: 'tv' | 'movie' }) => {
  if (!anime) return null;

  return (
    <div className="relative w-full h-[65vh] md:h-[75vh] lg:h-[85vh] bg-black">
      <Image
        src={getImageUrl(anime.backdrop_path, 'original')}
        alt={anime.name || anime.title}
        fill
        className="object-cover opacity-50 md:opacity-60"
        priority
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 md:via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent hidden md:block" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 md:gap-5 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1]">
            {anime.name || anime.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm md:text-base text-gray-300 font-medium">
            <span className="text-[#00FF00] flex items-center gap-1 bg-[#00FF00]/10 px-2 py-1 rounded-md">
              ★ {anime.vote_average?.toFixed(1)}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>{new Date(anime.first_air_date || anime.release_date).getFullYear()}</span>
            <span className="hidden sm:inline">•</span>
            <span className="uppercase tracking-wider text-[10px] sm:text-xs bg-white/10 px-2 py-1 rounded-md text-white">
              {type === 'tv' ? 'Series' : 'Movie'}
            </span>
          </div>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg line-clamp-3 md:line-clamp-4 leading-relaxed max-w-2xl font-light">
            {anime.overview}
          </p>

          <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-4">
            <Link
              href={`/anime/${anime.id}?type=${type}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#00FF00] text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-[#00cc00] transition-all active:scale-95 shadow-[0_0_30px_rgba(0,255,0,0.2)] hover:shadow-[0_0_40px_rgba(0,255,0,0.4)]"
            >
              <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              <span className="text-sm md:text-base">Play Now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
