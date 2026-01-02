import torch
import torch.nn as nn
import cv2
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')


class VideoDeepfakeDetector:
    """
    Video deepfake detection using computer vision techniques
    
    In production, this would use models like:
    - XceptionNet fine-tuned on FaceForensics++
    - EfficientNet-B4 for face manipulation detection
    - MesoNet for deepfake detection
    - Capsule Networks for face forgery detection
    
    For now, uses heuristic-based detection on extracted frames
    """
    
    def __init__(self, device: Optional[str] = None):
        """Initialize video deepfake detector"""
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        print(f"Video deepfake detector initialized on: {self.device}")
        
        # Load face detection cascade
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        # Load eye cascade for additional verification
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
    
    def detect_from_frames(
        self,
        frames: List[np.ndarray],
        face_data: List[Dict[str, Any]],
        quality_metrics: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Detect deepfakes from extracted frames and metadata
        
        Args:
            frames: List of video frames
            face_data: Face detection data per frame
            quality_metrics: Video quality metrics
        
        Returns:
            Dict with:
                - is_deepfake: Boolean prediction
                - confidence: Confidence score (0-1)
                - authenticity_score: Score 0-100
                - indicators: List of suspicious indicators
                - frame_scores: Per-frame analysis
        """
        indicators = []
        suspicion_score = 0.0
        frame_scores = []
        
        # Enhanced face consistency analysis
        face_counts = [len(f.get('face_locations', [])) for f in face_data]
        if face_counts:
            face_variance = np.std(face_counts)
            avg_faces = np.mean(face_counts)
            
            # More sophisticated inconsistency detection
            if face_variance > 2.0:
                indicators.append("Severe face detection inconsistency")
                suspicion_score += 0.20
            elif face_variance > 1.5:
                indicators.append("Inconsistent face detection across frames")
                suspicion_score += 0.12
            
            # Check for impossible face counts
            if avg_faces > 5:
                indicators.append("Unusually high face count")
                suspicion_score += 0.10
        
        # Enhanced face size analysis
        face_sizes = []
        face_aspect_ratios = []
        for frame_data in face_data:
            for face in frame_data.get('face_locations', []):
                w, h = face[2], face[3]
                face_sizes.append(w * h)
                if h > 0:
                    face_aspect_ratios.append(w / h)
        
        if face_sizes:
            size_variance = np.std(face_sizes) / (np.mean(face_sizes) + 1e-6)
            if size_variance > 0.7:  # High variance indicates manipulation
                indicators.append("Severe face size variations")
                suspicion_score += 0.18
            elif size_variance > 0.5:
                indicators.append("Unusual face size variations")
                suspicion_score += 0.12
        
        # Check face aspect ratios for unnatural distortions
        if face_aspect_ratios:
            mean_ratio = np.mean(face_aspect_ratios)
            # Natural face ratio is around 0.7-0.9
            if mean_ratio < 0.5 or mean_ratio > 1.2:
                indicators.append("Unnatural face aspect ratio")
                suspicion_score += 0.15
        
        # Analyze frames for manipulation artifacts
        for idx, frame in enumerate(frames):
            frame_analysis = self._analyze_single_frame(frame, idx, face_data)
            frame_scores.append(frame_analysis)
            
            if frame_analysis['suspicious']:
                suspicion_score += 0.05  # Small increment per suspicious frame
        
        # Enhanced quality metrics analysis
        if quality_metrics.get('sharpness', 0) < 25:
            indicators.append("Poor video sharpness (possible processing)")
            suspicion_score += 0.12
        
        if quality_metrics.get('contrast', 0) < 15:
            indicators.append("Low contrast (possible manipulation)")
            suspicion_score += 0.10
        
        # Check for compression artifacts that might hide deepfake traces
        if quality_metrics.get('compression_artifacts', 0) > 0.7:
            indicators.append("High compression artifacts")
            suspicion_score += 0.08
        
        # Check for edge blending artifacts (common in face swaps)
        edge_inconsistency = quality_metrics.get('edge_inconsistency', 0)
        if edge_inconsistency > 0.6:
            indicators.append("Edge blending artifacts detected")
            suspicion_score += 0.20
        elif edge_inconsistency > 0.4:
            indicators.append("Minor edge inconsistencies")
            suspicion_score += 0.10
        
        # Analyze scene changes for unnatural transitions
        scene_changes = quality_metrics.get('scene_changes', 0)
        total_frames = len(frames)
        if total_frames > 0:
            change_rate = scene_changes / total_frames
            if change_rate > 0.3:  # Too many scene changes
                indicators.append("Excessive scene changes")
                suspicion_score += 0.08
        
        # Check lighting consistency across frames
        if 'lighting_consistency' in quality_metrics:
            lighting = quality_metrics['lighting_consistency']
            if lighting < 0.6:
                indicators.append("Inconsistent lighting across frames")
                suspicion_score += 0.15
        
        # Check for noise and additional quality issues
        if quality_metrics.get('sharpness', 0) < 20:
            indicators.append("Very low video sharpness")
            suspicion_score += 0.15
        
        if quality_metrics.get('noise', 0) > 20:
            indicators.append("High noise level")
            suspicion_score += 0.10
        
        # Enhanced lighting consistency check
        brightness_values = [frame_scores[i].get('brightness', 128) 
                            for i in range(len(frame_scores))]
        if len(brightness_values) > 1:
            brightness_std = np.std(brightness_values)
            if brightness_std < 2:  # Too consistent (unnatural)
                indicators.append("Unnaturally consistent lighting")
                suspicion_score += 0.12
            elif brightness_std > 80:  # Too varied
                indicators.append("Erratic lighting changes")
                suspicion_score += 0.10
        
        # Enhanced edge artifact detection around faces
        edge_artifacts = sum(1 for fs in frame_scores if fs.get('edge_artifacts', False))
        if len(frames) > 0 and edge_artifacts > len(frames) * 0.3:
            indicators.append("Edge artifacts detected around faces")
            suspicion_score += 0.20
        
        # Normalize suspicion score
        suspicion_score = min(suspicion_score, 1.0)
        authenticity_score = max(0, (1 - suspicion_score) * 100)
        
        # Improved confidence calculation
        base_confidence = 0.55
        indicator_confidence = len(indicators) * 0.05
        confidence = min(base_confidence + indicator_confidence, 0.88)
        
        return {
            'is_deepfake': suspicion_score > 0.5,
            'confidence': confidence,
            'authenticity_score': authenticity_score,
            'suspicion_score': suspicion_score,
            'indicators': indicators,
            'frame_scores': frame_scores[:5],  # First 5 frame analyses
            'frames_analyzed': len(frames),
            'suspicious_frames': sum(1 for fs in frame_scores if fs['suspicious']),
            'method': 'heuristic-frame-analysis',
        }
    
    def _analyze_single_frame(
        self,
        frame: np.ndarray,
        frame_idx: int,
        face_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze a single frame for deepfake indicators"""
        suspicious = False
        issues = []
        
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Calculate frame metrics
        brightness = np.mean(gray)
        contrast = np.std(gray)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        )
        
        # Check for face-related anomalies
        edge_artifacts = False
        if len(faces) > 0:
            for (x, y, w, h) in faces:
                # Extract face region
                face_roi = frame[y:y+h, x:x+w]
                if face_roi.size > 0:
                    # Check edges around face
                    edges = cv2.Canny(gray[y:y+h, x:x+w], 50, 150)
                    edge_density = np.sum(edges > 0) / edges.size
                    
                    # Unusually sharp edges might indicate compositing
                    if edge_density > 0.2:
                        edge_artifacts = True
                        issues.append("Sharp edges around face")
                        suspicious = True
                    
                    # Check for eye detection within face
                    face_gray = gray[y:y+h, x:x+w]
                    eyes = self.eye_cascade.detectMultiScale(face_gray)
                    
                    # Expect 2 eyes; significant deviation is suspicious
                    if len(eyes) != 2:
                        issues.append(f"Unusual eye count: {len(eyes)}")
        
        # Check for compression artifacts
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 10:  # Very low variance
            issues.append("Low detail variance")
            suspicious = True
        
        return {
            'frame_idx': frame_idx,
            'suspicious': suspicious,
            'brightness': float(brightness),
            'contrast': float(contrast),
            'edge_artifacts': edge_artifacts,
            'faces_detected': len(faces),
            'issues': issues,
        }
    
    def analyze_temporal_consistency(
        self,
        frames: List[np.ndarray]
    ) -> Dict[str, Any]:
        """
        Analyze temporal consistency across frames
        Deepfakes often have frame-to-frame inconsistencies
        """
        if len(frames) < 2:
            return {'consistent': True, 'score': 1.0}
        
        inconsistencies = []
        
        # Compare consecutive frames
        for i in range(len(frames) - 1):
            frame1 = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
            frame2 = cv2.cvtColor(frames[i+1], cv2.COLOR_BGR2GRAY)
            
            # Calculate optical flow
            try:
                flow = cv2.calcOpticalFlowFarneback(
                    frame1, frame2, None, 0.5, 3, 15, 3, 5, 1.2, 0
                )
                
                # Analyze flow magnitude
                magnitude = np.sqrt(flow[..., 0]**2 + flow[..., 1]**2)
                avg_magnitude = np.mean(magnitude)
                
                # Unnatural jumps in motion
                if avg_magnitude > 50:  # Threshold for unusual motion
                    inconsistencies.append(f"Frame {i}-{i+1}: Unusual motion")
            except:
                pass
        
        consistency_score = 1.0 - (len(inconsistencies) / max(len(frames), 1))
        
        return {
            'consistent': len(inconsistencies) < len(frames) * 0.2,
            'score': consistency_score,
            'inconsistencies': inconsistencies[:5],
        }


# Singleton instance
_video_detector_instance = None


def get_video_deepfake_detector(
    force_reload: bool = False
) -> VideoDeepfakeDetector:
    """Get or create video deepfake detector instance"""
    global _video_detector_instance
    
    if _video_detector_instance is None or force_reload:
        _video_detector_instance = VideoDeepfakeDetector()
    
    return _video_detector_instance
