
/**
 * Simple audio alert utility that works reliably across browsers
 */

class AudioAlert {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isPlaying: boolean = false;
  private audioUrl: string;
  
  constructor(audioUrl: string = 'https://adegavm.shop/ring.mp3') {
    this.audioUrl = audioUrl;
    this.initialize();
  }

  private initialize() {
    // Create an audio element as one method
    this.audio = new Audio();
    this.audio.src = this.audioUrl;
    this.audio.loop = true;
    
    // Try to also initialize AudioContext as a fallback method
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        
        // Pre-load the audio file
        this.preloadAudioFile();
      }
    } catch (err) {
      console.error('AudioContext not supported:', err);
    }
  }

  private async preloadAudioFile() {
    try {
      const response = await fetch(this.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      if (this.audioContext) {
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log('Audio file preloaded successfully');
      }
    } catch (err) {
      console.error('Error preloading audio file:', err);
    }
  }

  public play() {
    if (this.isPlaying) return;
    
    try {
      // Try multiple play methods for maximum compatibility
      this.playWithAudioElement();
      this.playWithAudioContext();
      
      this.isPlaying = true;
      console.log('Alert sound playing');
    } catch (err) {
      console.error('Error playing audio alert:', err);
    }
  }

  private playWithAudioElement() {
    if (!this.audio) return;
    
    // Reset the audio element
    this.audio.currentTime = 0;
    this.audio.volume = 0.7;
    
    // Play with catch to handle promise rejection
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Audio element play failed:', err);
      });
    }
  }

  private playWithAudioContext() {
    if (!this.audioContext || !this.audioBuffer) return;
    
    try {
      // Stop previous source if exists
      if (this.audioSource) {
        try {
          this.audioSource.stop();
        } catch (e) {
          // Ignore errors from stopping
        }
      }
      
      // Create a new source
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = this.audioBuffer;
      this.audioSource.loop = true;
      
      // Connect to output
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.7;
      this.audioSource.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Start playing
      this.audioSource.start();
    } catch (err) {
      console.error('AudioContext play failed:', err);
    }
  }

  public stop() {
    try {
      // Stop HTML5 Audio
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      
      // Stop AudioContext source
      if (this.audioSource) {
        try {
          this.audioSource.stop();
        } catch (e) {
          // Ignore errors from stopping
        }
        this.audioSource = null;
      }
      
      this.isPlaying = false;
      console.log('Alert sound stopped');
    } catch (err) {
      console.error('Error stopping audio alert:', err);
    }
  }

  public unlockAudio() {
    // Try to play a silent sound to unlock audio playback
    try {
      if (this.audio) {
        const originalVolume = this.audio.volume;
        this.audio.volume = 0.001;
        
        const unlockPromise = this.audio.play();
        if (unlockPromise !== undefined) {
          unlockPromise
            .then(() => {
              console.log('Audio playback unlocked');
              this.audio?.pause();
              if (this.audio) {
                this.audio.currentTime = 0;
                this.audio.volume = originalVolume;
              }
            })
            .catch(() => {
              // Restore volume even on failure
              if (this.audio) this.audio.volume = originalVolume;
            });
        }
      }
      
      // Also try to unlock AudioContext
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    } catch (err) {
      console.error('Error unlocking audio:', err);
    }
  }
  
  // This should be called on user interaction
  public setupUnlockEvents() {
    const unlockEvents = ['click', 'touchstart', 'keydown'];
    
    const unlockHandler = () => {
      this.unlockAudio();
      
      // Remove all event listeners after first interaction
      unlockEvents.forEach(event => {
        document.removeEventListener(event, unlockHandler);
      });
    };
    
    // Add event listeners
    unlockEvents.forEach(event => {
      document.addEventListener(event, unlockHandler, { once: true });
    });
  }
}

// Create a singleton instance
let audioAlertInstance: AudioAlert | null = null;

export const getAudioAlert = (audioUrl?: string): AudioAlert => {
  if (!audioAlertInstance) {
    audioAlertInstance = new AudioAlert(audioUrl);
    audioAlertInstance.setupUnlockEvents();
  } else if (audioUrl && audioUrl !== audioAlertInstance.audioUrl) {
    // If URL changed, create new instance
    audioAlertInstance = new AudioAlert(audioUrl);
    audioAlertInstance.setupUnlockEvents();
  }
  
  return audioAlertInstance;
};
