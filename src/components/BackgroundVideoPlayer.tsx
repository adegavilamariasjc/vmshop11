
import React, { useState, useEffect, useRef } from 'react';

interface BackgroundVideoPlayerProps {
  videoUrls: string[];
  transitionDuration?: number; // in milliseconds
  playDuration?: number; // in milliseconds
}

const BackgroundVideoPlayer: React.FC<BackgroundVideoPlayerProps> = ({ 
  videoUrls,
  transitionDuration = 2000,
  playDuration = 30000 
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videosPlayed, setVideosPlayed] = useState<number[]>([0]);
  const [preloadedVideos, setPreloadedVideos] = useState<{[key: number]: boolean}>({});
  const [bufferingStatus, setBufferingStatus] = useState<{[key: number]: number}>({});
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const preloadedVideoRefs = useRef<{[key: number]: HTMLVideoElement}>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const waitingForBufferRef = useRef<boolean>(false);
  const rotationInProgressRef = useRef<boolean>(false);
  
  // Cleanup function to clear all timers
  const cleanup = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = null;
    }
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  // Create a preloaded video element for each video
  const createPreloadedVideo = (index: number) => {
    if (preloadedVideoRefs.current[index]) return;
    
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrls[index];
    video.load();
    
    // Monitor buffer progress
    const updateBufferStatus = () => {
      if (!video.buffered || video.buffered.length === 0) {
        setBufferingStatus(prev => ({...prev, [index]: 0}));
        return;
      }
      
      const bufferedEnd = video.buffered.end(0);
      const duration = video.duration || 1;
      const percent = Math.min(100, Math.round((bufferedEnd / duration) * 100));
      
      setBufferingStatus(prev => ({...prev, [index]: percent}));
      
      // When buffer is complete
      if (percent >= 90) {
        setPreloadedVideos(prev => ({...prev, [index]: true}));
        console.log(`Video ${index} preloaded: ${percent}% buffered`);
      }
    };
    
    video.addEventListener('loadedmetadata', updateBufferStatus);
    video.addEventListener('progress', updateBufferStatus);
    video.addEventListener('canplaythrough', () => {
      setPreloadedVideos(prev => ({...prev, [index]: true}));
      console.log(`Video ${index} is ready for playback`);
    });
    
    video.addEventListener('error', (e) => {
      console.error(`Error preloading video ${index}:`, e);
      // Mark as failed but still try to use it later
      setPreloadedVideos(prev => ({...prev, [index]: false}));
    });
    
    preloadedVideoRefs.current[index] = video;
  };

  // Preload all videos on initial mount
  useEffect(() => {
    if (videoUrls.length === 0) return;
    
    console.log("Initial video loading started");
    
    // Preload all videos at once but with priority system
    videoUrls.forEach((_, index) => {
      // Current and next video get loaded immediately
      if (index === currentVideoIndex) {
        if (currentVideoRef.current) {
          currentVideoRef.current.src = videoUrls[index];
          currentVideoRef.current.load();
        }
      } else {
        // Stagger the preloading of other videos to avoid network congestion
        setTimeout(() => {
          createPreloadedVideo(index);
        }, index * 1000); // Stagger by 1 second per video
      }
    });
    
    // Add preload links to head with priority hints
    videoUrls.forEach((url, index) => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = url;
      preloadLink.as = 'video';
      
      // Higher priority for next videos in sequence
      if (index === (currentVideoIndex + 1) % videoUrls.length) {
        preloadLink.setAttribute('importance', 'high');
      } else {
        preloadLink.setAttribute('importance', 'low');
      }
      
      document.head.appendChild(preloadLink);
    });
    
    // Select next video
    selectNextVideo();
    
    // Set up the first video and play
    if (currentVideoRef.current) {
      currentVideoRef.current.src = videoUrls[currentVideoIndex];
      currentVideoRef.current.load();
      
      // Wait a bit before playing to ensure initial buffering
      setTimeout(() => {
        currentVideoRef.current?.play()
          .catch(e => {
            console.error("Initial video play failed:", e);
            // Try to recover by moving to next video
            selectNextVideo();
            startRotationTimer(5000); // Short delay before trying next video
          });
      }, 1000);
    }
    
    // Start rotation timer
    startRotationTimer();
    
    return () => {
      cleanup();
      
      // Clean up preloaded videos
      Object.values(preloadedVideoRefs.current).forEach(video => {
        video.src = '';
        video.load();
      });
      preloadedVideoRefs.current = {};
    };
  }, [videoUrls]);

  // Select the next video that hasn't been played yet
  const selectNextVideo = () => {
    // If all videos have been played, reset the list except for current
    if (videosPlayed.length >= videoUrls.length) {
      console.log("All videos have been played, resetting played list to current only");
      setVideosPlayed([currentVideoIndex]);
    }
    
    // Find videos that haven't been played yet
    const availableIndexes = Array.from(
      { length: videoUrls.length }, 
      (_, i) => i
    ).filter(idx => !videosPlayed.includes(idx) && idx !== currentVideoIndex);
    
    // If nextVideoIndex is already set to a valid index different from current,
    // don't change it unless we've played all videos
    if (nextVideoIndex >= 0 && 
        nextVideoIndex !== currentVideoIndex && 
        !videosPlayed.includes(nextVideoIndex) && 
        videosPlayed.length < videoUrls.length - 1) {
      console.log(`Keeping next video as ${nextVideoIndex}`);
      return nextVideoIndex;
    }
    
    console.log("Available video indexes:", availableIndexes);
    
    // No available videos (should not happen but as a fallback)
    if (availableIndexes.length === 0) {
      // Pick any video except current one
      const randomIndex = Math.floor(Math.random() * (videoUrls.length - 1));
      const newNextIndex = randomIndex >= currentVideoIndex ? randomIndex + 1 : randomIndex;
      console.log(`No available videos, selected fallback: ${newNextIndex}`);
      setNextVideoIndex(newNextIndex);
      
      // Start preloading this video if not already
      if (!preloadedVideoRefs.current[newNextIndex]) {
        createPreloadedVideo(newNextIndex);
      }
      
      return newNextIndex;
    }
    
    // Pick a random video from available ones - true random selection
    const randomIdx = Math.floor(Math.random() * availableIndexes.length);
    const selectedNextIndex = availableIndexes[randomIdx];
    console.log(`Selected next video: ${selectedNextIndex}`);
    setNextVideoIndex(selectedNextIndex);
    
    // Start preloading this video if not already
    if (!preloadedVideoRefs.current[selectedNextIndex]) {
      createPreloadedVideo(selectedNextIndex);
    }
    
    // Return the selected index
    return selectedNextIndex;
  };
  
  // Start the rotation timer with randomized duration for more unpredictability
  const startRotationTimer = (customDuration?: number) => {
    cleanup(); // Clear any existing timers
    
    // Add some randomness to the play duration (±25% variation)
    const baseDuration = customDuration || playDuration;
    const randomFactor = 0.75 + (Math.random() * 0.5); // 0.75 to 1.25
    const duration = Math.round(baseDuration * randomFactor);
    
    console.log(`Setting rotation timer for ${duration}ms (random variation applied)`);
    
    timerRef.current = setTimeout(() => {
      console.log("Rotation timer triggered, preparing transition");
      // Use a ref to prevent multiple concurrent transitions
      if (!rotationInProgressRef.current) {
        rotationInProgressRef.current = true;
        prepareNextVideoTransition();
      } else {
        console.log("Rotation already in progress, skipping this trigger");
      }
    }, duration);
  };
  
  // Prepare the next video for transition
  const prepareNextVideoTransition = () => {
    if (isTransitioning) {
      console.log("Already in transition, skipping");
      rotationInProgressRef.current = false;
      return;
    }
    
    // If next video hasn't been selected yet, select one now
    const nextIdx = nextVideoIndex >= 0 ? nextVideoIndex : selectNextVideo();
    
    if (nextIdx === currentVideoIndex) {
      console.log("Next video same as current (should not happen), selecting another");
      const newNextIdx = selectNextVideo();
      prepareVideoElement(newNextIdx);
    } else {
      prepareVideoElement(nextIdx);
    }
  };
  
  // Prepare the next video element
  const prepareVideoElement = (nextIdx: number) => {
    if (!nextVideoRef.current) {
      console.error("Next video element not available");
      rotationInProgressRef.current = false;
      startRotationTimer(5000); // Try again shortly
      return;
    }
    
    console.log(`Preparing video ${nextIdx} for transition`);
    
    // Check if this video has been preloaded
    if (preloadedVideoRefs.current[nextIdx]) {
      // Use the preloaded video's src directly
      const preloadedVideo = preloadedVideoRefs.current[nextIdx];
      
      // If the preloaded video has enough buffer, use it
      if (preloadedVideo.readyState >= 3) {
        nextVideoRef.current.src = videoUrls[nextIdx];
        nextVideoRef.current.load();
        
        // Small delay before checking buffer to ensure loading has started
        setTimeout(() => checkVideoBuffer(nextIdx), 100);
      } else {
        console.log(`Preloaded video ${nextIdx} not ready yet, setting src and checking buffer`);
        nextVideoRef.current.src = videoUrls[nextIdx];
        nextVideoRef.current.load();
        checkVideoBuffer(nextIdx);
      }
    } else {
      console.log(`Video ${nextIdx} hasn't been preloaded, loading now`);
      nextVideoRef.current.src = videoUrls[nextIdx];
      nextVideoRef.current.load();
      
      // Start preloading for future use
      createPreloadedVideo(nextIdx);
      
      // Initialize buffer checking
      checkVideoBuffer(nextIdx);
    }
  };
  
  // Check if the video has buffered enough to start playing
  const checkVideoBuffer = (videoIdx: number) => {
    waitingForBufferRef.current = true;
    
    if (!nextVideoRef.current) {
      rotationInProgressRef.current = false;
      waitingForBufferRef.current = false;
      startRotationTimer(5000);
      return;
    }
    
    let checkCount = 0;
    const maxChecks = 20; // Maximum number of buffer checks before giving up
    
    const checkBufferStatus = () => {
      if (!nextVideoRef.current) return;
      
      checkCount++;
      const readyState = nextVideoRef.current.readyState;
      
      if (readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        console.log(`Video ${videoIdx} buffered enough (state: ${readyState}), starting transition`);
        waitingForBufferRef.current = false;
        executeTransition(videoIdx);
        return;
      }
      
      // Check buffer progress
      const buffered = nextVideoRef.current.buffered;
      let bufferInfo = "No buffer ranges";
      let bufferProgress = 0;
      
      if (buffered.length > 0) {
        const start = buffered.start(0);
        const end = buffered.end(0);
        const duration = nextVideoRef.current.duration || 1;
        const percent = (end / duration) * 100;
        bufferInfo = `Buffer: ${start.toFixed(1)}s to ${end.toFixed(1)}s (${percent.toFixed(0)}%)`;
        bufferProgress = percent;
      }
      
      console.log(`Video ${videoIdx} not ready yet (state: ${readyState}). ${bufferInfo}`);
      
      // If we've checked too many times or have some buffer, proceed anyway
      if (checkCount >= maxChecks || bufferProgress > 30) {
        console.log(`${checkCount >= maxChecks ? 'Max checks reached' : 'Sufficient buffer'}, proceeding with transition`);
        waitingForBufferRef.current = false;
        executeTransition(videoIdx);
        return;
      }
      
      // Try again shortly
      bufferingTimeoutRef.current = setTimeout(checkBufferStatus, 300);
    };
    
    // Start checking
    checkBufferStatus();
  };
  
  // Execute the transition to the next video
  const executeTransition = (videoIdx: number) => {
    console.log(`Executing transition to video ${videoIdx}`);
    setIsTransitioning(true);
    
    // Try to play the next video
    nextVideoRef.current?.play()
      .then(() => {
        console.log(`Video ${videoIdx} playing, transition started`);
        
        // Add to played videos list
        setVideosPlayed(prev => [...prev, videoIdx]);
        
        // After transition completes
        transitionTimeoutRef.current = setTimeout(() => {
          // Update indices
          setCurrentVideoIndex(videoIdx);
          
          // Select new next video and start preloading
          const newNextIdx = selectNextVideo();
          if (!preloadedVideoRefs.current[newNextIdx]) {
            createPreloadedVideo(newNextIdx);
          }
          
          // End transition
          setIsTransitioning(false);
          rotationInProgressRef.current = false;
          
          // Apply current video
          if (currentVideoRef.current) {
            currentVideoRef.current.src = videoUrls[videoIdx];
            currentVideoRef.current.load();
            currentVideoRef.current.play()
              .catch(e => {
                console.error("Current video play error:", e);
                // Try to recover
                startRotationTimer(5000);
              });
          }
          
          console.log(`Transition complete. Current: ${videoIdx}, Next: ${newNextIdx}`);
          
          // Start next rotation
          startRotationTimer();
          
          // Preload videos for the next cycle 
          // (not the immediate next but the one after)
          const futureCandidates = Array.from(
            { length: videoUrls.length }, 
            (_, i) => i
          ).filter(idx => idx !== videoIdx && idx !== newNextIdx);
          
          if (futureCandidates.length > 0) {
            const futureIdx = futureCandidates[Math.floor(Math.random() * futureCandidates.length)];
            if (!preloadedVideoRefs.current[futureIdx]) {
              setTimeout(() => {
                createPreloadedVideo(futureIdx);
              }, 2000); // Delay to not interfere with current transition
            }
          }
        }, transitionDuration);
      })
      .catch(error => {
        console.error(`Error playing video ${videoIdx}:`, error);
        setIsTransitioning(false);
        rotationInProgressRef.current = false;
        
        // Select a different video
        const differentNextIdx = selectNextVideo();
        console.log(`Failed to play video ${videoIdx}, trying ${differentNextIdx} instead`);
        
        // Restart timer with shorter duration
        startRotationTimer(5000);
      });
  };
  
  // Safety mechanism to prevent frozen videos
  useEffect(() => {
    const safetyInterval = setInterval(() => {
      // If waiting too long for buffer, force continue
      if (waitingForBufferRef.current) {
        const waitingTime = 8000; // ms to wait before forcing transition
        console.log(`Safety check: Been waiting for buffer for ${waitingTime}ms, forcing transition`);
        
        if (bufferingTimeoutRef.current) {
          clearTimeout(bufferingTimeoutRef.current);
          bufferingTimeoutRef.current = null;
        }
        
        waitingForBufferRef.current = false;
        
        if (nextVideoIndex >= 0 && nextVideoIndex < videoUrls.length) {
          executeTransition(nextVideoIndex);
        } else {
          const newNextIdx = selectNextVideo();
          executeTransition(newNextIdx);
        }
        return;
      }
      
      // Check if current video is playing correctly
      if (currentVideoRef.current && !isTransitioning && !rotationInProgressRef.current) {
        const isVideoStuck = currentVideoRef.current.paused || 
                            currentVideoRef.current.currentTime <= 0 ||
                            currentVideoRef.current.readyState < 3;
        
        if (isVideoStuck) {
          console.log("Safety check: Video appears stuck, forcing next transition");
          rotationInProgressRef.current = true;
          prepareNextVideoTransition();
        }
      }
    }, 8000); // Check every 8 seconds
    
    return () => clearInterval(safetyInterval);
  }, [videoUrls.length]);
  
  // Handle video error events
  const handleVideoError = (videoType: string) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error(`Error with ${videoType} video:`, e);
    
    if (videoType === 'current') {
      // Current video failed, try to move to next one
      rotationInProgressRef.current = true;
      prepareNextVideoTransition();
    } else {
      // Next video failed, try a different one
      const newNextIdx = selectNextVideo();
      console.log(`Next video error, selected new next video: ${newNextIdx}`);
      
      // Reset transition state if needed
      if (isTransitioning) {
        setIsTransitioning(false);
        rotationInProgressRef.current = false;
        startRotationTimer(5000);
      }
    }
  };
  
  return (
    <div className="video-container fixed top-0 left-0 w-full h-full z-0">
      {/* Current Video */}
      <video
        ref={currentVideoRef}
        autoPlay
        muted
        playsInline
        onError={handleVideoError('current')}
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: `opacity ${transitionDuration}ms ease-in-out`
        }}
      />
      
      {/* Next Video (for transition) */}
      <video
        ref={nextVideoRef}
        autoPlay={false}
        muted
        playsInline
        onError={handleVideoError('next')}
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transition: `opacity ${transitionDuration}ms ease-in-out`
        }}
      />
    </div>
  );
};

export default BackgroundVideoPlayer;
