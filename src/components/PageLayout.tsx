
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
        backgroundImage: "url('https://adegavm.com/bgs.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-black/70 p-4">
        <Logo />
        {children}
        <AdminLink />
      </div>
    </div>
  );
};

export default PageLayout;
