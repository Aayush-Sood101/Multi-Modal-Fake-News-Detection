from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class FileType(str, Enum):
    TEXT = "text"
    AUDIO = "audio"
    VIDEO = "video"


class AnalysisBase(BaseModel):
    filename: str
    file_type: FileType
    file_size: int


class AnalysisCreate(AnalysisBase):
    pass


class AnalysisResponse(AnalysisBase):
    id: str
    status: AnalysisStatus
    uploaded_at: datetime
    completed_at: Optional[datetime] = None
    credibility_score: Optional[float] = None
    confidence: Optional[float] = None
    result_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class TextAnalysisResult(BaseModel):
    score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    claims: List[str] = []
    sentiment: str
    manipulation_indicators: List[str] = []
    entities: List[Dict[str, str]] = []


class AudioAnalysisResult(BaseModel):
    score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    authenticity: float = Field(..., ge=0, le=1)
    transcription: str
    suspicious_segments: List[Dict[str, Any]] = []
    speaker_count: Optional[int] = None


class VideoAnalysisResult(BaseModel):
    score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    video_info: Dict[str, Any] = {}
    frames_analyzed: int = 0
    faces_detected: int = 0
    face_frames: List[Dict[str, Any]] = []
    scene_changes: List[int] = []
    quality_metrics: Dict[str, float] = {}
    manipulation_indicators: List[str] = []
    metadata: Dict[str, Any] = {}


class CompleteAnalysisResult(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    overall_confidence: float = Field(..., ge=0, le=1)
    text_result: Optional[TextAnalysisResult] = None
    audio_result: Optional[AudioAnalysisResult] = None
    video_result: Optional[VideoAnalysisResult] = None
