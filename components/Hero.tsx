import Image from 'next/image';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';

export const Hero = ({ anime, type = 'tv' }: { anime: any; type?: 'tv' | 'movie' }) => {
  if (!anime) return null;

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] bg-[#141414]">
      <Image
        src={getImageUrl(anime.backdrop_path, 'original')}
        alt={anime.name || anime.title}
        fill
        className="object-cover"
        priority
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/50 to-transparent hidden md:block" />
      
      <div className="absolute bottom-[10%] left-0 right-0 px-4 md:px-12 max-w-7xl w-full">
        <div className="flex flex-col gap-4 md:gap-6 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1] drop-shadow-lg">
            {anime.name || anime.title}
          </h1>
          
          <div className="flex items-center gap-3 text-sm md:text-base font-medium drop-shadow-md">
            <span className="text-[#46d369]">
              {Math.round((anime.vote_average || 0) * 10)}% Match
            </span>
            <span className="text-gray-300">{new Date(anime.first_air_date || anime.release_date).getFullYear()}</span>
            <span className="border border-gray-400 text-gray-300 px-1.5 py-0.5 text-xs rounded-sm">
              {type === 'tv' ? 'TV' : 'MOVIE'}
            </span>
          </div>

          <p className="text-white text-sm sm:text-base md:text-lg line-clamp-3 md:line-clamp-4 leading-snug drop-shadow-md font-medium max-w-xl">
            {anime.overview}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <Link
              href={`/anime/${anime.id}?type=${type}`}
              className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded md:rounded-md font-bold hover:bg-white/80 transition-colors"
            >
              <Play className="w-6 h-6 md:w-7 md:h-7 fill-current" />
              <span className="text-base md:text-xl">Play</span>
            </Link>
            <Link
              href={`/anime/${anime.id}?type=${type}`}
              className="flex items-center justify-center gap-2 bg-gray-500/70 text-white px-6 md:px-8 py-2 md:py-3 rounded md:rounded-md font-bold hover:bg-gray-500/50 transition-colors"
            >
              <Info className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-base md:text-xl">More Info</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
