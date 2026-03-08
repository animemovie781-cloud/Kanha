import { AnimeCard } from './AnimeCard';

export const ContentRail = ({ title, items, type = 'tv' }: { title: string; items: any[]; type?: 'tv' | 'movie' }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="py-2 md:py-4">
      <div className="flex items-center justify-between mb-2 md:mb-3 px-4 md:px-12">
        <h2 className="text-base md:text-xl font-bold text-[#e5e5e5] tracking-tight">{title}</h2>
      </div>
      <div className="flex overflow-x-auto gap-2 md:gap-3 px-4 md:px-12 pb-4 md:pb-6 snap-x snap-mandatory hide-scrollbar">
        {items.map((item: any) => (
          <div key={item.id} className="snap-start shrink-0">
            <AnimeCard anime={item} type={type} />
          </div>
        ))}
      </div>
    </div>
  );
};
