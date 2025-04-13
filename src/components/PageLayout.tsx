
import React, { ReactNode } from 'react';
import Logo from './Logo';
import BackgroundVideoPlayer from './BackgroundVideoPlayer';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  // Array of video URLs for background rotation
  const videoUrls = [
    "https://adegavm.shop/bgs.mp4",
    "https://adegavm.shop/1.mp4",
    "https://adegavm.shop/2.mp4",
    "https://adegavm.shop/3.mp4",
    "https://adegavm.shop/4.mp4"
  ];
  
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      {/* Video Background with rotation - shorter play duration for more frequent transitions */}
      <BackgroundVideoPlayer 
        videoUrls={videoUrls}
        transitionDuration={2000}  // 2 seconds transition
        playDuration={20000}       // 20 seconds per video (reduced from 30s)
      />
      
      {/* Content overlay */}
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen bg-black/70 p-4 content-overlay">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
