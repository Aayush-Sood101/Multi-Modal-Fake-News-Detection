from fastapi import APIRouter
from app.api.v1.endpoints import text, audio, video, analysis, complete

api_router = APIRouter()

api_router.include_router(text.router, prefix="/text", tags=["text"])
api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
api_router.include_router(video.router, prefix="/video", tags=["video"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(complete.router, prefix="/complete", tags=["complete"])
