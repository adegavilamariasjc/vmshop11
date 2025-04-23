
import React, { ReactNode } from 'react';
import Logo from './Logo';
import VideoBackground from './VideoBackground';
import AudioPlayer from './AudioPlayer';
import StoreStatus from './StoreStatus';
import AdminLink from './AdminLink';
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
        <div className="max-w-lg mx-auto w-full px-4">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="mb-4 mt-2">
            <StoreStatus />
          </div>
          <AdminLink />
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
