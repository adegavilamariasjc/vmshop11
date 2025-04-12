
import React, { ReactNode } from 'react';
import Logo from './Logo';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Video Background with Full Opacity */}
      <div className="video-container">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute w-full h-full object-cover"
        >
          <source src="https://adegavm.shop/bgs.mp4" type="video/mp4" />
          {/* Fallback background if video fails to load */}
          <div className="absolute inset-0 bg-black"></div>
        </video>
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen bg-black/70 p-4">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
