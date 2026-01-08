
export interface TranscriptSegment {
  speaker: string;
  timestamp: string;
  text: string;
}

export interface TranscriptionData {
  segments?: TranscriptSegment[];
  summary?: string;
  translatedText?: string;
  cleanedText?: string;
  originalText?: string;
}

export interface ProcessingOptions {
  summarize: boolean;
  translate: boolean;
  targetLanguage: string;
  cleanText: boolean;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
