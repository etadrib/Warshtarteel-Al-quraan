export interface Surah {
  id: number;
  name: string;
  transliteration: string;
  english: string;
  verses: Verse[];
}

export interface Verse {
  id: number;
  text: string; // Arabic text
  translation: string;
  page: number; // Mushaf page number
}

export interface UserProgress {
  dailyStreak: number;
  versesMemorized: number;
  totalRecitationTime: number; // in minutes
  accuracy: number; // percentage
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  RECITATION = 'RECITATION',
  MEMORIZATION = 'MEMORIZATION',
  SETTINGS = 'SETTINGS'
}

export interface AudioVisualizerProps {
  isRecording: boolean;
  frequencyData: Uint8Array | null;
}
