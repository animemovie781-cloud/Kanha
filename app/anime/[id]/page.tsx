'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Navbar, BottomNav } from '@/components/Navigation';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ContentRail } from '@/components/ContentRail';
import { getAnimeDetails, getAnimeSeason, getImageUrl } from '@/lib/tmdb';
import { getEpisodeServers } from '@/lib/firebase';
import { useWatchStore } from '@/lib/store';
import { Play, Plus, Check, ChevronDown, AlertTriangle, ThumbsUp, ThumbsDown, Share2, Download, Bookmark } from 'lucide-react';

function AnimeDetailsContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'tv' | 'movie' || 'tv';

  const [anime, setAnime] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [servers, setServers] = useState<any>(null);
  const [activeServer, setActiveServer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDataWarning, setShowDataWarning] = useState(true);
  const [inListLocal, setInListLocal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { addToHistory, getHistoryItem, addToMyList, removeFromMyList, isInMyList } = useWatchStore();

  const inList = isMounted ? isInMyList(id as string) : inListLocal;

  const toggleList = () => {
    if (inList) {
      removeFromMyList(id as string);
      setInListLocal(false);
    } else {
      addToMyList({
        id: id as string,
        type,
        title: anime?.name || anime?.title || '',
        posterPath: anime?.poster_path || null,
        timestamp: Date.now(),
        voteAverage: anime?.vote_average,
        releaseDate: anime?.first_air_date || anime?.release_date
      });
      setInListLocal(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getAnimeDetails(id as string, type);
        setAnime(data);
        
        if (type === 'tv' && data.seasons) {
          const validSeasons = data.seasons.filter((s: any) => s.season_number > 0);
          setSeasons(validSeasons);
          
          const history = getHistoryItem(id as string);
          const initialSeason = history ? history.season : (validSeasons[0]?.season_number || 1);
          const initialEpisode = history ? history.episode : 1;
          
          setSelectedSeason(initialSeason);
          setSelectedEpisode(initialEpisode);
          
          const seasonData = await getAnimeSeason(id as string, initialSeason);
          setEpisodes(seasonData.episodes || []);
        } else if (type === 'movie') {
          // For movies, we just need to fetch servers for season 1, episode 1
          setSelectedSeason(1);
          setSelectedEpisode(1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id, type, getHistoryItem]);

  useEffect(() => {
    const fetchServers = async () => {
      if (!id) return;
      const serverData = await getEpisodeServers(id as string, selectedSeason, selectedEpisode);
      setServers(serverData);
      if (serverData) {
        const firstServerKey = Object.keys(serverData)[0];
        setActiveServer(firstServerKey);
      } else {
        setActiveServer(null);
      }
    };

    fetchServers();
  }, [id, selectedSeason, selectedEpisode]);

  const handleSeasonChange = async (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1);
    const seasonData = await getAnimeSeason(id as string, seasonNum);
    setEpisodes(seasonData.episodes || []);
  };

  const handleEpisodeChange = (epNum: number) => {
    setSelectedEpisode(epNum);
    if (anime) {
      addToHistory({
        id: anime.id.toString(),
        type,
        title: anime.name || anime.title,
        posterPath: anime.poster_path,
        backdropPath: anime.backdrop_path,
        season: selectedSeason,
        episode: epNum,
        timestamp: Date.now(),
        progress: 0,
        duration: 0
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!anime) return null;

  const currentServer = activeServer && servers ? servers[activeServer] : null;
  const videoSrc = currentServer ? (typeof currentServer === 'string' ? currentServer : currentServer.url) : '';
  const isEmbed = currentServer && typeof currentServer !== 'string' && currentServer.isEmbed;

  const hasNextEpisode = type === 'tv' && episodes.some(ep => ep.episode_number === selectedEpisode + 1);
  const hasPrevEpisode = type === 'tv' && episodes.some(ep => ep.episode_number === selectedEpisode - 1);

  const handleNextEpisode = () => {
    if (hasNextEpisode) {
      handleEpisodeChange(selectedEpisode + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (hasPrevEpisode) {
      handleEpisodeChange(selectedEpisode - 1);
    }
  };

  return (
    <main className="min-h-screen bg-[#141414] text-white pb-20 md:pb-0 font-sans pt-16">
      <Navbar />
      
      {/* Sticky Player Section */}
      <div className="sticky top-16 z-40 bg-[#141414] w-full shadow-2xl shadow-black/50">
        {showDataWarning ? (
          <div className="w-full aspect-video bg-zinc-900 flex flex-col items-center justify-center p-4 md:p-6 text-center max-w-5xl mx-auto md:rounded-2xl overflow-hidden md:mt-4">
            <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-bold mb-2">Data Usage Warning</h3>
            <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6 max-w-md">
              Streaming video consumes a significant amount of data. We recommend using Wi-Fi.
            </p>
            <button 
              onClick={() => setShowDataWarning(false)}
              className="bg-[#E50914] text-white px-6 md:px-8 py-2.5 md:py-3 rounded font-bold hover:bg-[#b20710] transition-colors text-sm md:text-base"
            >
              Continue to Player
            </button>
          </div>
        ) : (
          <div className="w-full mx-auto">
            <div className="md:rounded-none overflow-hidden shadow-2xl bg-black">
              {videoSrc ? (
                <VideoPlayer 
                  src={videoSrc} 
                  isEmbed={isEmbed} 
                  poster={getImageUrl(anime.backdrop_path, 'original')}
                  autoPlay={true}
                  hasNextEpisode={type === 'tv' ? hasNextEpisode : undefined}
                  hasPrevEpisode={type === 'tv' ? hasPrevEpisode : undefined}
                  onNextEpisode={handleNextEpisode}
                  onPrevEpisode={handlePrevEpisode}
                  onProgress={(p) => {
                    if (p > 5) { // Update history after 5% progress
                      addToHistory({
                        id: anime.id.toString(),
                        type,
                        title: anime.name || anime.title,
                        posterPath: anime.poster_path,
                        backdropPath: anime.backdrop_path,
                        season: selectedSeason,
                        episode: selectedEpisode,
                        timestamp: Date.now(),
                        progress: p,
                        duration: 0
                      });
                    }
                  }}
                />
              ) : (
                <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center">
                  <p className="text-gray-500 text-sm md:text-base">No servers available for this episode.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 md:py-6">
        {/* Title and Actions Section (YouTube Style) */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-2">
            {anime.name || anime.title}
          </h1>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-4">
            <span>{anime.vote_average?.toFixed(1)} ★</span>
            <span>•</span>
            <span>{new Date(anime.first_air_date || anime.release_date).getFullYear()}</span>
            <span>•</span>
            <span>{type === 'tv' ? 'Series' : 'Movie'}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
            <div className="flex items-center bg-white/10 rounded-full">
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-l-full transition">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm font-medium">Like</span>
              </button>
              <div className="w-[1px] h-6 bg-white/20" />
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-r-full transition">
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>
            
            <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition whitespace-nowrap">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
            
            <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition whitespace-nowrap">
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Download</span>
            </button>

            <button 
              onClick={toggleList}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition whitespace-nowrap ${
                inList ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span className="text-sm font-medium">{inList ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Server Selector */}
        {servers && Object.keys(servers).length > 1 && (
          <div className="mb-6 bg-white/5 rounded-xl p-3 flex items-center gap-3 overflow-x-auto hide-scrollbar">
            <span className="text-xs text-gray-400 whitespace-nowrap font-medium">Servers:</span>
            {Object.keys(servers).map(key => (
              <button
                key={key}
                onClick={() => setActiveServer(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeServer === key 
                    ? 'bg-white text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Description Section */}
        <div className="bg-white/5 rounded-xl p-4 mb-8">
          <p className="text-sm md:text-base text-gray-200 leading-relaxed font-light">
            {anime.overview}
          </p>
        </div>

        {/* Episodes Vertical List (YouTube Related Videos Style) */}
        {type === 'tv' && seasons.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Episodes</h2>
              
              <div className="relative group">
                <button className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition text-sm font-medium">
                  <span>Season {selectedSeason}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="max-h-64 overflow-y-auto hide-scrollbar">
                    {seasons.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSeasonChange(s.season_number)}
                        className={`w-full text-left px-4 py-3 hover:bg-white/10 transition text-sm font-medium ${
                          selectedSeason === s.season_number ? 'text-white bg-white/20' : 'text-gray-300'
                        }`}
                      >
                        Season {s.season_number}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => handleEpisodeChange(ep.episode_number)}
                  className={`flex gap-3 text-left group transition-all p-2 rounded-xl ${
                    selectedEpisode === ep.episode_number 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="relative w-32 md:w-40 aspect-video bg-black rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={getImageUrl(ep.still_path, 'original')}
                      alt={ep.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                      E{ep.episode_number}
                    </div>
                    {selectedEpisode === ep.episode_number && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col py-1">
                    <h4 className={`font-medium text-sm md:text-base line-clamp-2 mb-1 ${selectedEpisode === ep.episode_number ? 'text-white' : 'text-gray-200'}`}>
                      {ep.episode_number}. {ep.name}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {ep.overview || 'No description available.'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {anime.recommendations?.results?.length > 0 && (
          <div className="-mx-4 sm:mx-0">
            <ContentRail 
              title="More Like This" 
              items={anime.recommendations.results} 
              type={type}
            />
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function AnimeDetailsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <AnimeDetailsContent />
    </Suspense>
  );
}
