
export interface Surah {
  id: number;
  name: string;
  transliteration: string;
  english: string;
  verseCount: number;
  startPage: number;
  endPage: number;
}

export interface Verse {
  id: number; // Verse number within Surah
  surahId: number;
  text: string; // Arabic text
  translation: string;
  page: number; // Mushaf page number
  juz: number;
}

export interface UserProgress {
  dailyStreak: number;
  versesMemorized: number;
  totalRecitationTime: number; // in minutes
  accuracy: number; // percentage
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  TAJWEED_PRACTICE = 'TAJWEED_PRACTICE', // Quran visible, focus on rules
  RECITATION_TEST = 'RECITATION_TEST', // Quran hidden/toggle, focus on memory
  MEMORIZATION = 'MEMORIZATION', // Legacy/Flashcard mode
  SETTINGS = 'SETTINGS'
}

export interface AudioVisualizerProps {
  isRecording: boolean;
  frequencyData: Uint8Array | null;
}
