
import React, { ReactNode, useEffect } from 'react';
import Logo from './Logo';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  // Ensure video stays fixed during all component lifecycles
  useEffect(() => {
    // Force video to maintain its position
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      videoContainer.setAttribute('style', 'position: fixed !important; top: 0 !important; left: 0 !important;');
    }
    
    return () => {
      // Cleanup - although not strictly necessary since styles are in global CSS
    };
  }, []);
  
  return (
    <div className="min-h-screen w-full relative">
      {/* Video Background */}
      <div className="video-container">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="video-background"
        >
          <source src="https://adegavm.shop/bgs.mp4" type="video/mp4" />
          {/* Fallback background if video fails to load */}
          <div className="absolute inset-0 bg-black"></div>
        </video>
      </div>
      
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
