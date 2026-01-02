import torch
import whisper
import numpy as np
from typing import Dict, Any, Optional, List
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')


class WhisperTranscriber:
    """
    Audio transcription using OpenAI's Whisper model
    """
    
    def __init__(
        self,
        model_size: str = "base",
        device: Optional[str] = None,
        language: str = "en"
    ):
        """
        Initialize Whisper transcriber
        
        Args:
            model_size: Model size - tiny, base, small, medium, large
            device: Device to run on (cuda/cpu)
            language: Language code for transcription
        """
        self.model_size = model_size
        self.language = language
        
        # Determine device
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        print(f"Loading Whisper model '{model_size}' on device: {self.device}")
        
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load Whisper model"""
        try:
            self.model = whisper.load_model(
                self.model_size,
                device=self.device
            )
            print(f"✓ Whisper model loaded successfully")
        except Exception as e:
            print(f"Error loading Whisper model: {e}")
            self.model = None
    
    def transcribe(
        self,
        audio_path: str,
        return_timestamps: bool = True,
        return_language: bool = True
    ) -> Dict[str, Any]:
        """
        Transcribe audio file
        
        Args:
            audio_path: Path to audio file
            return_timestamps: Whether to return word-level timestamps
            return_language: Whether to detect and return language
        
        Returns:
            Dict with:
                - text: Full transcription
                - segments: List of segments with timestamps
                - language: Detected language
                - confidence: Average confidence score
        """
        if self.model is None:
            return self._fallback_transcription()
        
        try:
            # Transcribe
            result = self.model.transcribe(
                audio_path,
                language=self.language if self.language else None,
                word_timestamps=return_timestamps,
                verbose=False
            )
            
            # Extract segments
            segments = []
            if 'segments' in result:
                for seg in result['segments']:
                    segments.append({
                        'start': seg.get('start', 0),
                        'end': seg.get('end', 0),
                        'text': seg.get('text', '').strip(),
                        'confidence': seg.get('no_speech_prob', 0),
                    })
            
            # Calculate average confidence
            if segments:
                avg_confidence = 1 - np.mean([s['confidence'] for s in segments])
            else:
                avg_confidence = 0.5
            
            return {
                'text': result.get('text', '').strip(),
                'segments': segments,
                'language': result.get('language', 'unknown'),
                'confidence': float(avg_confidence),
            }
            
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return self._fallback_transcription()
    
    def _fallback_transcription(self) -> Dict[str, Any]:
        """Fallback when model unavailable"""
        return {
            'text': '[Transcription unavailable - Whisper model not loaded]',
            'segments': [],
            'language': 'unknown',
            'confidence': 0.0,
        }


class AudioDeepfakeDetector:
    """
    Audio deepfake detection using signal analysis
    
    In production, this would use models like:
    - RawNet2/RawNet3
    - AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal graph attention)
    - Wav2Vec 2.0 fine-tuned for deepfake detection
    
    For now, uses signal processing heuristics
    """
    
    def __init__(self, device: Optional[str] = None):
        """Initialize audio deepfake detector"""
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        print(f"Audio deepfake detector initialized on: {self.device}")
    
    def detect(
        self,
        audio_features: Dict[str, Any],
        audio_quality: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Detect audio deepfakes using features
        
        Args:
            audio_features: Features from librosa analysis
            audio_quality: Quality metrics
        
        Returns:
            Dict with:
                - is_deepfake: Boolean prediction
                - confidence: Confidence score (0-1)
                - authenticity_score: Score 0-100
                - indicators: List of suspicious indicators
        """
        indicators = []
        suspicion_score = 0.0
        
        # Enhanced spectral analysis for synthetic voice detection
        if 'spectral_centroid_mean' in audio_features:
            centroid = audio_features['spectral_centroid_mean']
            # Human speech typically 500-2000 Hz; AI voices often have anomalies
            if centroid < 250 or centroid > 3500:
                indicators.append("Extreme spectral centroid anomaly")
                suspicion_score += 0.20
            elif centroid < 300 or centroid > 3000:
                indicators.append("Unusual spectral centroid")
                suspicion_score += 0.12
        
        # Enhanced zero-crossing rate analysis
        if 'zero_crossing_rate_mean' in audio_features:
            zcr = audio_features['zero_crossing_rate_mean']
            # Natural speech: 0.01 - 0.2; AI synthesis often deviates
            if zcr < 0.003 or zcr > 0.4:
                indicators.append("Severe zero-crossing rate anomaly")
                suspicion_score += 0.18
            elif zcr < 0.005 or zcr > 0.3:
                indicators.append("Unusual zero-crossing rate")
                suspicion_score += 0.10
        
        # Check for audio artifacts
        if 'clipping_detected' in audio_quality:
            if audio_quality['clipping_detected']:
                indicators.append("Audio clipping detected")
                suspicion_score += 0.1
        
        # Enhanced SNR analysis
        if 'snr_db' in audio_quality:
            snr = audio_quality['snr_db']
            if snr < 8:  # Very low SNR
                indicators.append("Very low signal-to-noise ratio")
                suspicion_score += 0.15
            elif snr < 10:
                indicators.append("Low signal-to-noise ratio")
                suspicion_score += 0.08
            elif snr > 55:  # Unrealistically high SNR (too clean)
                indicators.append("Unrealistically high SNR (possibly synthetic)")
                suspicion_score += 0.18
            elif snr > 50:
                indicators.append("Unusually high SNR")
                suspicion_score += 0.12
        
        # Enhanced MFCC analysis for voice authenticity
        if 'mfcc_std' in audio_features:
            mfcc_std = audio_features['mfcc_std']
            # Very low variance indicates lack of natural voice variation
            if mfcc_std < 3:
                indicators.append("Extremely low MFCC variance (synthetic indicator)")
                suspicion_score += 0.20
            elif mfcc_std < 5:
                indicators.append("Low MFCC variance")
                suspicion_score += 0.12
        
        # Check formant frequencies if available
        if 'formant_consistency' in audio_features:
            consistency = audio_features['formant_consistency']
            if consistency < 0.6:
                indicators.append("Poor formant consistency")
                suspicion_score += 0.15
        
        # Check dynamic range
        if 'dynamic_range_db' in audio_quality:
            dr = audio_quality['dynamic_range_db']
            if dr < 8:  # Heavily compressed/processed
                indicators.append("Very low dynamic range")
                suspicion_score += 0.12
            elif dr < 10:
                indicators.append("Low dynamic range")
                suspicion_score += 0.08
        
        # Calculate final scores with better calibration
        suspicion_score = min(suspicion_score, 1.0)
        authenticity_score = (1 - suspicion_score) * 100
        
        # Improved confidence based on number and severity of indicators
        base_confidence = 0.60
        indicator_confidence = len(indicators) * 0.06
        confidence = min(base_confidence + indicator_confidence, 0.90)
        confidence = min(confidence, 0.95)
        
        return {
            'is_deepfake': suspicion_score > 0.5,
            'confidence': confidence,
            'authenticity_score': authenticity_score,
            'suspicion_score': suspicion_score,
            'indicators': indicators,
            'method': 'signal-analysis-heuristic',
        }


# Singleton instances
_whisper_instance = None
_deepfake_detector_instance = None


def get_whisper_transcriber(
    model_size: str = "base",
    force_reload: bool = False
) -> WhisperTranscriber:
    """Get or create Whisper transcriber instance"""
    global _whisper_instance
    
    if _whisper_instance is None or force_reload:
        _whisper_instance = WhisperTranscriber(model_size=model_size)
    
    return _whisper_instance


def get_audio_deepfake_detector(
    force_reload: bool = False
) -> AudioDeepfakeDetector:
    """Get or create audio deepfake detector instance"""
    global _deepfake_detector_instance
    
    if _deepfake_detector_instance is None or force_reload:
        _deepfake_detector_instance = AudioDeepfakeDetector()
    
    return _deepfake_detector_instance
