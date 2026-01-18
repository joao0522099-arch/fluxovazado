
import React, { useRef, useState, useEffect } from 'react';
import { Post } from '../../../types';

interface ReelPlayerProps {
    reel: Post;
    isActive: boolean;
    reportWatchTime: (id: string) => void;
    onVideoClick: () => void;
    isMuted: boolean;
    onToggleMute: (e: React.MouseEvent) => void;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({ 
    reel, isActive, reportWatchTime, onVideoClick, isMuted, onToggleMute 
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [hasError, setHasError] = useState(false);

    const getVideoSrc = (src?: string) => {
        if (!src) return '';
        if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src;
        return `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
    };

    const videoSrc = getVideoSrc(reel.video);

    useEffect(() => {
        let isMounted = true;
        if (isActive) {
            if (videoRef.current && !hasError && videoSrc) {
                const playPromise = videoRef.current.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            if (isMounted) {
                                setIsPlaying(true);
                                reportWatchTime(reel.id);
                            }
                        })
                        .catch((error) => {
                            if (!isMounted) return;
                            if (error.name === 'NotAllowedError') {
                                setIsPlaying(false);
                                if (videoRef.current) {
                                    videoRef.current.muted = true;
                                    videoRef.current.play().catch(e => {});
                                }
                            } else if (error.name !== 'AbortError') {
                                setIsPlaying(false);
                            }
                        });
                }
            }
        } else {
            if (videoRef.current) {
                videoRef.current.pause();
                if (isMounted) setIsPlaying(false);
                if (!videoRef.current.paused && !Number.isNaN(videoRef.current.duration)) {
                    videoRef.current.currentTime = 0; 
                }
            }
        }
        return () => { isMounted = false; };
    }, [isActive, hasError, videoSrc, reel.id, reportWatchTime]);

    return (
        <div className="reel-video-container w-full h-full relative" onClick={onVideoClick}>
            {isActive && isBuffering && !hasError && videoSrc && (
                <div className="absolute z-10 flex items-center justify-center pointer-events-none" style={{top:'50%', left:'50%', transform:'translate(-50%, -50%)'}}>
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-white/80"></i>
                </div>
            )}

            {!isPlaying && !isBuffering && !hasError && videoSrc && (
                <div className="absolute z-10 pointer-events-none bg-black/30 rounded-full p-4 backdrop-blur-sm" style={{top:'50%', left:'50%', transform:'translate(-50%, -50%)'}}>
                    <i className="fa-solid fa-play text-4xl text-white/90 pl-1"></i>
                </div>
            )}

            {videoSrc && !hasError ? (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    loop
                    muted={isMuted}
                    playsInline
                    webkit-playsinline="true"
                    preload="auto"
                    className="reel-video"
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => setIsBuffering(false)}
                    onLoadedData={() => setIsBuffering(false)}
                    onError={() => {
                        if (videoSrc) {
                            setHasError(true);
                            setIsBuffering(false);
                        }
                    }}
                />
            ) : reel.image ? (
                <img src={reel.image} alt="Reel Content" className="reel-video object-cover" />
            ) : (
                <div className="video-error">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <p>Conteúdo indisponível</p>
                    <button onClick={(e) => { e.stopPropagation(); setHasError(false); setIsBuffering(true); }} className="retry-btn">
                        <i className="fa-solid fa-rotate-right"></i> Recarregar
                    </button>
                </div>
            )}
        </div>
    );
};
