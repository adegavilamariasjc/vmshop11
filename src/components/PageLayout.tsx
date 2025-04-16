
import React, { ReactNode } from 'react';
import Logo from './Logo';
import VideoBackground from './VideoBackground';
import AudioPlayer from './AudioPlayer';
import StoreStatus from './StoreStatus';
import AdminLink from './AdminLink';
import { useStoreStatus } from '@/hooks/useStoreStatus';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  // Array of video URLs for background rotation
  const videoUrls = [
    "/videos/bgs.mp4",
    "/videos/1.mp4",
    "/videos/2.mp4",
    "/videos/3.mp4",
    "/videos/4.mp4"
  ];
  
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
          {!isOpen ? (
            <div className="text-center p-6 bg-black/40 rounded-lg">
              <h2 className="text-xl text-white mb-2">Loja Fechada</h2>
              <p className="text-gray-300">
                Nosso horário de funcionamento é das 18h às 5h. 
                Aguardamos você mais tarde!
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
