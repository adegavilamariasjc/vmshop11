
export const createPreloadedVideo = (
  index: number,
  videoUrl: string,
  preloadedVideoRefs: { current: { [key: number]: HTMLVideoElement } },
  setBufferingStatus: (fn: (prev: { [key: number]: number }) => { [key: number]: number }) => void,
  setPreloadedVideos: (fn: (prev: { [key: number]: boolean }) => { [key: number]: boolean }) => void
) => {
  if (preloadedVideoRefs.current[index]) return;

  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.src = videoUrl;
  video.load();

  const updateBufferStatus = () => {
    if (!video.buffered || video.buffered.length === 0) {
      setBufferingStatus(prev => ({...prev, [index]: 0}));
      return;
    }

    const bufferedEnd = video.buffered.end(0);
    const duration = video.duration || 1;
    const percent = Math.min(100, Math.round((bufferedEnd / duration) * 100));

    setBufferingStatus(prev => ({...prev, [index]: percent}));

    if (percent >= 90) {
      setPreloadedVideos(prev => ({...prev, [index]: true}));
      console.log(`Video ${index} preloaded: ${percent}% buffered`);
    }
  };

  video.addEventListener('loadedmetadata', updateBufferStatus);
  video.addEventListener('progress', updateBufferStatus);
  video.addEventListener('canplaythrough', () => {
    setPreloadedVideos(prev => ({...prev, [index]: true}));
    console.log(`Video ${index} is ready for playback`);
  });

  video.addEventListener('error', (e) => {
    console.error(`Error preloading video ${index}:`, e);
    setPreloadedVideos(prev => ({...prev, [index]: false}));
  });

  preloadedVideoRefs.current[index] = video;
};
