from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Dict, Any
from datetime import datetime
import uuid

from app.services.file_handler import (
    validate_file,
    save_upload_file,
    ALLOWED_VIDEO_EXTENSIONS,
    MAX_VIDEO_SIZE,
)
from app.schemas.analysis import AnalysisResponse, AnalysisStatus, FileType, VideoAnalysisResult
from app.services import video_processor

router = APIRouter()

# In-memory storage for analysis results (replace with database in production)
analysis_store = {}


async def process_video_analysis(analysis_id: str, file_path: str, file_name: str):
    """Background task to process video analysis"""
    try:
        # Analyze video
        analysis_data = await video_processor.analyze_video_file(file_path)
        
        # Calculate authenticity score based on various factors
        score = 100.0
        confidence = 0.7
        
        # Reduce score based on suspicious indicators
        video_info = analysis_data['video_info']
        quality = analysis_data['quality_metrics']
        
        # Check for very low quality (might indicate manipulation)
        if quality['sharpness'] < 50:
            score -= 10
            confidence += 0.05
        
        # Check for excessive scene changes (might indicate splicing)
        scene_change_rate = analysis_data['scene_change_count'] / max(video_info.get('duration', 1), 1)
        if scene_change_rate > 5:  # More than 5 scene changes per second
            score -= 15
            confidence += 0.1
        
        # Check for resolution mismatches or odd dimensions
        width = video_info.get('width', 0)
        height = video_info.get('height', 0)
        if width < 640 or height < 480:
            score -= 5
        
        score = max(0, min(100, score))
        confidence = min(0.95, confidence)
        
        # Build manipulation indicators list
        manipulation_indicators = []
        if quality['sharpness'] < 50:
            manipulation_indicators.append("Low video quality detected")
        if scene_change_rate > 5:
            manipulation_indicators.append("High scene change rate")
        if width < 640 or height < 480:
            manipulation_indicators.append("Low resolution video")
        
        # Store result
        result = VideoAnalysisResult(
            score=score,
            confidence=confidence,
            video_info=video_info,
            frames_analyzed=analysis_data['frames_analyzed'],
            faces_detected=analysis_data['faces_detected'],
            face_frames=analysis_data['face_frames'],
            scene_changes=analysis_data['scene_changes'],
            quality_metrics=analysis_data['quality_metrics'],
            manipulation_indicators=manipulation_indicators,
            metadata={
                'scene_change_rate': scene_change_rate,
                'avg_faces_per_frame': analysis_data['faces_detected'] / max(analysis_data['frames_analyzed'], 1),
            }
        )
        
        analysis_store[analysis_id] = {
            'status': AnalysisStatus.COMPLETED,
            'result': result,
            'file_name': file_name,
        }
    except Exception as e:
        analysis_store[analysis_id] = {
            'status': AnalysisStatus.FAILED,
            'error': str(e),
            'file_name': file_name,
        }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
) -> AnalysisResponse:
    """
    Analyze video content for deepfake detection
    """
    # Validate file
    await validate_file(file, ALLOWED_VIDEO_EXTENSIONS, MAX_VIDEO_SIZE)
    
    # Save file
    file_id, file_path, file_size = await save_upload_file(file, "video")
    
    # Store initial status
    analysis_store[file_id] = {
        'status': AnalysisStatus.PROCESSING,
        'file_name': file.filename,
    }
    
    # Process in background
    if background_tasks:
        background_tasks.add_task(process_video_analysis, file_id, file_path, file.filename)
    
    # Create analysis record
    analysis = AnalysisResponse(
        id=file_id,
        filename=file.filename or "unknown",
        file_type=FileType.VIDEO,
        file_size=file_size,
        status=AnalysisStatus.PROCESSING,
        uploaded_at=datetime.now(),
    )
    
    return analysis


@router.get("/result/{analysis_id}", response_model=AnalysisResponse)
async def get_video_result(analysis_id: str):
    """Get video analysis result"""
    if analysis_id not in analysis_store:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    stored = analysis_store[analysis_id]
    
    return AnalysisResponse(
        id=analysis_id,
        filename=stored['file_name'],
        file_type=FileType.VIDEO,
        file_size=0,  # Not stored in this version
        status=stored['status'],
        uploaded_at=datetime.now(),
        result=stored.get('result'),
    )


@router.get("/health")
async def video_health():
    return {"status": "healthy", "service": "video-analysis"}
