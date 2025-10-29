
import React, { ReactNode } from 'react';
import Logo from './Logo';
import VideoBackground from './VideoBackground';
import AudioPlayer from './AudioPlayer';
import StoreStatus from './StoreStatus';
import UnifiedLoginButton from './UnifiedLoginButton';
import { useStoreStatus } from '@/hooks/useStoreStatus';
import { getVideoUrls } from '@/utils/videoUrls';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const videoUrls = getVideoUrls();
  const { isOpen } = useStoreStatus();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <AudioPlayer />
      <VideoBackground videoUrls={videoUrls} />
      
      <div className="relative z-10 w-full min-h-screen bg-black/50 p-0">
        <div className="max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-center py-4">
            <Logo />
          </div>
          <div className="mb-3 sm:mb-4">
            <StoreStatus />
          </div>
          <UnifiedLoginButton />
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
