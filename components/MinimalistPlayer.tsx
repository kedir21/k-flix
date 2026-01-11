import React, { useState, useEffect, useRef } from 'react';
import { VideoSource, Episode } from '../types';
import './MinimalistPlayer.css';

interface MinimalistPlayerProps {
    src: string;
    title?: string;
    provider?: string;
    allSources?: VideoSource[];
    onSourceChange?: (source: VideoSource) => void;
    episodes?: Episode[];
    currentEpisode?: number;
    onEpisodeChange?: (episode: number) => void;
    onClose: () => void;
    contentId?: number | string;
    season?: number;
    mediaType?: 'movie' | 'tv';
}

/**
 * MinimalistPlayer with ULTRA-AGGRESSIVE Ad-Blocking
 * Multi-layer defense system with extended shields and comprehensive protection
 */
const MinimalistPlayer: React.FC<MinimalistPlayerProps> = ({
    src,
    title = '',
    provider = '',
    allSources = [],
    onSourceChange,
    episodes = [],
    currentEpisode,
    onEpisodeChange,
    onClose,
    contentId,
    season,
    mediaType
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const controlsTimerRef = useRef<number | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [primaryShield, setPrimaryShield] = useState(true);
    const [secondaryShield, setSecondaryShield] = useState(true);
    const [isManuallyInitialized, setIsManuallyInitialized] = useState(false);
    const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [blockedAdsCount, setBlockedAdsCount] = useState(0);
    const [countdown, setCountdown] = useState(15);

    const contentUid = mediaType === 'tv'
        ? `${contentId}-s${season}e${currentEpisode}`
        : `${contentId}`;

    // ULTRA-AGGRESSIVE SHIELD TIMINGS
    const PRIMARY_SHIELD_DURATION = 15000; // 15 seconds
    const SECONDARY_SHIELD_DURATION = 8000; // 8 seconds after primary

    // Shield management with countdown
    useEffect(() => {
        setPrimaryShield(true);
        setSecondaryShield(true);
        setIsManuallyInitialized(false);
        setCountdown(15);

        const countdownInterval = setInterval(() => {
            setCountdown(prev => Math.max(0, prev - 1));
        }, 1000);

        const primaryTimer = setTimeout(() => {
            setPrimaryShield(false);
        }, PRIMARY_SHIELD_DURATION);

        const secondaryTimer = setTimeout(() => {
            setSecondaryShield(false);
        }, PRIMARY_SHIELD_DURATION + SECONDARY_SHIELD_DURATION);

        return () => {
            clearTimeout(primaryTimer);
            clearTimeout(secondaryTimer);
            clearInterval(countdownInterval);
        };
    }, [src, currentEpisode]);

    // Auto-hide controls
    const resetControlsTimer = () => {
        setShowControls(true);
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = window.setTimeout(() => {
            setShowControls(false);
        }, 4000);
    };

    // NUCLEAR-LEVEL Ad-Blocking
    useEffect(() => {
        const originalOpen = window.open;
        const originalConfirm = window.confirm;
        const originalAlert = window.alert;
        const originalPrompt = window.prompt;

        // Block ALL popup attempts
        (window as any).open = function () {
            setBlockedAdsCount(prev => prev + 1);
            console.log('🛡️🛡️🛡️ BLOCKED: window.open attempt');
            return null;
        };

        // Block fake dialogs
        (window as any).confirm = function (msg?: string) {
            if (msg && (msg.toLowerCase().includes('leave') || msg.toLowerCase().includes('chrome') ||
                msg.toLowerCase().includes('update') || msg.toLowerCase().includes('install') ||
                msg.toLowerCase().includes('virus') || msg.toLowerCase().includes('warning'))) {
                setBlockedAdsCount(prev => prev + 1);
                console.log('🛡️ BLOCKED: Fake confirm dialog');
                return false;
            }
            return originalConfirm.call(window, msg);
        };

        (window as any).alert = function (msg?: string) {
            if (msg && (msg.toLowerCase().includes('ad') || msg.toLowerCase().includes('block') ||
                msg.toLowerCase().includes('vpn') || msg.toLowerCase().includes('disable'))) {
                setBlockedAdsCount(prev => prev + 1);
                console.log('🛡️ BLOCKED: Ad-related alert');
                return;
            }
            originalAlert.call(window, msg);
        };

        (window as any).prompt = function () {
            setBlockedAdsCount(prev => prev + 1);
            console.log('🛡️ BLOCKED: Prompt attempt');
            return null;
        };

        // Block navigation attempts
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        // Aggressive click/touch blocking on document
        const blockAllInteractions = (e: Event) => {
            if (primaryShield || secondaryShield) {
                const target = e.target as HTMLElement;
                // Allow clicks only on our controls
                if (!target.closest('.minimalist-overlay') && !target.closest('.premium-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    setBlockedAdsCount(prev => prev + 1);
                    console.log('🛡️ BLOCKED: Suspicious interaction during shield period');
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', blockAllInteractions, true);
        document.addEventListener('mousedown', blockAllInteractions, true);
        document.addEventListener('touchstart', blockAllInteractions, true);

        return () => {
            (window as any).open = originalOpen;
            (window as any).confirm = originalConfirm;
            (window as any).alert = originalAlert;
            (window as any).prompt = originalPrompt;
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', blockAllInteractions, true);
            document.removeEventListener('mousedown', blockAllInteractions, true);
            document.removeEventListener('touchstart', blockAllInteractions, true);
        };
    }, [primaryShield, secondaryShield]);

    const blockEvent = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setBlockedAdsCount(prev => prev + 1);
    };

    const handleCopyUrl = async () => {
        try {
            let downloadUrl = src;

            if (src.includes('vidsrc.cc/v3/embed')) {
                const parts = src.split('/');
                const type = parts[parts.length - 4];
                const id = parts[parts.length - 3];
                const s = parts[parts.length - 2];
                const e = parts[parts.length - 1];

                if (type === 'tv') {
                    downloadUrl = `https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
                } else {
                    downloadUrl = `https://vidsrc.to/embed/movie/${id}`;
                }
                console.log("🔄 URL transformed for Stacher compatibility");
            }

            await navigator.clipboard.writeText(downloadUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleManualInit = () => {
        setIsManuallyInitialized(true);
        setPrimaryShield(false);
        console.log("✅ Manual initialization - shields lowered by user");
    };

    return (
        <div
            ref={containerRef}
            className={`minimalist-player-container ${showControls ? 'controls-showing' : ''}`}
            onMouseMove={resetControlsTimer}
            onTouchStart={resetControlsTimer}
        >
            {/* PRIMARY SHIELD - Longest duration, most aggressive */}
            {primaryShield && (
                <div
                    className="minimalist-shield"
                    style={{
                        zIndex: 150,
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2rem'
                    }}
                    onMouseDown={blockEvent}
                    onMouseUp={blockEvent}
                    onClick={blockEvent}
                    onTouchStart={blockEvent}
                    onTouchEnd={blockEvent}
                    onContextMenu={blockEvent}
                >
                    <div className="flex flex-col items-center gap-6">
                        <div className="loader-ring" />
                        <div className="text-center">
                            <h2 className="text-2xl font-black uppercase tracking-wider mb-2">
                                🛡️ Ad-Shield Active
                            </h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                                Initializing secure stream... {countdown}s
                            </p>
                            <button
                                onClick={handleManualInit}
                                className="mt-6 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 shadow-xl"
                            >
                                Skip Protection (Click to Start)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SECONDARY SHIELD - Transparent, still blocks clicks */}
            {!primaryShield && secondaryShield && (
                <div
                    className="minimalist-shield"
                    style={{ zIndex: 100, background: 'transparent' }}
                    onMouseDown={blockEvent}
                    onMouseUp={blockEvent}
                    onClick={blockEvent}
                    onTouchStart={blockEvent}
                    onContextMenu={blockEvent}
                />
            )}

            <iframe
                ref={iframeRef}
                src={src}
                title={title}
                className="minimalist-iframe"
                allow="autoplay *; fullscreen; encrypted-media; picture-in-picture; sound *"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-forms"
            />

            {/* UI Overlay */}
            <div className={`minimalist-overlay ${showControls ? 'visible' : 'hidden'}`}>
                <div className="minimalist-header px-6 md:px-12 pt-8 md:pt-12 flex items-center justify-between">
                    <div className="flex items-center gap-6 md:gap-8">
                        <button onClick={onClose} className="premium-btn group" aria-label="Back">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="flex flex-col">
                            {provider && <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">{provider} Server</span>}
                            <h1 className="text-xl sm:text-3xl font-black tracking-tighter uppercase italic line-clamp-1">{title}</h1>
                            {contentUid && (
                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1">REF: {contentUid}</span>
                            )}
                            {blockedAdsCount > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-green-500">
                                        🛡️ {blockedAdsCount} Threats Blocked
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end mr-2 opacity-40 hover:opacity-100 transition-opacity">
                            <span className="text-[7px] font-black uppercase tracking-[0.3em] mb-1">Downloader Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${src.includes('vidsrc.cc') ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
                                <span className="text-[8px] font-mono truncate max-w-[120px]">{src.split('//')[1]?.split('?')[0]}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCopyUrl}
                            className={`premium-btn flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${copySuccess ? 'bg-green-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                                {copySuccess ? 'Copied!' : 'Copy for Stacher'}
                            </span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}
                                className="premium-btn flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Switch Server</span>
                            </button>

                            {isServerMenuOpen && (
                                <div className="absolute right-0 top-full mt-4 w-64 bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl p-3 z-[200]">
                                    <div className="px-4 py-2 mb-2 border-b border-white/5">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Available Sources</span>
                                    </div>
                                    <div className="space-y-1">
                                        {allSources.map((source, idx) => (
                                            <button
                                                key={`${source.provider}-${idx}`}
                                                onClick={() => {
                                                    onSourceChange?.(source);
                                                    setIsServerMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${provider === source.provider ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                                            >
                                                <span className="text-[11px] font-black uppercase tracking-wider">{source.provider}</span>
                                                {provider === source.provider && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MinimalistPlayer;
