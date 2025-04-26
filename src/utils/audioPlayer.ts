
/**
 * Simple and reliable audio player utility
 */

class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private _audioUrl: string;
  private isPlaying: boolean = false;
  private unlockAttempted: boolean = false;
  private onPlayCallbacks: (() => void)[] = [];
  
  constructor(audioUrl: string = 'https://adegavm.shop/ring.mp3') {
    this._audioUrl = audioUrl;
    this.initialize();
  }
  
  get audioUrl(): string {
    return this._audioUrl;
  }
  
  private initialize(): void {
    // Create audio element
    this.audio = new Audio(this._audioUrl);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    
    // Set up event listeners
    if (this.audio) {
      this.audio.addEventListener('playing', () => {
        this.isPlaying = true;
        this.notifyPlayCallbacks();
        console.log('Audio is now playing');
      });
      
      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        console.log('Audio is now paused');
      });
      
      this.audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
    }
    
    // Attempt to unlock audio on page load
    this.setupUnlockEvents();
  }
  
  public play(): void {
    if (!this.audio || this.isPlaying) return;
    
    try {
      // Ensure the audio is at the beginning
      this.audio.currentTime = 0;
      
      // Set volume
      this.audio.volume = 0.7;
      
      // Force attempt to play
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio alert playing successfully');
            this.isPlaying = true;
            this.notifyPlayCallbacks();
          })
          .catch(err => {
            console.warn('Autoplay prevented. User interaction needed:', err);
            // Mark that we need user interaction
            if (!this.unlockAttempted) {
              console.log('Attempting to unlock audio on next user interaction');
              this.setupUnlockEvents();
              this.unlockAttempted = true;
            }
          });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }
  
  public stop(): void {
    if (!this.audio || !this.isPlaying) return;
    
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      console.log('Audio alert stopped');
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }
  
  public onPlay(callback: () => void): void {
    this.onPlayCallbacks.push(callback);
    
    // If already playing, trigger callback immediately
    if (this.isPlaying) {
      callback();
    }
  }
  
  private notifyPlayCallbacks(): void {
    this.onPlayCallbacks.forEach(callback => callback());
  }
  
  private setupUnlockEvents(): void {
    if (!this.audio) return;
    
    const unlockAudio = () => {
      // Need to play a short sound to unlock
      const originalVolume = this.audio ? this.audio.volume : 0;
      if (this.audio) {
        this.audio.volume = 0.001; // Almost silent
        
        const unlockPromise = this.audio.play();
        if (unlockPromise !== undefined) {
          unlockPromise
            .then(() => {
              console.log('Audio playback unlocked');
              if (this.audio) {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.audio.volume = originalVolume;
                this.unlockAttempted = false;
              }
            })
            .catch(err => {
              console.warn('Failed to unlock audio:', err);
              if (this.audio) {
                this.audio.volume = originalVolume;
              }
            });
        }
      }
      
      // Remove event listeners after first interaction attempt
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
    
    // Add event listeners for user interactions
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });
  }
  
  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
let audioPlayerInstance: AudioPlayer | null = null;

export const getAudioPlayer = (audioUrl?: string): AudioPlayer => {
  if (!audioPlayerInstance) {
    audioPlayerInstance = new AudioPlayer(audioUrl);
  } else if (audioUrl && audioUrl !== audioPlayerInstance.audioUrl) {
    // If URL changed, create new instance
    audioPlayerInstance = new AudioPlayer(audioUrl);
  }
  
  return audioPlayerInstance;
};
