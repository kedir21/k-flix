
import React, { useState, useEffect, useRef } from 'react';
import { Episode, VideoSource } from '../types';
import { extractorService } from '../services/extractorService';

declare const Hls: any;

interface PlayerProps {
  initialSource: VideoSource;
  allSources?: VideoSource[];
  title: string;
  onClose: () => void;
  id: number;
  type: 'movie' | 'tv';
  episodes?: Episode[];
  currentEpisode?: number;
  onEpisodeChange?: (ep: number) => void;
}

const Player: React.FC<PlayerProps> = ({
  initialSource,
  allSources = [],
  title,
  onClose,
  id,
  type,
  episodes,
  currentEpisode,
  onEpisodeChange
}) => {
  const [activeSource, setActiveSource] = useState<VideoSource | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [showAdStatus, setShowAdStatus] = useState(false);
  const [showGhostShield, setShowGhostShield] = useState(false);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUserInteraction = () => {
    // Controls are permanent, no hide timer needed
  };

  const initNativePlayer = (url: string) => {
    if (!videoRef.current) return;
    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferSize: 60 * 1024 * 1024, // 60MB
        maxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => setIsPlaying(false));
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari/iOS)
      videoRef.current.src = url;
      videoRef.current.load();
      videoRef.current.play().catch(() => setIsPlaying(false));
    } else {
      videoRef.current.src = url;
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const prepareStream = async (source: VideoSource) => {
    setIsResolving(true);
    const resolved = await extractorService.resolveToNative(source);
    setActiveSource(resolved);
    setIsResolving(false);
    if (resolved.type === 'm3u8' || resolved.type === 'mp4') {
      setTimeout(() => initNativePlayer(resolved.url), 100);
    }

    setShowAdStatus(true);
    setTimeout(() => setShowAdStatus(false), 3000);

    // Enable ghost shield for VidSrc.CC to catch popups while sandbox is off
    if (source.provider === 'VidSrc.CC') {
      setShowGhostShield(true);
    } else {
      setShowGhostShield(false);
    }

    // Fallback: If still resolving after 10s, force stop resolving
    setTimeout(() => setIsResolving(false), 10000);
  };

  useEffect(() => {
    prepareStream(initialSource);

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight') skip(10);
      if (e.code === 'ArrowLeft') skip(-10);
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data && data.type === 'PLAYER_EVENT') {
            console.log("VidKing Player Event:", data.data);
            // Here we could update state or local storage with progress
            if (data.data.event === 'timeupdate') {
              setCurrentTime(data.data.currentTime);
              setDuration(data.data.duration);
            }
            if (data.data.event === 'ended' || data.data.event === 'finish') {
              handleEnded();
            }
          }
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('message', handleMessage);
    };
  }, [initialSource]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const changeVolume = (delta: number) => {
    const change = delta * 0.1;
    const newVol = Math.max(0, Math.min(1, volume + change));
    setVolume(newVol);
    if (videoRef.current) videoRef.current.volume = newVol;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) videoRef.current.muted = !isMuted;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleEnded = () => {
    if (type === 'tv' && currentEpisode !== undefined && episodes && currentEpisode < episodes.length) {
      onEpisodeChange?.(currentEpisode + 1);
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const isNative = activeSource?.type === 'm3u8' || activeSource?.type === 'mp4';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden"
      onClick={() => {
        if (isNative) togglePlay();
      }}
    >
      {/* Media Layer */}
      <div className="w-full h-full relative z-[10]">
        {!isResolving && activeSource && (
          isNative ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleEnded}
              autoPlay
              playsInline
              controls={false}
            />
          ) : (
            <div className="w-full h-full relative">
              <iframe
                src={activeSource.url}
                className="w-full h-full border-0 bg-black"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                allowFullScreen
                referrerPolicy="origin"
                sandbox={activeSource.provider === 'VidSrc.CC' ? undefined : "allow-forms allow-pointer-lock allow-same-origin allow-scripts"}
              />

              {/* Automated Stealth Status */}
              {showAdStatus && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[200] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-1000">
                  <div className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                      {activeSource.provider === 'VidSrc.CC' ? 'Ghost Shield Active' : 'Ad-Shield Active'}
                    </span>
                  </div>
                </div>
              )}

              {/* Ghost Shield: Invisible layer for VidSrc.CC to absorb first click popups */}
              {showGhostShield && (
                <div
                  className="absolute inset-0 z-[150] cursor-pointer bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGhostShield(false);
                  }}
                />
              )}
            </div>
          )
        )}
      </div>

      {/* Loading State Overlay */}
      {isResolving && (
        <div className="absolute inset-0 z-[1100] bg-black flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin mb-6" />
          <p className="text-white font-black uppercase tracking-[0.4em] text-xs animate-pulse">Connecting to Mirror...</p>
        </div>
      )}

      {/* Minimalist Controls Overlay - Permanent Back Button Only */}
      <div className="absolute inset-0 z-[50] flex flex-col justify-between p-6 sm:p-10 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-none">
          <div className="flex gap-6 items-center pointer-events-auto">
            <button onClick={onClose} className="p-4 bg-black/40 hover:bg-white text-white hover:text-black rounded-2xl backdrop-blur-md transition-all border border-white/10 outline-none focus:ring shadow-2xl group">
              <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                className="p-4 bg-black/40 hover:bg-white text-white hover:text-black rounded-2xl backdrop-blur-md transition-all border border-white/10 outline-none focus:ring shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                Mirror
              </button>

              {isSourceDropdownOpen && (
                <div className="absolute left-0 top-full mt-4 w-56 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100] pointer-events-auto">
                  {allSources.map((source, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        prepareStream(source);
                        setIsSourceDropdownOpen(false);
                      }}
                      className={`w-full text-left px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-colors hover:bg-blue-600/20 flex items-center justify-between ${activeSource?.provider === source.provider ? 'text-blue-500' : 'text-gray-400'}`}
                    >
                      <span>{source.provider}</span>
                      {activeSource?.provider === source.provider && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
