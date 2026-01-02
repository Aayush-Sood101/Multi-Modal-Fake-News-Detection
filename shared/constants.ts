export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_VERSION = '/api/v1';

export const ENDPOINTS = {
  TEXT_ANALYZE: `${API_VERSION}/text/analyze`,
  AUDIO_ANALYZE: `${API_VERSION}/audio/analyze`,
  VIDEO_ANALYZE: `${API_VERSION}/video/analyze`,
  COMPLETE_ANALYSIS: `${API_VERSION}/analysis/complete`,
};

export const MAX_FILE_SIZE = {
  TEXT: 10 * 1024 * 1024, // 10MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  VIDEO: 100 * 1024 * 1024, // 100MB
};

export const SUPPORTED_FORMATS = {
  TEXT: ['.txt', '.pdf', '.docx'],
  AUDIO: ['.mp3', '.wav', '.m4a', '.ogg'],
  VIDEO: ['.mp4', '.avi', '.mov', '.webm'],
};
