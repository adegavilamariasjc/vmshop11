
import React from 'react';
import { useVideoRotation } from '@/hooks/useVideoRotation';
import VideoElement from './VideoElement';

interface VideoBackgroundProps {
  videoUrls: string[];
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrls }) => {
  const {
    currentVideo,
    nextVideo,
    isTransitioning,
    videoRef1,
    videoRef2,
    handleVideoEnded
  } = useVideoRotation(videoUrls);
  
  if (videoUrls.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-black">
      <VideoElement
        src={videoUrls[currentVideo]}
        isActive={!isTransitioning}
        onEnded={handleVideoEnded}
        transitionDuration={2000}
        videoRef={videoRef1}
      />
      <VideoElement
        src={videoUrls[nextVideo]}
        isActive={isTransitioning}
        transitionDuration={2000}
        videoRef={videoRef2}
      />
    </div>
  );
};

export default VideoBackground;
