export interface DocFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  pageCount?: number; // Estimated after conversion
  hasAddedBlankPage?: boolean;
}

export interface ProcessingState {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  PREVIEW = 'PREVIEW',
}