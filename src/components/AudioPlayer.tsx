
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward } from 'lucide-react';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = [
    "https://adegavm.shop/adegavm.mp3",
    "https://adegavm.shop/adegavm2.mp3"
  ];

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        stopAudio();
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
      <audio
        ref={audioRef}
        src={tracks[currentTrackIndex]}
        onEnded={nextTrack}
      />
      <Button
        size="icon"
        onClick={togglePlayPause}
        className="bg-purple-dark/70 hover:bg-purple-dark text-white p-3 rounded-full shadow-lg transition-all duration-200"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        size="icon"
        onClick={nextTrack}
        className="bg-purple-dark/70 hover:bg-purple-dark text-white p-3 rounded-full shadow-lg transition-all duration-200"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AudioPlayer;
