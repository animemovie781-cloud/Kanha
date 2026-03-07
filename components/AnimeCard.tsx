import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';

export const AnimeCard = ({ anime, type = 'tv' }: { anime: any; type?: 'tv' | 'movie' }) => {
  return (
    <Link href={`/anime/${anime.id}?type=${type}`} className="group relative rounded-xl md:rounded-2xl overflow-hidden aspect-[2/3] bg-zinc-900 block flex-shrink-0 w-[130px] sm:w-[160px] md:w-[200px] lg:w-[220px] shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#00FF00]/10">
      <Image
        src={getImageUrl(anime.poster_path)}
        alt={anime.name || anime.title}
        fill
        sizes="(max-width: 640px) 130px, (max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white text-xs md:text-sm font-bold line-clamp-2 leading-tight mb-1">
          {anime.name || anime.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-300 font-medium">
          <span className="text-[#00FF00] flex items-center">★ {anime.vote_average?.toFixed(1)}</span>
          <span className="opacity-50">•</span>
          <span>{new Date(anime.first_air_date || anime.release_date).getFullYear() || 'N/A'}</span>
        </div>
      </div>
    </Link>
  );
};
