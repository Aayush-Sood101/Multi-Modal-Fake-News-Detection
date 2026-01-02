import axios, { AxiosProgressEvent } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export interface AnalysisResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  filename: string;
  fileType: string;
  uploadedAt: string;
}

export const uploadFile = async (
  file: File,
  endpoint: 'text' | 'audio' | 'video',
  onProgress?: (progress: UploadProgress) => void
): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/api/v1/${endpoint}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({
          progress,
          loaded: progressEvent.loaded,
          total: progressEvent.total,
        });
      }
    },
  });

  return response.data;
};

export const getAnalysisResult = async (analysisId: string, fileType: 'text' | 'audio' | 'video') => {
  try {
    const url = `${API_BASE_URL}/api/v1/${fileType}/result/${analysisId}`;
    console.log('Fetching from:', url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        throw new Error(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // Request made but no response received
        throw new Error('Network Error: Cannot reach the backend server. Make sure it\'s running on http://localhost:8000');
      }
    }
    throw error;
  }
};
