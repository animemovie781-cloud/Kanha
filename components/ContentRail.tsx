import { AnimeCard } from './AnimeCard';

export const ContentRail = ({ title, items, type = 'tv' }: { title: string; items: any[]; type?: 'tv' | 'movie' }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="py-3 md:py-6">
      <div className="flex items-center justify-between mb-3 md:mb-5 px-4 sm:px-8 lg:px-12">
        <h2 className="text-lg md:text-2xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      <div className="flex overflow-x-auto gap-3 md:gap-5 px-4 sm:px-8 lg:px-12 pb-4 md:pb-6 snap-x snap-mandatory hide-scrollbar">
        {items.map((item: any) => (
          <div key={item.id} className="snap-start shrink-0">
            <AnimeCard anime={item} type={type} />
          </div>
        ))}
      </div>
    </div>
  );
};
