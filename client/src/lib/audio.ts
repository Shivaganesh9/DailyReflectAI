export interface AudioRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  constructor(private options: AudioRecorderOptions = {}) {
    this.options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000,
      sampleRate: 44100,
      ...options,
    };
  }

  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.options.mimeType,
        audioBitsPerSecond: this.options.audioBitsPerSecond,
      });

      this.setupEventListeners();
    } catch (error) {
      throw new Error(`Failed to initialize audio recorder: ${error.message}`);
    }
  }

  private setupEventListeners(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
    };
  }

  async startRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      await this.initialize();
    }

    if (this.mediaRecorder?.state === 'inactive') {
      this.audioChunks = [];
      this.mediaRecorder.start(100); // Collect data every 100ms
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recording not started'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: this.options.mimeType,
        });
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  pauseRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  getRecordingState(): string {
    return this.mediaRecorder?.state || 'inactive';
  }

  cleanup(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.audioChunks = [];
  }

  static async isSupported(): Promise<boolean> {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }

  static getSupportedMimeTypes(): string[] {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
    ];

    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }
}

export async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export async function downloadAudio(blob: Blob, filename: string = 'recording.webm'): Promise<void> {
  const url = createAudioUrl(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  revokeAudioUrl(url);
}

// Utility function to format recording duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Audio analysis utilities
export async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = createAudioUrl(blob);
    
    audio.addEventListener('loadedmetadata', () => {
      revokeAudioUrl(url);
      resolve(audio.duration);
    });
    
    audio.addEventListener('error', () => {
      revokeAudioUrl(url);
      reject(new Error('Failed to load audio metadata'));
    });
    
    audio.src = url;
  });
}

export async function getAudioSize(blob: Blob): Promise<{ size: number; formattedSize: string }> {
  const size = blob.size;
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let formattedSize = size;
  
  while (formattedSize >= 1024 && unitIndex < units.length - 1) {
    formattedSize /= 1024;
    unitIndex++;
  }
  
  return {
    size,
    formattedSize: `${formattedSize.toFixed(1)} ${units[unitIndex]}`,
  };
}
