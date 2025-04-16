
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
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <audio
        ref={audioRef}
        src={tracks[currentTrackIndex]}
        onEnded={nextTrack}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={togglePlayPause}
        className="bg-black/50 hover:bg-black/70"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={nextTrack}
        className="bg-black/50 hover:bg-black/70"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AudioPlayer;
