export interface AnalysisResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  credibilityScore: number;
  confidence: number;
  timestamp: string;
  modalities: {
    text?: TextAnalysis;
    audio?: AudioAnalysis;
    video?: VideoAnalysis;
  };
}

export interface TextAnalysis {
  score: number;
  confidence: number;
  claims: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  manipulation_indicators: string[];
}

export interface AudioAnalysis {
  score: number;
  confidence: number;
  authenticity: number;
  transcription: string;
  suspicious_segments: TimeSegment[];
}

export interface VideoAnalysis {
  score: number;
  confidence: number;
  authenticity: number;
  suspicious_frames: number[];
  deepfake_indicators: string[];
}

export interface TimeSegment {
  start: number;
  end: number;
  score: number;
}
