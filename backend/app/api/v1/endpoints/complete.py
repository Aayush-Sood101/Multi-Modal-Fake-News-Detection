"""Complete multi-modal analysis endpoint"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from app.ml.fusion_engine import get_fusion_engine, FusionStrategy
from app.schemas.analysis import AnalysisResponse, AnalysisStatus, CompleteAnalysisResult

router = APIRouter()


@router.post("/analyze-complete")
async def analyze_complete(
    text_analysis_id: Optional[str] = None,
    audio_analysis_id: Optional[str] = None,
    video_analysis_id: Optional[str] = None,
    fusion_strategy: str = "weighted_average"
) -> Dict[str, Any]:
    """
    Combine results from text, audio, and video analysis
    using multi-modal fusion
    
    Args:
        text_analysis_id: ID of completed text analysis
        audio_analysis_id: ID of completed audio analysis
        video_analysis_id: ID of completed video analysis
        fusion_strategy: Strategy for fusion (weighted_average, maximum, minimum, voting)
    
    Returns:
        Combined analysis with final verdict
    """
    # Import analysis stores from endpoints
    from app.api.v1.endpoints import text, audio, video
    
    # Collect results from each modality
    text_result = None
    audio_result = None
    video_result = None
    
    if text_analysis_id:
        if text_analysis_id in text.analysis_store:
            stored = text.analysis_store[text_analysis_id]
            if stored['status'] == AnalysisStatus.COMPLETED:
                text_result = stored.get('result_data')
    
    if audio_analysis_id:
        if audio_analysis_id in audio.analysis_store:
            stored = audio.analysis_store[audio_analysis_id]
            if stored['status'] == AnalysisStatus.COMPLETED:
                # Audio results are structured differently
                text_result = {
                    'quality': stored.get('quality', {}),
                    'deepfake_detection': stored.get('deepfake_detection', {}),
                }
    
    if video_analysis_id:
        if video_analysis_id in video.analysis_store:
            stored = video.analysis_store[video_analysis_id]
            if stored['status'] == AnalysisStatus.COMPLETED:
                video_result = stored.get('result', {})
    
    # Validate at least one result available
    if not any([text_result, audio_result, video_result]):
        raise HTTPException(
            status_code=400,
            detail="No completed analyses found for provided IDs"
        )
    
    # Get fusion engine
    try:
        strategy_enum = FusionStrategy(fusion_strategy)
    except ValueError:
        strategy_enum = FusionStrategy.WEIGHTED_AVERAGE
    
    fusion_engine = get_fusion_engine(strategy=strategy_enum)
    
    # Fuse results
    fused_result = fusion_engine.fuse(
        text_result=text_result,
        audio_result=audio_result,
        video_result=video_result
    )
    
    return fused_result


@router.get("/fusion-strategies")
async def get_fusion_strategies():
    """Get available fusion strategies"""
    return {
        'strategies': [
            {
                'name': 'weighted_average',
                'description': 'Weighted average of all modalities (recommended)',
                'default': True
            },
            {
                'name': 'maximum',
                'description': 'Most optimistic score (highest credibility)',
                'default': False
            },
            {
                'name': 'minimum',
                'description': 'Most pessimistic score (lowest credibility)',
                'default': False
            },
            {
                'name': 'voting',
                'description': 'Majority voting across modalities',
                'default': False
            },
        ]
    }


@router.get("/health")
async def complete_health():
    """Health check for complete analysis endpoint"""
    return {
        "status": "healthy",
        "service": "complete-analysis",
        "fusion_engine": "ready"
    }
