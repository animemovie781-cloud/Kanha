import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';

export const AnimeCard = ({ anime, type = 'tv' }: { anime: any; type?: 'tv' | 'movie' }) => {
  return (
    <Link href={`/anime/${anime.id}?type=${type}`} className="group relative rounded-md overflow-hidden aspect-[2/3] bg-zinc-900 block flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-xl hover:shadow-black/50">
      <Image
        src={getImageUrl(anime.poster_path)}
        alt={anime.name || anime.title}
        fill
        sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 180px"
        className="object-cover"
        referrerPolicy="no-referrer"
      />
      
      {/* Hover State Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className="text-white text-xs md:text-sm font-bold line-clamp-2 leading-tight mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {anime.name || anime.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Play className="w-3 h-3 fill-black text-black ml-0.5" />
          </div>
          <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
          <span className="text-[#46d369]">{Math.round((anime.vote_average || 0) * 10)}% Match</span>
          <span className="text-gray-300 border border-gray-500 px-1 rounded-sm">{type === 'tv' ? 'TV' : 'M'}</span>
        </div>
      </div>
    </Link>
  );
};
