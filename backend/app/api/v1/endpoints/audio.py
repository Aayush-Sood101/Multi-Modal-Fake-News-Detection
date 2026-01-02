from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Dict, Any
from datetime import datetime
import uuid

from app.services.file_handler import (
    validate_file,
    save_upload_file,
    ALLOWED_AUDIO_EXTENSIONS,
    MAX_AUDIO_SIZE,
)
from app.services.audio_processor import analyze_audio_file
from app.schemas.analysis import (
    AnalysisResponse,
    AnalysisStatus,
    FileType,
)

router = APIRouter()

# In-memory storage for demo (will be replaced with database)
analysis_store: Dict[str, Dict[str, Any]] = {}


async def process_audio_analysis(file_id: str, file_path: str):
    """Background task to process audio analysis"""
    try:
        # Perform analysis
        result = await analyze_audio_file(file_path)
        
        # Calculate authenticity score based on quality metrics
        quality = result['quality']
        
        # Simple scoring based on audio quality indicators
        # Lower clipping and higher SNR = more authentic
        base_score = 100
        if quality.get('has_significant_clipping'):
            base_score -= 20
        
        snr = quality.get('snr_db', 0)
        if snr < 10:
            base_score -= 15
        elif snr < 20:
            base_score -= 5
        
        score = max(10, min(100, base_score))
        
        # Store result
        analysis_store[file_id] = {
            'status': AnalysisStatus.COMPLETED,
            'completed_at': datetime.now(),
            'credibility_score': score,
            'confidence': 0.70,
            'result_data': result,
        }
    except Exception as e:
        analysis_store[file_id] = {
            'status': AnalysisStatus.FAILED,
            'completed_at': datetime.now(),
            'error': str(e),
        }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
) -> AnalysisResponse:
    """
    Analyze audio content for deepfake detection
    """
    # Validate file
    await validate_file(file, ALLOWED_AUDIO_EXTENSIONS, MAX_AUDIO_SIZE)
    
    # Save file
    file_id, file_path, file_size = await save_upload_file(file, "audio")
    
    # Store initial analysis record
    analysis_store[file_id] = {
        'status': AnalysisStatus.PROCESSING,
        'uploaded_at': datetime.now(),
    }
    
    # Trigger background analysis
    background_tasks.add_task(process_audio_analysis, file_id, file_path)
    
    # Return immediate response
    return AnalysisResponse(
        id=file_id,
        filename=file.filename or "unknown",
        file_type=FileType.AUDIO,
        file_size=file_size,
        status=AnalysisStatus.PROCESSING,
        uploaded_at=datetime.now(),
    )


@router.get("/result/{analysis_id}", response_model=AnalysisResponse)
async def get_audio_result(analysis_id: str) -> AnalysisResponse:
    """Get audio analysis result"""
    if analysis_id not in analysis_store:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    stored = analysis_store[analysis_id]
    return AnalysisResponse(
        id=analysis_id,
        filename="",
        file_type=FileType.AUDIO,
        file_size=0,
        status=stored['status'],
        uploaded_at=stored.get('uploaded_at', datetime.now()),
        completed_at=stored.get('completed_at'),
        credibility_score=stored.get('credibility_score'),
        confidence=stored.get('confidence'),
        result_data=stored.get('result_data'),
    )


@router.get("/health")
async def audio_health():
    return {"status": "healthy", "service": "audio-analysis"}
