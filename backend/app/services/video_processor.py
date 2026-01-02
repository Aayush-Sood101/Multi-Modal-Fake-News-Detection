import subprocess
import json
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

# Lazy load ML models
_video_deepfake_detector = None


def convert_numpy_types(obj: Any) -> Any:
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    return obj


def get_video_deepfake_detector():
    """Lazy load video deepfake detector"""
    global _video_deepfake_detector
    if _video_deepfake_detector is None:
        try:
            from app.ml.video_model import get_video_deepfake_detector
            _video_deepfake_detector = get_video_deepfake_detector()
        except Exception as e:
            print(f"Warning: Could not load video deepfake detector: {e}")
            _video_deepfake_detector = False
    return _video_deepfake_detector if _video_deepfake_detector is not False else None


class VideoProcessor:
    """Process video files for analysis"""
    
    @staticmethod
    def get_video_info(file_path: str) -> Dict[str, Any]:
        """Get basic video file information"""
        try:
            # Use ffprobe to get video info
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                file_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                video_stream = next(
                    (s for s in data.get('streams', []) if s['codec_type'] == 'video'),
                    None
                )
                
                if video_stream:
                    return {
                        'duration': float(data['format'].get('duration', 0)),
                        'bit_rate': int(data['format'].get('bit_rate', 0)),
                        'width': int(video_stream.get('width', 0)),
                        'height': int(video_stream.get('height', 0)),
                        'fps': eval(video_stream.get('r_frame_rate', '0/1')),
                        'codec': video_stream.get('codec_name', 'unknown'),
                        'format': data['format'].get('format_name', 'unknown'),
                    }
        except Exception as e:
            print(f"Error getting video info with ffprobe: {e}")
        
        # Fallback to OpenCV
        try:
            cap = cv2.VideoCapture(file_path)
            
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 0
            
            cap.release()
            
            return {
                'duration': duration,
                'width': width,
                'height': height,
                'fps': fps,
                'frame_count': frame_count,
                'codec': 'unknown',
                'format': 'unknown',
            }
        except Exception as e:
            raise Exception(f"Error loading video file: {str(e)}")
    
    @staticmethod
    def extract_frames(
        file_path: str,
        num_frames: int = 10,
        method: str = 'uniform'
    ) -> List[np.ndarray]:
        """
        Extract frames from video
        
        Args:
            file_path: Path to video file
            num_frames: Number of frames to extract
            method: 'uniform' for evenly spaced, 'keyframes' for key frames
        
        Returns:
            List of frame arrays
        """
        cap = cv2.VideoCapture(file_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        frames = []
        
        if method == 'uniform':
            # Extract evenly spaced frames
            frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
            
            for idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
        else:
            # Extract first N frames (simple approach)
            for i in range(min(num_frames, total_frames)):
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
                else:
                    break
        
        cap.release()
        return frames
    
    @staticmethod
    def detect_faces(frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in a frame using Haar Cascade
        
        Returns:
            List of (x, y, width, height) tuples for each face
        """
        # Load Haar Cascade classifier
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        return [(int(x), int(y), int(w), int(h)) for x, y, w, h in faces]
    
    @staticmethod
    def analyze_frame_quality(frame: np.ndarray) -> Dict[str, float]:
        """Analyze quality metrics of a single frame"""
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Sharpness (Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Brightness (mean pixel value)
        brightness = np.mean(gray)
        
        # Contrast (standard deviation)
        contrast = np.std(gray)
        
        # Noise estimate (using high-frequency components)
        noise = np.std(gray - cv2.GaussianBlur(gray, (5, 5), 0))
        
        return {
            'sharpness': float(laplacian_var),
            'brightness': float(brightness),
            'contrast': float(contrast),
            'noise': float(noise),
        }
    
    @staticmethod
    def detect_scene_changes(file_path: str, threshold: float = 30.0) -> List[int]:
        """
        Detect scene changes in video
        
        Returns:
            List of frame indices where scene changes occur
        """
        cap = cv2.VideoCapture(file_path)
        scene_changes = []
        
        ret, prev_frame = cap.read()
        if not ret:
            cap.release()
            return scene_changes
        
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        frame_idx = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_idx += 1
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate difference
            diff = cv2.absdiff(gray, prev_gray)
            mean_diff = np.mean(diff)
            
            if mean_diff > threshold:
                scene_changes.append(frame_idx)
            
            prev_gray = gray
            
            # Limit to prevent long processing
            if frame_idx > 500:
                break
        
        cap.release()
        return scene_changes
    
    @staticmethod
    def generate_thumbnail(file_path: str, output_path: str, time_sec: float = 1.0) -> str:
        """Generate thumbnail image from video"""
        cap = cv2.VideoCapture(file_path)
        
        # Set position to specified time
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_num = int(time_sec * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        
        ret, frame = cap.read()
        if ret:
            # Resize to thumbnail size
            height, width = frame.shape[:2]
            aspect_ratio = width / height
            new_width = 320
            new_height = int(new_width / aspect_ratio)
            
            thumbnail = cv2.resize(frame, (new_width, new_height))
            cv2.imwrite(output_path, thumbnail)
            cap.release()
            return output_path
        
        cap.release()
        raise Exception("Could not generate thumbnail")


async def analyze_video_file(file_path: str, use_ml: bool = True) -> Dict[str, Any]:
    """
    Perform complete video analysis
    
    Args:
        file_path: Path to video file
        use_ml: Whether to use ML models for deepfake detection
    
    Returns dict with:
        - video_info: basic file information
        - frames_analyzed: number of frames processed
        - faces_detected: total number of faces found
        - face_frames: frames with face detections
        - scene_changes: detected scene change indices
        - quality_metrics: average quality metrics
        - deepfake_detection: ML-based deepfake analysis
        - temporal_analysis: Frame-to-frame consistency
    """
    try:
        # Get basic info
        video_info = VideoProcessor.get_video_info(file_path)
        
        # Extract frames
        frames = VideoProcessor.extract_frames(file_path, num_frames=10)
        
        # Analyze each frame
        total_faces = 0
        face_frames = []
        quality_metrics_list = []
        
        for idx, frame in enumerate(frames):
            # Detect faces
            faces = VideoProcessor.detect_faces(frame)
            if len(faces) > 0:
                total_faces += len(faces)
                face_frames.append({
                    'frame_index': idx,
                    'face_count': len(faces),
                    'face_locations': faces,
                })
            
            # Analyze quality
            quality = VideoProcessor.analyze_frame_quality(frame)
            quality_metrics_list.append(quality)
        
        # Calculate average quality
        avg_quality = {
            'sharpness': np.mean([q['sharpness'] for q in quality_metrics_list]),
            'brightness': np.mean([q['brightness'] for q in quality_metrics_list]),
            'contrast': np.mean([q['contrast'] for q in quality_metrics_list]),
            'noise': np.mean([q['noise'] for q in quality_metrics_list]),
        }
        
        # Detect scene changes (limit processing time)
        scene_changes = VideoProcessor.detect_scene_changes(file_path)
        
        result = {
            'video_info': video_info,
            'frames_analyzed': len(frames),
            'faces_detected': total_faces,
            'face_frames': face_frames,
            'scene_changes': scene_changes[:20],  # Limit to first 20
            'scene_change_count': len(scene_changes),
            'quality_metrics': {k: float(v) for k, v in avg_quality.items()},
        }
        
        # Add ML-based deepfake detection
        if use_ml:
            detector = get_video_deepfake_detector()
            if detector:
                try:
                    # Run deepfake detection
                    deepfake_analysis = detector.detect_from_frames(
                        frames, face_frames, avg_quality
                    )
                    result['deepfake_detection'] = deepfake_analysis
                    
                    # Temporal consistency analysis
                    temporal_analysis = detector.analyze_temporal_consistency(frames)
                    result['temporal_analysis'] = temporal_analysis
                except Exception as e:
                    print(f"Error in deepfake detection: {e}")
                    result['deepfake_detection'] = None
                    result['temporal_analysis'] = None
            else:
                result['deepfake_detection'] = None
                result['temporal_analysis'] = None
        
        # Convert numpy types to native Python types for JSON serialization
        return convert_numpy_types(result)
    except Exception as e:
        raise Exception(f"Video analysis failed: {str(e)}")
