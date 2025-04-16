import React, { ReactNode, useEffect, useState } from 'react';
import Logo from './Logo';
import BackgroundVideoPlayer from './BackgroundVideoPlayer';
import AudioPlayer from './AudioPlayer';

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
  
  // Shuffle the array of videos on component mount for true randomness
  const [shuffledVideoUrls, setShuffledVideoUrls] = useState<string[]>(videoUrls);
  
  useEffect(() => {
    // Fisher-Yates shuffle algorithm to randomly order the videos
    const shuffleArray = (array: string[]): string[] => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };
    
    setShuffledVideoUrls(shuffleArray(videoUrls));
  }, []);
  
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <AudioPlayer />
      <BackgroundVideoPlayer 
        videoUrls={shuffledVideoUrls}
        transitionDuration={2000}
        playDuration={15000}
      />
      
      {/* Content overlay - full width with 50% opacity black background */}
      <div className="relative z-10 w-full min-h-screen bg-black/50 p-0">
        <div className="max-w-lg mx-auto w-full px-4">
          <div className="flex justify-center">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
