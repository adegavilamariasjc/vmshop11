
const baseUrl = 'https://adegavm.com.br';

export const getVideoUrls = (): string[] => {
  const videoUrls: string[] = [];
  
  // Generate URLs from 1 to 9
  for (let i = 1; i <= 9; i++) {
    videoUrls.push(`${baseUrl}/${i}.mp4`);
  }
  
  return videoUrls;
};
