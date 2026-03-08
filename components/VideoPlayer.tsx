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
  const [videoScale, setVideoScale] = useState(1);
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

  const getVideoStyle = () => {
    const baseStyle: any = { transform: `rotate(${rotation}deg) scale(${videoScale})` };
    switch (aspectRatio) {
      case '4:3': 
        return { ...baseStyle, objectFit: 'fill', width: 'auto', height: '100%', aspectRatio: '4/3', margin: '0 auto', display: 'block' };
      case '16:9': 
        return { ...baseStyle, objectFit: 'fill', width: '100%', height: '100%', aspectRatio: '16/9' };
      case 'cover': 
        return { ...baseStyle, objectFit: 'cover', width: '100%', height: '100%' };
      default: 
        return { ...baseStyle, objectFit: 'contain', width: '100%', height: '100%' };
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
        if (!showControls) {
          setShowControls(true);
          handleMouseMove();
        } else {
          setShowControls(false);
        }
      }}
    >
      <video
        ref={videoRef}
        className="transition-transform duration-300"
        style={getVideoStyle()}
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
      >
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent" onClick={e => e.stopPropagation()}>
          <button onClick={() => window.history.back()} className="p-2 text-white hover:text-white/80 transition bg-black/20 rounded-full backdrop-blur-sm">
            <ChevronDown className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <div className="flex items-center gap-4">
            <button className="text-white hover:text-white/80 transition">
              <Cast className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-white/80 transition">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-white/80 transition">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Controls */}
        <div className="absolute inset-0 flex items-center justify-center gap-10 md:gap-16 pointer-events-none">
          <button className="text-white hover:text-white/80 transition pointer-events-auto transform hover:scale-110" onClick={e => { e.stopPropagation(); /* Skip Back Logic */ }}>
            <SkipBack className="w-10 h-10 md:w-14 md:h-14 fill-current drop-shadow-lg" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} className="text-white hover:text-white/80 transition pointer-events-auto transform hover:scale-110">
            {isPlaying ? <Pause className="w-16 h-16 md:w-20 md:h-20 fill-current drop-shadow-lg" /> : <Play className="w-16 h-16 md:w-20 md:h-20 fill-current drop-shadow-lg" />}
          </button>
          <button className="text-white hover:text-white/80 transition pointer-events-auto transform hover:scale-110" onClick={e => { e.stopPropagation(); /* Skip Forward Logic */ }}>
            <SkipForward className="w-10 h-10 md:w-14 md:h-14 fill-current drop-shadow-lg" />
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent" onClick={e => e.stopPropagation()}>
          
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-4 text-white">
              <span className="text-xs font-medium">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <div className="flex items-center gap-2 relative">
              <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className="text-white hover:text-white/80 transition p-2">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white hover:text-white/80 transition p-2">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              {/* Settings Modal */}
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-4 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl p-4 w-64 z-50 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                    <h3 className="text-white font-semibold text-sm">Display Settings</h3>
                    <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['default', '4:3', '16:9', 'cover'].map(ratio => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`py-1.5 px-2 text-xs rounded border capitalize ${aspectRatio === ratio ? 'bg-[#E50914] text-white border-[#E50914]' : 'border-white/20 text-white hover:bg-white/10'}`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-2">Scale / Zoom</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="0.5" 
                          max="2" 
                          step="0.1" 
                          value={videoScale} 
                          onChange={(e) => setVideoScale(parseFloat(e.target.value))}
                          className="w-full accent-[#E50914]"
                        />
                        <span className="text-xs text-white w-10 text-right">{Math.round(videoScale * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <div className="relative w-full h-1.5 md:h-2 bg-white/30 cursor-pointer group rounded-full" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              if (videoRef.current) {
                videoRef.current.currentTime = pos * videoRef.current.duration;
              }
            }}>
              <div className="absolute top-0 left-0 h-full bg-[#E50914] rounded-full" style={{ width: `${progress}%` }} />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-[#E50914] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" 
                style={{ left: `calc(${progress}% - 8px)` }} 
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

    </div>
  );
};
