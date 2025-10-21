
import React, { ReactNode } from 'react';
import Logo from './Logo';
import AudioPlayer from './AudioPlayer';
import StoreStatus from './StoreStatus';
import AdminLink from './AdminLink';
import { useStoreStatus } from '@/hooks/useStoreStatus';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const { isOpen } = useStoreStatus();

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white">
      <AudioPlayer />
      
      <div className="relative z-10 w-full min-h-screen p-0">
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
