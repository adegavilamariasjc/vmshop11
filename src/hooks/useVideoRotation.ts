
import { useState, useRef, useEffect } from 'react';

export const useVideoRotation = (videoUrls: string[], transitionDuration = 2000, playDuration = 30000) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [nextVideo, setNextVideo] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playedVideos = useRef<number[]>([0]);

  // Select a new video that hasn't been played recently
  const selectNextVideo = () => {
    // Reset if all videos have been played
    if (playedVideos.current.length >= videoUrls.length - 1) {
      playedVideos.current = [currentVideo];
    }
    
    // Find videos that haven't been played recently
    const availableVideos = Array.from(
      { length: videoUrls.length },
      (_, i) => i
    ).filter(i => 
      i !== currentVideo && 
      !playedVideos.current.includes(i)
    );
    
    // If all videos have been played, just pick a random one that's not current
    if (availableVideos.length === 0) {
      const options = Array.from(
        { length: videoUrls.length },
        (_, i) => i
      ).filter(i => i !== currentVideo);
      
      return options[Math.floor(Math.random() * options.length)];
    }
    
    return availableVideos[Math.floor(Math.random() * availableVideos.length)];
  };

  // Initialize the rotation timer
  const startRotationTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Add some randomness to the play duration
    const randomFactor = 0.75 + (Math.random() * 0.5);
    const duration = Math.round(playDuration * randomFactor);
    
    timerRef.current = setTimeout(() => {
      rotateToNextVideo();
    }, duration);
  };

  // Handle video rotation
  const rotateToNextVideo = () => {
    if (isTransitioning || videoUrls.length < 2) return;
    
    const nextVideoIndex = selectNextVideo();
    setNextVideo(nextVideoIndex);
    setIsTransitioning(true);
    
    // Get the next video reference (opposite of current active video)
    const nextVideoRef = currentVideo === videoRef1.current?.src ? videoRef2 : videoRef1;
    
    if (nextVideoRef.current) {
      nextVideoRef.current.src = videoUrls[nextVideoIndex];
      nextVideoRef.current.load();
      
      // Play the video once it's loaded
      const playVideo = () => {
        if (nextVideoRef.current) {
          nextVideoRef.current.play()
            .catch(err => console.error("Error playing video:", err));
        }
        nextVideoRef.current?.removeEventListener('canplaythrough', playVideo);
      };
      
      nextVideoRef.current.addEventListener('canplaythrough', playVideo);
      
      // Complete the transition after the transition duration
      setTimeout(() => {
        setCurrentVideo(nextVideoIndex);
        setIsTransitioning(false);
        playedVideos.current.push(nextVideoIndex);
        startRotationTimer();
      }, transitionDuration);
    }
  };

  // Handle video ended event
  const handleVideoEnded = () => {
    rotateToNextVideo();
  };

  // Initialize on mount
  useEffect(() => {
    if (videoUrls.length === 0) return;
    
    // Preload the first video
    if (videoRef1.current) {
      videoRef1.current.src = videoUrls[0];
      videoRef1.current.load();
      videoRef1.current.play()
        .catch(err => console.error("Error playing initial video:", err));
    }
    
    // Preload the second video
    if (videoUrls.length > 1 && videoRef2.current) {
      videoRef2.current.src = videoUrls[1];
      videoRef2.current.load();
    }
    
    startRotationTimer();
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [videoUrls]);

  return {
    currentVideo,
    nextVideo,
    isTransitioning,
    videoRef1,
    videoRef2,
    handleVideoEnded
  };
};
