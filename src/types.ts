import { TLShape } from 'tldraw';

export interface EditorData {
  shapes: TLShape[];
  dimensions: {
    width: number;
    height: number;
  };
  lastUpdated: Date;
}

export type WindowState = {
  isFullScreen: boolean;
  isMinimized: boolean;
  coordinates: { x: number; y: number };
  savedCoordinates: { x: number; y: number } | null;
};

export type EditorState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: EditorData }
  | { status: 'error'; error: string };