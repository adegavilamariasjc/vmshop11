
import { useState, useRef } from 'react';

interface VideoPlaybackState {
  currentVideoIndex: number;
  nextVideoIndex: number;
  isTransitioning: boolean;
  videosPlayed: number[];
  preloadedVideos: {[key: number]: boolean};
  bufferingStatus: {[key: number]: number};
}

interface VideoRefs {
  currentVideoRef: React.RefObject<HTMLVideoElement>;
  nextVideoRef: React.RefObject<HTMLVideoElement>;
  preloadedVideoRefs: React.MutableRefObject<{[key: number]: HTMLVideoElement}>;
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  bufferingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  transitionTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  waitingForBufferRef: React.MutableRefObject<boolean>;
  rotationInProgressRef: React.MutableRefObject<boolean>;
}

export const useVideoPlayback = (videoUrls: string[]) => {
  const [state, setState] = useState<VideoPlaybackState>({
    currentVideoIndex: 0,
    nextVideoIndex: -1,
    isTransitioning: false,
    videosPlayed: [0],
    preloadedVideos: {},
    bufferingStatus: {},
  });

  const refs: VideoRefs = {
    currentVideoRef: useRef<HTMLVideoElement>(null),
    nextVideoRef: useRef<HTMLVideoElement>(null),
    preloadedVideoRefs: useRef<{[key: number]: HTMLVideoElement}>({}),
    timerRef: useRef<NodeJS.Timeout | null>(null),
    bufferingTimeoutRef: useRef<NodeJS.Timeout | null>(null),
    transitionTimeoutRef: useRef<NodeJS.Timeout | null>(null),
    waitingForBufferRef: useRef<boolean>(false),
    rotationInProgressRef: useRef<boolean>(false),
  };

  return {
    state,
    setState,
    refs,
  };
};
