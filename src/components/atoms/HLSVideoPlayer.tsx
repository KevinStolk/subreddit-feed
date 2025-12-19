import React, { useEffect, useRef, memo } from "react";
import Hls from "hls.js";

export interface HLSVideoPlayerProps {
    /** Fallback video source URL (used when HLS is not supported or fails) */
    src: string;
    /** HLS playlist URL (.m3u8) for streaming with audio support */
    hlsSrc?: string | null;
    /** Video title for accessibility */
    title: string;
    /** Optional CSS class name */
    className?: string;
    /** Optional inline styles */
    style?: React.CSSProperties;
    /** Show native video controls (default: true) */
    controls?: boolean;
    /** Autoplay the video (default: false) */
    autoPlay?: boolean;
    /** Loop the video (default: false) */
    loop?: boolean;
    /** Mute the video (default: false) */
    muted?: boolean;
    /** Poster image URL */
    poster?: string;
    /** Callback when video starts playing */
    onPlay?: () => void;
    /** Callback when video is paused */
    onPause?: () => void;
    /** Callback when video ends */
    onEnded?: () => void;
    /** Callback when an error occurs */
    onError?: (error: Error) => void;
}

/**
 * HLS Video Player component for streaming videos with audio support.
 *
 * Supports HLS (HTTP Live Streaming) for browsers that don't have native support
 * using hls.js library. Falls back to regular video playback when HLS is not
 * available or fails to load.
 *
 * Primarily used for Reddit native videos (v.redd.it) which require HLS for audio.
 */
export const HLSVideoPlayer = memo(({
    src,
    hlsSrc,
    title,
    className,
    style,
    controls = true,
    autoPlay = false,
    loop = false,
    muted = false,
    poster,
    onPlay,
    onPause,
    onEnded,
    onError
}: HLSVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !hlsSrc) return;

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(hlsSrc);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    // Fall back to non-HLS source if HLS fails
                    video.src = src;
                    onError?.(new Error(`HLS Error: ${data.type} - ${data.details}`));
                }
            });
            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsSrc;
        } else {
            // Fallback to non-HLS source
            video.src = src;
        }
    }, [hlsSrc, src, onError]);

    return (
        <video
            ref={videoRef}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            poster={poster}
            style={style}
            title={title}
            className={className}
            src={!hlsSrc ? src : undefined}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
        />
    );
});

HLSVideoPlayer.displayName = "HLSVideoPlayer";
