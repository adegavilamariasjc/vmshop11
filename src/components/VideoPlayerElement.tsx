
import React from 'react';

interface VideoPlayerElementProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onEnded?: () => void;
  onCanPlay?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  transitionDuration: number;
}

const VideoPlayerElement: React.FC<VideoPlayerElementProps> = ({
  videoRef,
  isActive,
  onEnded,
  onCanPlay,
  onError,
  transitionDuration,
}) => {
  return (
    <video
      ref={videoRef}
      autoPlay={isActive}
      muted
      playsInline
      preload="auto"
      onEnded={onEnded}
      onCanPlay={onCanPlay}
      onError={onError}
      className="absolute top-0 left-0 w-full h-full object-cover"
      style={{
        opacity: isActive ? 1 : 0,
        transition: `opacity ${transitionDuration}ms ease-in-out`
      }}
    />
  );
};

export default VideoPlayerElement;
