
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
  const [nextVideoIndex, setNextVideoIndex] = useState(1 % videoUrls.length);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [playedVideos, setPlayedVideos] = useState<number[]>([0]);
  const [videosLoaded, setVideosLoaded] = useState<boolean[]>([]);
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize videos and track loading status
  useEffect(() => {
    if (videoUrls.length === 0) return;
    
    console.log("Initializing videos with urls:", videoUrls);
    
    // Initialize loading status array
    const initialLoadingStatus = Array(videoUrls.length).fill(false);
    setVideosLoaded(initialLoadingStatus);
    
    // Preload all videos to ensure smooth transitions
    videoUrls.forEach((url, idx) => {
      const videoElement = new Audio();
      videoElement.src = url;
      
      videoElement.oncanplaythrough = () => {
        setVideosLoaded(prev => {
          const newStatus = [...prev];
          newStatus[idx] = true;
          return newStatus;
        });
        console.log(`Video ${idx} (${url}) is preloaded and ready`);
      };
      
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = url;
      preloadLink.as = 'video';
      document.head.appendChild(preloadLink);
    });
    
    // Set initial sources for videos
    if (currentVideoRef.current) {
      currentVideoRef.current.src = videoUrls[currentVideoIndex];
      currentVideoRef.current.load();
      currentVideoRef.current.play()
        .then(() => {
          // Mark the first video as loaded
          setVideosLoaded(prev => {
            const newStatus = [...prev];
            newStatus[currentVideoIndex] = true;
            return newStatus;
          });
        })
        .catch(e => console.error("Initial video play suppressed:", e));
    }
    
    if (nextVideoRef.current && videoUrls.length > 1) {
      nextVideoRef.current.src = videoUrls[nextVideoIndex];
      nextVideoRef.current.load();
    }
    
    // Start rotation timer
    startRotationTimer();
    
    return () => {
      cleanup();
    };
  }, [videoUrls]); // Re-run when videoUrls change
  
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
  
  // Function to get next random index that hasn't been played yet
  const getNextVideoIndex = () => {
    if (videoUrls.length <= 1) return 0;
    
    // If we've played all videos, reset the played list
    if (playedVideos.length >= videoUrls.length) {
      console.log("All videos have been played, resetting played list");
      setPlayedVideos([currentVideoIndex]);
    }
    
    // Find indexes that haven't been played yet
    const availableIndexes = Array.from(
      { length: videoUrls.length }, 
      (_, i) => i
    ).filter(idx => !playedVideos.includes(idx) && idx !== currentVideoIndex);
    
    console.log("Available indexes:", availableIndexes, "Already played:", playedVideos);
    
    // If somehow all are played, just pick any except current
    if (availableIndexes.length === 0) {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * videoUrls.length);
      } while (newIndex === currentVideoIndex);
      console.log("No available indexes, picked random:", newIndex);
      return newIndex;
    }
    
    // Pick a random index from available ones
    const randomIndex = Math.floor(Math.random() * availableIndexes.length);
    console.log("Picked random index from available:", availableIndexes[randomIndex]);
    return availableIndexes[randomIndex];
  };
  
  // Start the rotation timer
  const startRotationTimer = () => {
    cleanup(); // Clear any existing timers
    
    // Schedule next transition
    timerRef.current = setTimeout(() => {
      console.log("Timer triggered, starting transition");
      
      // Check if there is at least one other video loaded before transitioning
      const areOtherVideosLoaded = videosLoaded.some((loaded, idx) => loaded && idx !== currentVideoIndex);
      
      if (areOtherVideosLoaded) {
        startTransition();
      } else {
        console.log("Waiting for videos to load before transition");
        // Retry transition after a short delay
        bufferingTimeoutRef.current = setTimeout(() => {
          startTransition();
        }, 2000); // Wait 2 seconds before trying again
      }
    }, playDuration);
  };
  
  // Start transition to next video
  const startTransition = () => {
    if (isTransitioning || videoUrls.length <= 1) {
      console.log("Cannot start transition: already transitioning or not enough videos");
      startRotationTimer(); // Restart timer if we can't transition now
      return;
    }
    
    // Select a truly random next video that hasn't been played recently
    const randomNextIndex = getNextVideoIndex();
    
    // Ensure the next video is different from current
    if (randomNextIndex === currentVideoIndex) {
      console.log("Next video is the same as current, selecting a different one");
      startRotationTimer(); // Try again
      return;
    }
    
    // Update next video index
    setNextVideoIndex(randomNextIndex);
    
    console.log("Starting transition from video", currentVideoIndex, "to", randomNextIndex);
    
    // Make sure the next video URL is valid
    const nextVideoUrl = videoUrls[randomNextIndex];
    if (!nextVideoUrl) {
      console.log("Next video URL is invalid:", nextVideoUrl);
      startRotationTimer();
      return;
    }
    
    // Ensure next video is ready
    if (nextVideoRef.current) {
      // Explicitly set the source of the next video
      nextVideoRef.current.src = nextVideoUrl;
      nextVideoRef.current.load();
      
      // Set current time to 0 to make sure the video starts from the beginning
      nextVideoRef.current.currentTime = 0;
      
      // Advanced buffering check
      const waitForBuffer = () => {
        // Check if video has enough data
        if (nextVideoRef.current && 
            nextVideoRef.current.readyState >= 3 &&  // HAVE_FUTURE_DATA or higher
            nextVideoRef.current.buffered.length > 0) {
          
          const bufferedEnd = nextVideoRef.current.buffered.end(0);
          const duration = nextVideoRef.current.duration;
          const bufferedRatio = bufferedEnd / duration;
          
          console.log(`Video ${randomNextIndex} buffered ratio: ${bufferedRatio.toFixed(2)}`);
          
          if (bufferedRatio >= 0.1 || bufferedEnd >= 5) { // At least 10% or 5 seconds buffered
            console.log(`Video ${randomNextIndex} has sufficient buffer, starting transition`);
            beginTransition(randomNextIndex);
          } else {
            // Not enough buffered yet, check again soon
            console.log(`Video ${randomNextIndex} not buffered enough, waiting...`);
            bufferingTimeoutRef.current = setTimeout(waitForBuffer, 500);
          }
        } else {
          // Video not ready yet, check again soon
          console.log(`Video ${randomNextIndex} not ready yet, waiting...`);
          bufferingTimeoutRef.current = setTimeout(waitForBuffer, 500);
        }
      };
      
      // Begin waiting for buffer
      waitForBuffer();
    } else {
      console.log("Next video reference is not available");
      startRotationTimer();
    }
  };
  
  // Once buffering is confirmed, begin the actual transition
  const beginTransition = (randomNextIndex: number) => {
    setIsTransitioning(true);
    
    nextVideoRef.current?.play()
      .then(() => {
        console.log(`Video ${randomNextIndex} playing, beginning fade transition`);
        
        // Add next video to played list
        setPlayedVideos(prev => [...prev, randomNextIndex]);
        
        // After transition is complete
        setTimeout(() => {
          // Swap videos - the next video becomes current
          setCurrentVideoIndex(randomNextIndex);
          
          // Choose the new next video index
          const newNextIndex = getNextVideoIndex();
          console.log("Next video after transition will be", newNextIndex);
          setNextVideoIndex(newNextIndex);
          
          // End transition state
          setIsTransitioning(false);
          
          // Update video elements
          if (currentVideoRef.current && nextVideoRef.current) {
            // Update the current video reference
            currentVideoRef.current.src = videoUrls[randomNextIndex];
            currentVideoRef.current.load();
            currentVideoRef.current.play().catch(e => console.error("Current video play suppressed:", e));
            
            // Prepare the new next video
            nextVideoRef.current.src = videoUrls[newNextIndex];
            nextVideoRef.current.load();
            console.log(`Preloading next video ${newNextIndex}`);
          }
          
          console.log("Transition complete. Current:", randomNextIndex, "Next:", newNextIndex);
          console.log("Played videos now:", [...playedVideos, randomNextIndex]);
          
          // Start the next rotation
          startRotationTimer();
        }, transitionDuration);
      })
      .catch(e => {
        console.error("Next video play failed:", e);
        // If play fails, try another video
        setIsTransitioning(false);
        startRotationTimer(); // Try again shortly
      });
  };
  
  // Handle video error events
  const handleVideoError = (videoIndex: number) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error(`Error with video ${videoIndex}:`, e);
    
    if (videoIndex === currentVideoIndex) {
      // If current video fails, try to switch to next
      startTransition();
    } else if (videoIndex === nextVideoIndex) {
      // If next video fails, select a different one
      const newNextIndex = getNextVideoIndex();
      setNextVideoIndex(newNextIndex);
      
      if (nextVideoRef.current) {
        nextVideoRef.current.src = videoUrls[newNextIndex];
        nextVideoRef.current.load();
      }
    }
  };
  
  // Force transition for debug purposes or if stuck
  useEffect(() => {
    // If a video gets stuck playing for too long, force a transition
    const maxPlayTime = playDuration * 1.5; // 50% longer than intended play duration
    
    const safetyTimer = setTimeout(() => {
      console.log("Safety timer triggered - forcing transition");
      startTransition();
    }, maxPlayTime);
    
    return () => clearTimeout(safetyTimer);
  }, [currentVideoIndex]);
  
  return (
    <div className="video-container fixed top-0 left-0 w-full h-full z-0">
      {/* Current Video */}
      <video
        ref={currentVideoRef}
        autoPlay
        loop
        muted
        playsInline
        onError={handleVideoError(currentVideoIndex)}
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
        loop
        muted
        playsInline
        onError={handleVideoError(nextVideoIndex)}
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
