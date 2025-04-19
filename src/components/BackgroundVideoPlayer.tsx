
import React from 'react';
import { useVideoRotation } from '@/hooks/useVideoRotation';
import VideoElement from './VideoElement';

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
  const {
    currentVideo,
    nextVideo,
    isTransitioning,
    videoRef1,
    videoRef2,
    handleVideoEnded
  } = useVideoRotation(videoUrls, transitionDuration, playDuration);
  
  if (videoUrls.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-black">
      <VideoElement
        src={videoUrls[currentVideo]}
        isActive={!isTransitioning}
        onEnded={handleVideoEnded}
        transitionDuration={transitionDuration}
        videoRef={videoRef1}
      />
      <VideoElement
        src={videoUrls[nextVideo]}
        isActive={isTransitioning}
        transitionDuration={transitionDuration}
        videoRef={videoRef2}
      />
    </div>
  );
};

export default BackgroundVideoPlayer;
