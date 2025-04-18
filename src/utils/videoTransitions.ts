
export const selectNextVideo = (
  videoUrls: string[],
  currentVideoIndex: number,
  nextVideoIndex: number,
  videosPlayed: number[],
  createPreloadedVideo: (index: number) => void
) => {
  if (videosPlayed.length >= videoUrls.length) {
    console.log("All videos have been played, resetting played list to current only");
    return {
      videosPlayed: [currentVideoIndex],
      nextVideoIndex: selectRandomAvailableVideo(videoUrls, currentVideoIndex, [currentVideoIndex])
    };
  }

  const availableIndexes = Array.from(
    { length: videoUrls.length },
    (_, i) => i
  ).filter(idx => !videosPlayed.includes(idx) && idx !== currentVideoIndex);

  if (nextVideoIndex >= 0 &&
      nextVideoIndex !== currentVideoIndex &&
      !videosPlayed.includes(nextVideoIndex) &&
      videosPlayed.length < videoUrls.length - 1) {
    console.log(`Keeping next video as ${nextVideoIndex}`);
    return { videosPlayed, nextVideoIndex };
  }

  const selectedNextIndex = selectRandomAvailableVideo(videoUrls, currentVideoIndex, videosPlayed);
  createPreloadedVideo(selectedNextIndex);

  return {
    videosPlayed,
    nextVideoIndex: selectedNextIndex
  };
};

const selectRandomAvailableVideo = (
  videoUrls: string[],
  currentVideoIndex: number,
  videosPlayed: number[]
): number => {
  const availableIndexes = Array.from(
    { length: videoUrls.length },
    (_, i) => i
  ).filter(idx => !videosPlayed.includes(idx) && idx !== currentVideoIndex);

  if (availableIndexes.length === 0) {
    const randomIndex = Math.floor(Math.random() * (videoUrls.length - 1));
    return randomIndex >= currentVideoIndex ? randomIndex + 1 : randomIndex;
  }

  return availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
};
