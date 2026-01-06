import React, { useState, useEffect, useRef } from 'react';
import { Episode, VideoSource } from '../types';

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
  // id, type, episodes, currentEpisode, onEpisodeChange are not used in this refactor
}) => {
  const [activeSource, setActiveSource] = useState<VideoSource>(initialSource);
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Stealth Shield: Invisible Event Capture
  // Instead of a visible shield, we use a transparent layer that swallows the *first* interact event
  // but passes subsequent ones or specific control-intended ones.
  const [stealthShieldActive, setStealthShieldActive] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<number | null>(null);

  // Provider‑specific base shield duration
  const getShieldDuration = (provider: string): number => {
    switch (provider) {
      case 'VidSrc.CC': return 3000; // 3 s
      case 'VidKing': return 2000; // 2 s
      case 'Rive': return 3000; // 3 s (same as VidSrc.CC)
      default: return 2000;
    }
  };

  // Detect Edge browser
  const isEdge = typeof navigator !== 'undefined' && /Edg/.test(navigator.userAgent);

  // Edge‑aware stealth duration (adds extra buffer for Edge)
  const getStealthDuration = (provider: string): number => {
    const base = getShieldDuration(provider);
    return isEdge ? base + 2000 : base; // extra 2 s on Edge
  };

  // Auto-hide controls
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => {
      if (!isSourceMenuOpen) setShowControls(false);
    }, 3000);
  };

  // Aggressive Popup Blocker
  useEffect(() => {
    // 1. Monkey-patch window.open to kill popups
    const originalOpen = window.open;
    window.open = function (url, target, features) {
      console.log('🚫 Popup blocked:', url);
      return null;
    };

    return () => { window.open = originalOpen; };
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    resetControlsTimer();
    // If shield is active, the first click is "sacrificed" to clear potential overlays from the provider
    // We prevent default behavior ONLY if it looks like a malicious popup redirect
    // BUT we need to let the USER interact with our controls.
    // Since our controls are z-index > iframe, clicks on OUR controls (back, fullscreen) work fine.
    // Clicks on the IFRAME might trigger popups.

    if (stealthShieldActive) {
      // We accept the click to "wake" the iframe but try to stop propagation of popup events
      // For many providers, the first click IS the ad trigger.
      // We'll let it hit a transparent "catch" div for 500ms then remove it to allow play.

      // Actually, with stealth mode, we just want it GONE.
      // We will auto-disable the shield after 500ms of load.
    }
  };

  // When source changes, start stealth shield with appropriate duration
  useEffect(() => {
    if (!activeSource) return;
    // Reset shield
    setStealthShieldActive(true);
    const duration = getStealthDuration(activeSource.provider);
    const timer = setTimeout(() => setStealthShieldActive(false), duration);
    return () => clearTimeout(timer);
  }, [activeSource]);

  // Change source
  const changeSource = (source: VideoSource) => {
    setActiveSource(source);
    setStealthShieldActive(true); // Re-activate stealth shield on source change
    setIsSourceMenuOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1000] bg-black flex items-center justify-center font-sans"
      onMouseMove={handleInteraction}
      onTouchStart={resetControlsTimer}
    >
      {/* 
        STEALTH LAYER:
        Absorbs clicks meant for popup triggers in the first 800ms.
        Invisible to user. 
      */}
      {stealthShieldActive && (
        <div
          className="absolute inset-0 z-[50]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setStealthShieldActive(false);
            console.log("🛡️ Stealth shield caught early click");
          }}
        />
      )}

      <iframe
        src={activeSource.url}
        className="w-full h-full border-0"
        allow="autoplay *; fullscreen; encrypted-media; picture-in-picture; sound *"
        allowFullScreen
        title={title}
      // NO SANDBOX for max compatibility, relying on window.open patch
      />

      {/* Elegant Controls Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 flex flex-col justify-between p-6 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 20%, transparent 80%, rgba(0,0,0,0.8))' }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <button onClick={onClose} className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all backdrop-blur-md">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>

          <h1 className="text-white font-medium text-lg tracking-wide drop-shadow-md hidden sm:block">{title}</h1>

          <div className="relative">
            <button onClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)} className="p-2 flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg backdrop-blur-md transition-all border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider">{activeSource.provider}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isSourceMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                {allSources.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { changeSource(s); }}
                    className={`w-full text-left px-4 py-3 text-xs font-medium transition-colors ${activeSource.provider === s.provider ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    {s.provider}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-end pointer-events-auto">
          <button onClick={toggleFullscreen} className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all backdrop-blur-md">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Player;
