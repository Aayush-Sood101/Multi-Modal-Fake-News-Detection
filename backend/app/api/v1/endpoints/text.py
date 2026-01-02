from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Dict, Any
from datetime import datetime
import uuid

from app.services.file_handler import (
    validate_file,
    save_upload_file,
    ALLOWED_TEXT_EXTENSIONS,
    MAX_TEXT_SIZE,
)
from app.services.text_processor import analyze_text_file
from app.schemas.analysis import (
    AnalysisResponse,
    AnalysisStatus,
    FileType,
    TextAnalysisResult,
)

router = APIRouter()

# In-memory storage for demo (will be replaced with database)
analysis_store: Dict[str, Dict[str, Any]] = {}


async def process_text_analysis(file_id: str, file_path: str):
    """Background task to process text analysis"""
    try:
        # Perform analysis with ML
        result = await analyze_text_file(file_path, use_ml=True)
        
        # Calculate fake news score
        # Prioritize ML prediction if available, otherwise use rule-based
        if result.get('ml_prediction'):
            ml_pred = result['ml_prediction']
            # Convert fake probability to credibility score (inverse)
            fake_prob = ml_pred.get('fake_probability', 0.5)
            score = (1 - fake_prob) * 100  # 0% fake = 100% credible
            confidence = ml_pred.get('confidence', 0.5)
        else:
            # Fallback to rule-based scoring
            manipulation_count = len(result['manipulation_indicators'])
            base_score = 100 - (manipulation_count * 15)
            score = max(10, min(100, base_score))
            confidence = 0.6
        
        # Store result
        analysis_store[file_id] = {
            'status': AnalysisStatus.COMPLETED,
            'completed_at': datetime.now(),
            'credibility_score': score,
            'confidence': confidence,
            'result_data': result,
        }
    except Exception as e:
        analysis_store[file_id] = {
            'status': AnalysisStatus.FAILED,
            'completed_at': datetime.now(),
            'error': str(e),
        }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
) -> AnalysisResponse:
    """
    Analyze text content for fake news detection
    """
    # Validate file
    await validate_file(file, ALLOWED_TEXT_EXTENSIONS, MAX_TEXT_SIZE)
    
    # Save file
    file_id, file_path, file_size = await save_upload_file(file, "text")
    
    # Store initial analysis record
    analysis_store[file_id] = {
        'status': AnalysisStatus.PROCESSING,
        'uploaded_at': datetime.now(),
    }
    
    # Trigger background analysis
    background_tasks.add_task(process_text_analysis, file_id, file_path)
    
    # Return immediate response
    return AnalysisResponse(
        id=file_id,
        filename=file.filename or "unknown",
        file_type=FileType.TEXT,
        file_size=file_size,
        status=AnalysisStatus.PROCESSING,
        uploaded_at=datetime.now(),
    )


@router.get("/result/{analysis_id}", response_model=AnalysisResponse)
async def get_text_result(analysis_id: str) -> AnalysisResponse:
    """Get text analysis result"""
    if analysis_id not in analysis_store:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    stored = analysis_store[analysis_id]
    return AnalysisResponse(
        id=analysis_id,
        filename="",  # Would come from DB
        file_type=FileType.TEXT,
        file_size=0,  # Would come from DB
        status=stored['status'],
        uploaded_at=stored.get('uploaded_at', datetime.now()),
        completed_at=stored.get('completed_at'),
        credibility_score=stored.get('credibility_score'),
        confidence=stored.get('confidence'),
        result_data=stored.get('result_data'),
    )


@router.get("/health")
async def text_health():
    return {"status": "healthy", "service": "text-analysis"}
