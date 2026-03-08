'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, X, PictureInPicture, AlertTriangle, ChevronDown, Cast, MessageSquare, MoreVertical, SkipBack, SkipForward } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  isEmbed?: boolean;
  poster?: string;
  autoPlay?: boolean;
  onProgress?: (progress: number) => void;
  onDuration?: (duration: number) => void;
  hasNextEpisode?: boolean;
  hasPrevEpisode?: boolean;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

export const VideoPlayer = ({ src, isEmbed, poster, autoPlay = false, onProgress, onDuration, hasNextEpisode, hasPrevEpisode, onNextEpisode, onPrevEpisode }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('default');
  const [rotation, setRotation] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPiPSupported, setIsPiPSupported] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPiPSupported(typeof document !== 'undefined' && document.pictureInPictureEnabled);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initVideo = async () => {
      setError(null);
      if (isEmbed) return;

      const video = videoRef.current;
      if (!video) return;

      if (Hls.isSupported() && src.includes('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay prevented:", e));
          }
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Network error encountered while loading video.');
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Media error encountered while loading video.');
                break;
              default:
                setError('An unrecoverable error occurred.');
                hls.destroy();
                break;
            }
          }
        });
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        if (autoPlay) {
          video.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay prevented:", e));
        }
      } else {
        video.src = src;
        if (autoPlay) {
          video.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay prevented:", e));
        }
      }
    };
    
    let cleanup: (() => void) | void;
    initVideo().then(res => { cleanup = res; });
    return () => { if (cleanup) cleanup(); };
  }, [src, isEmbed, autoPlay]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => console.error("Play prevented:", e));
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current || 0);
      setDuration(total || 0);
      const prog = total > 0 ? (current / total) * 100 : 0;
      setProgress(prog || 0);
      onProgress?.(prog || 0);
      onDuration?.(total || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (Number(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(Number(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (videoRef.current && document.pictureInPictureEnabled) {
      await videoRef.current.requestPictureInPicture();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '4:3': return { objectFit: 'contain', aspectRatio: '4/3' };
      case '16:9': return { objectFit: 'contain', aspectRatio: '16/9' };
      case 'cover': return { objectFit: 'cover' };
      default: return { objectFit: 'contain' };
    }
  };

  if (isEmbed) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={src}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={() => {
        if (!showControls) setShowControls(true);
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full transition-transform duration-300"
        style={{ 
          ...getAspectRatioStyle() as any,
          transform: `rotate(${rotation}deg)` 
        }}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setError('Failed to load video. It might be an embed link or broken.')}
        onClick={handlePlayPause}
        playsInline
      />

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center p-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Center Play Button Overlay */}
      {!isPlaying && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-16 h-16 bg-[#E50914]/90 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-black ml-1 fill-current" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => {
          if (!showControls) setShowControls(true);
          else handlePlayPause();
        }}
      >
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent" onClick={e => e.stopPropagation()}>
          <button className="p-2 text-white hover:text-white/80 transition">
            <ChevronDown className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button className="text-white hover:text-white/80 transition">
              <Cast className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-white/80 transition">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="text-white hover:text-white/80 transition">
              <Settings className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-white/80 transition">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Controls */}
        <div className="absolute inset-0 flex items-center justify-center gap-8 md:gap-12 pointer-events-none">
          <button className="text-white hover:text-white/80 transition pointer-events-auto" onClick={e => { e.stopPropagation(); /* Skip Back Logic */ }}>
            <SkipBack className="w-8 h-8 md:w-10 md:h-10 fill-current" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} className="text-white hover:text-white/80 transition pointer-events-auto">
            {isPlaying ? <Pause className="w-12 h-12 md:w-16 md:h-16 fill-current" /> : <Play className="w-12 h-12 md:w-16 md:h-16 fill-current" />}
          </button>
          <button className="text-white hover:text-white/80 transition pointer-events-auto" onClick={e => { e.stopPropagation(); /* Skip Forward Logic */ }}>
            <SkipForward className="w-8 h-8 md:w-10 md:h-10 fill-current" />
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent" onClick={e => e.stopPropagation()}>
          
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-4 text-white">
              <span className="text-xs font-medium">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <button onClick={toggleFullscreen} className="text-white hover:text-white/80 transition p-2">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <div className="relative w-full h-1 bg-white/30 cursor-pointer group" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              if (videoRef.current) {
                videoRef.current.currentTime = pos * videoRef.current.duration;
              }
            }}>
              <div className="absolute top-0 left-0 h-full bg-red-600" style={{ width: `${progress}%` }} />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                style={{ left: `calc(${progress}% - 6px)` }} 
              />
            </div>
          </div>

          {/* Episode Navigation */}
          {(hasNextEpisode !== undefined || hasPrevEpisode !== undefined) && (
            <div className="flex items-center justify-between px-4 pb-4">
              <button 
                onClick={(e) => { e.stopPropagation(); onPrevEpisode?.(); }} 
                disabled={!hasPrevEpisode} 
                className={`flex items-center gap-2 text-xs md:text-sm font-medium transition ${hasPrevEpisode ? 'text-white hover:text-[#E50914]' : 'text-gray-500 cursor-not-allowed'}`}
              >
                <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                Previous Episode
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onNextEpisode?.(); }} 
                disabled={!hasNextEpisode} 
                className={`flex items-center gap-2 text-xs md:text-sm font-medium transition ${hasNextEpisode ? 'text-white hover:text-[#E50914]' : 'text-gray-500 cursor-not-allowed'}`}
              >
                Next Episode
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute right-4 top-16 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 w-64 z-50">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h3 className="text-white font-semibold">Video Settings</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-2">Aspect Ratio</label>
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm text-white outline-none focus:border-[#E50914]"
              >
                <option value="default">Default</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
                <option value="cover">Cover</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">Rotation</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 90, 180, 270].map(deg => (
                  <button
                    key={deg}
                    onClick={() => setRotation(deg)}
                    className={`p-1 text-xs rounded border ${rotation === deg ? 'bg-[#E50914] text-white border-[#E50914]' : 'border-white/20 text-white hover:bg-white/10'}`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
