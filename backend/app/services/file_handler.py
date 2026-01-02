import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Tuple
from app.core.config import settings


ALLOWED_TEXT_EXTENSIONS = {'.txt', '.pdf', '.docx', '.doc'}
ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg', '.flac'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.webm', '.mkv'}

MAX_TEXT_SIZE = 10 * 1024 * 1024  # 10MB
MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB


async def validate_file(
    file: UploadFile,
    allowed_extensions: set,
    max_size: int
) -> None:
    """Validate file extension and size"""
    # Check file extension
    file_ext = Path(file.filename or '').suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Check file size by reading the file
    content = await file.read()
    file_size = len(content)
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size {file_size} exceeds maximum allowed size of {max_size} bytes"
        )
    
    # Reset file pointer
    await file.seek(0)


async def save_upload_file(file: UploadFile, file_type: str) -> Tuple[str, str, int]:
    """
    Save uploaded file to disk
    
    Returns:
        Tuple of (file_id, file_path, file_size)
    """
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR) / file_type
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_ext = Path(file.filename or '').suffix
    filename = f"{file_id}{file_ext}"
    file_path = upload_dir / filename
    
    # Save file
    content = await file.read()
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    return file_id, str(file_path), len(content)


def get_file_type_from_extension(filename: str) -> str:
    """Determine file type from extension"""
    ext = Path(filename).suffix.lower()
    
    if ext in ALLOWED_TEXT_EXTENSIONS:
        return 'text'
    elif ext in ALLOWED_AUDIO_EXTENSIONS:
        return 'audio'
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return 'video'
    else:
        return 'unknown'
