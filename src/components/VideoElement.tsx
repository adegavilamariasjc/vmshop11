
import React from 'react';

interface VideoElementProps {
  src: string;
  isActive: boolean;
  onEnded?: () => void;
  transitionDuration: number;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoElement: React.FC<VideoElementProps> = ({
  src,
  isActive,
  onEnded,
  transitionDuration,
  videoRef
}) => {
  return (
    <video
      ref={videoRef}
      src={src}
      className="absolute top-0 left-0 w-full h-full object-cover"
      style={{
        opacity: isActive ? 1 : 0,
        transition: `opacity ${transitionDuration}ms ease-in-out`
      }}
      autoPlay={isActive}
      muted
      playsInline
      preload="auto"
      onEnded={onEnded}
    />
  );
};

export default VideoElement;
