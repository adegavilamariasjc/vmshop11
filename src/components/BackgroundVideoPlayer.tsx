
import React, { useEffect } from 'react';
import { useVideoPlayback } from '../hooks/useVideoPlayback';
import { createPreloadedVideo } from '../utils/videoPreloader';
import { selectNextVideo } from '../utils/videoTransitions';
import VideoPlayerElement from './VideoPlayerElement';

interface BackgroundVideoPlayerProps {
  videoUrls: string[];
  transitionDuration?: number;
  playDuration?: number;
}

const BackgroundVideoPlayer: React.FC<BackgroundVideoPlayerProps> = ({
  videoUrls,
  transitionDuration = 2000,
  playDuration = 30000
}) => {
  const { state, setState, refs } = useVideoPlayback(videoUrls);
  const {
    currentVideoIndex,
    nextVideoIndex,
    isTransitioning,
    videosPlayed,
    preloadedVideos,
    bufferingStatus
  } = state;

  // Cleanup function
  const cleanup = () => {
    if (refs.timerRef.current) clearTimeout(refs.timerRef.current);
    if (refs.bufferingTimeoutRef.current) clearTimeout(refs.bufferingTimeoutRef.current);
    if (refs.transitionTimeoutRef.current) clearTimeout(refs.transitionTimeoutRef.current);
  };

  // Start rotation timer
  const startRotationTimer = (customDuration?: number) => {
    cleanup();
    const baseDuration = customDuration || playDuration;
    const randomFactor = 0.75 + (Math.random() * 0.5);
    const duration = Math.round(baseDuration * randomFactor);

    refs.timerRef.current = setTimeout(() => {
      if (!refs.rotationInProgressRef.current) {
        refs.rotationInProgressRef.current = true;
        prepareNextVideoTransition();
      }
    }, duration);
  };

  const prepareNextVideoTransition = () => {
    if (isTransitioning) {
      refs.rotationInProgressRef.current = false;
      return;
    }

    const nextIdx = nextVideoIndex >= 0 ? nextVideoIndex : selectNextVideo(
      videoUrls,
      currentVideoIndex,
      nextVideoIndex,
      videosPlayed,
      (idx) => createPreloadedVideo(
        idx,
        videoUrls[idx],
        refs.preloadedVideoRefs,
        setBufferingStatus,
        setPreloadedVideos
      )
    ).nextVideoIndex;

    if (nextIdx === currentVideoIndex) {
      const newSelection = selectNextVideo(
        videoUrls,
        currentVideoIndex,
        -1,
        videosPlayed,
        (idx) => createPreloadedVideo(
          idx,
          videoUrls[idx],
          refs.preloadedVideoRefs,
          setBufferingStatus,
          setPreloadedVideos
        )
      );
      setState(prev => ({
        ...prev,
        nextVideoIndex: newSelection.nextVideoIndex,
        videosPlayed: newSelection.videosPlayed
      }));
      prepareVideoElement(newSelection.nextVideoIndex);
    } else {
      prepareVideoElement(nextIdx);
    }
  };

  const prepareVideoElement = (nextIdx: number) => {
    if (!refs.nextVideoRef.current) {
      refs.rotationInProgressRef.current = false;
      startRotationTimer(5000);
      return;
    }

    refs.nextVideoRef.current.src = videoUrls[nextIdx];
    refs.nextVideoRef.current.load();
    setTimeout(() => checkVideoBuffer(nextIdx), 100);
  };

  const checkVideoBuffer = (videoIdx: number) => {
    refs.waitingForBufferRef.current = true;
    let checkCount = 0;
    const maxChecks = 20;

    const checkBufferStatus = () => {
      if (!refs.nextVideoRef.current) return;

      checkCount++;
      const readyState = refs.nextVideoRef.current.readyState;

      if (readyState >= 3 || checkCount >= maxChecks) {
        refs.waitingForBufferRef.current = false;
        executeTransition(videoIdx);
        return;
      }

      refs.bufferingTimeoutRef.current = setTimeout(checkBufferStatus, 300);
    };

    checkBufferStatus();
  };

  const executeTransition = (videoIdx: number) => {
    setState(prev => ({ ...prev, isTransitioning: true }));

    refs.nextVideoRef.current?.play()
      .then(() => {
        setState(prev => ({
          ...prev,
          videosPlayed: [...prev.videosPlayed, videoIdx]
        }));

        refs.transitionTimeoutRef.current = setTimeout(() => {
          setState(prev => ({
            ...prev,
            currentVideoIndex: videoIdx,
            isTransitioning: false
          }));

          const newSelection = selectNextVideo(
            videoUrls,
            videoIdx,
            -1,
            videosPlayed,
            (idx) => createPreloadedVideo(
              idx,
              videoUrls[idx],
              refs.preloadedVideoRefs,
              setBufferingStatus,
              setPreloadedVideos
            )
          );

          setState(prev => ({
            ...prev,
            nextVideoIndex: newSelection.nextVideoIndex,
            videosPlayed: newSelection.videosPlayed
          }));

          refs.rotationInProgressRef.current = false;
          startRotationTimer();
        }, transitionDuration);
      })
      .catch(() => {
        setState(prev => ({ ...prev, isTransitioning: false }));
        refs.rotationInProgressRef.current = false;
        startRotationTimer(5000);
      });
  };

  // Initialize component
  useEffect(() => {
    if (videoUrls.length === 0) return;

    videoUrls.forEach((url, index) => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = url;
      preloadLink.as = 'video';
      preloadLink.setAttribute('importance', index <= 1 ? 'high' : 'low');
      document.head.appendChild(preloadLink);
    });

    if (refs.currentVideoRef.current) {
      refs.currentVideoRef.current.src = videoUrls[currentVideoIndex];
      refs.currentVideoRef.current.load();
      setTimeout(() => {
        refs.currentVideoRef.current?.play()
          .catch(() => startRotationTimer(5000));
      }, 1000);
    }

    startRotationTimer();

    return cleanup;
  }, [videoUrls]);

  // Safety check effect
  useEffect(() => {
    const safetyInterval = setInterval(() => {
      if (refs.waitingForBufferRef.current) {
        refs.waitingForBufferRef.current = false;
        if (nextVideoIndex >= 0) {
          executeTransition(nextVideoIndex);
        }
        return;
      }

      if (refs.currentVideoRef.current && !isTransitioning && !refs.rotationInProgressRef.current) {
        const isVideoStuck = refs.currentVideoRef.current.paused ||
                            refs.currentVideoRef.current.currentTime <= 0 ||
                            refs.currentVideoRef.current.readyState < 3;

        if (isVideoStuck) {
          refs.rotationInProgressRef.current = true;
          prepareNextVideoTransition();
        }
      }
    }, 8000);

    return () => clearInterval(safetyInterval);
  }, [videoUrls.length]);

  if (videoUrls.length === 0) return null;

  return (
    <div className="video-container fixed top-0 left-0 w-full h-full z-0">
      <VideoPlayerElement
        videoRef={refs.currentVideoRef}
        isActive={!isTransitioning}
        onError={() => {
          refs.rotationInProgressRef.current = true;
          prepareNextVideoTransition();
        }}
        transitionDuration={transitionDuration}
      />
      <VideoPlayerElement
        videoRef={refs.nextVideoRef}
        isActive={isTransitioning}
        onError={() => {
          setState(prev => ({ ...prev, isTransitioning: false }));
          refs.rotationInProgressRef.current = false;
          startRotationTimer(5000);
        }}
        transitionDuration={transitionDuration}
      />
    </div>
  );
};

export default BackgroundVideoPlayer;
