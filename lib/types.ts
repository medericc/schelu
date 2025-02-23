export interface VideoSegment {
    id: string;
    startTime: number;
    endTime: number;
    file: File;
  }
  
  export interface Sticker {
    id: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    startTime: number;
    endTime: number;
  }
  
  export type AspectRatio = '16:9' | '9:16' | '1:1';