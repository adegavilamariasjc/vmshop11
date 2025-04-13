
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
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  };

  // Preload all videos on initial mount
  useEffect(() => {
    if (videoUrls.length === 0) return;
    
    console.log("Initial video preloading started");
    
    // Start preloading all videos
    videoUrls.forEach((url, index) => {
      if (index === currentVideoIndex) return; // Current video will be loaded in main playback
      
      const preloadVideo = new Audio();
      preloadVideo.src = url;
      preloadVideo.preload = 'auto';
      
      preloadVideo.oncanplaythrough = () => {
        console.log(`Video ${index} preloaded successfully`);
        setPreloadedVideos(prev => ({...prev, [index]: true}));
      };
    });
    
    // Add preload links to head
    videoUrls.forEach(url => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = url;
      preloadLink.as = 'video';
      document.head.appendChild(preloadLink);
    });
    
    // Pick a random next video
    selectNextVideo();
    
    // Set up the first video
    if (currentVideoRef.current) {
      currentVideoRef.current.src = videoUrls[currentVideoIndex];
      currentVideoRef.current.load();
      currentVideoRef.current.play()
        .catch(e => console.error("Initial video play failed:", e));
    }
    
    // Start rotation timer
    startRotationTimer();
    
    return () => {
      cleanup();
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
    
    console.log("Available video indexes:", availableIndexes);
    
    // No available videos (should not happen but as a fallback)
    if (availableIndexes.length === 0) {
      // Pick any video except current one
      const randomIndex = Math.floor(Math.random() * (videoUrls.length - 1));
      const newNextIndex = randomIndex >= currentVideoIndex ? randomIndex + 1 : randomIndex;
      console.log(`No available videos, selected fallback: ${newNextIndex}`);
      setNextVideoIndex(newNextIndex);
      return newNextIndex;
    }
    
    // Pick a random video from available ones
    const randomIdx = Math.floor(Math.random() * availableIndexes.length);
    const selectedNextIndex = availableIndexes[randomIdx];
    console.log(`Selected next video: ${selectedNextIndex}`);
    setNextVideoIndex(selectedNextIndex);
    
    // Return the selected index
    return selectedNextIndex;
  };
  
  // Start the rotation timer
  const startRotationTimer = () => {
    cleanup(); // Clear any existing timers
    
    console.log(`Setting rotation timer for ${playDuration}ms`);
    timerRef.current = setTimeout(() => {
      console.log("Rotation timer triggered, preparing transition");
      prepareNextVideoTransition();
    }, playDuration);
  };
  
  // Prepare the next video for transition
  const prepareNextVideoTransition = () => {
    if (isTransitioning) {
      console.log("Already in transition, skipping");
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
      startRotationTimer(); // Try again later
      return;
    }
    
    console.log(`Preparing video ${nextIdx} for transition`);
    
    // Set the source of the next video
    nextVideoRef.current.src = videoUrls[nextIdx];
    nextVideoRef.current.load();
    
    // Initialize buffer checking
    checkVideoBuffer(nextIdx);
  };
  
  // Check if the video has buffered enough to start playing
  const checkVideoBuffer = (videoIdx: number) => {
    if (!nextVideoRef.current) {
      startRotationTimer();
      return;
    }
    
    const checkBufferStatus = () => {
      if (!nextVideoRef.current) return;
      
      const readyState = nextVideoRef.current.readyState;
      
      if (readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        console.log(`Video ${videoIdx} buffered enough, starting transition`);
        executeTransition(videoIdx);
      } else {
        // Check buffer progress
        const buffered = nextVideoRef.current.buffered;
        let bufferInfo = "No buffer ranges";
        
        if (buffered.length > 0) {
          const start = buffered.start(0);
          const end = buffered.end(0);
          const duration = nextVideoRef.current.duration || 1;
          const percent = (end / duration) * 100;
          bufferInfo = `Buffer: ${start.toFixed(1)}s to ${end.toFixed(1)}s (${percent.toFixed(0)}%)`;
        }
        
        console.log(`Video ${videoIdx} not ready yet (state: ${readyState}). ${bufferInfo}`);
        
        // Try again shortly
        bufferingTimeoutRef.current = setTimeout(checkBufferStatus, 500);
      }
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
        setTimeout(() => {
          // Update indices
          setCurrentVideoIndex(videoIdx);
          
          // Select new next video
          const newNextIdx = selectNextVideo();
          
          // End transition
          setIsTransitioning(false);
          
          // Preload next video
          if (currentVideoRef.current) {
            currentVideoRef.current.src = videoUrls[videoIdx];
            currentVideoRef.current.load();
            currentVideoRef.current.play()
              .catch(e => console.error("Current video play error:", e));
          }
          
          console.log(`Transition complete. Current: ${videoIdx}, Next: ${newNextIdx}`);
          
          // Start next rotation
          startRotationTimer();
        }, transitionDuration);
      })
      .catch(error => {
        console.error(`Error playing video ${videoIdx}:`, error);
        setIsTransitioning(false);
        
        // Select a different video
        const differentNextIdx = selectNextVideo();
        console.log(`Failed to play video ${videoIdx}, trying ${differentNextIdx} instead`);
        
        // Restart timer
        startRotationTimer();
      });
  };
  
  // Safety mechanism to prevent frozen videos
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (currentVideoRef.current) {
        // Check if video is playing correctly
        const isVideoStuck = currentVideoRef.current.paused || 
                            currentVideoRef.current.currentTime <= 0 ||
                            currentVideoRef.current.readyState < 3;
        
        if (isVideoStuck) {
          console.log("Safety check: Video appears stuck, forcing next transition");
          prepareNextVideoTransition();
        }
      }
    }, playDuration * 1.2); // 20% longer than intended play duration
    
    return () => clearTimeout(safetyTimeout);
  }, [currentVideoIndex, playDuration]);
  
  // Handle video error events
  const handleVideoError = (videoType: string) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error(`Error with ${videoType} video:`, e);
    
    if (videoType === 'current') {
      // Current video failed, try to move to next one
      prepareNextVideoTransition();
    } else {
      // Next video failed, try a different one
      const newNextIdx = selectNextVideo();
      console.log(`Next video error, selected new next video: ${newNextIdx}`);
      
      // Reset transition state if needed
      if (isTransitioning) {
        setIsTransitioning(false);
        startRotationTimer();
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
