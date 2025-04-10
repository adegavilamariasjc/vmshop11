
import React, { ReactNode } from 'react';
import Logo from './Logo';
import AdminLink from './AdminLink';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full bg-fixed"
      style={{ 
        backgroundImage: "url('https://adegavm.shop/bgs.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-black/70 p-4">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
        <AdminLink />
      </div>
    </div>
  );
};

export default PageLayout;
