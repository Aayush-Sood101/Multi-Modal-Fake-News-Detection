import subprocess
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
import librosa
import numpy as np

# Lazy load ML models
_whisper_model = None
_deepfake_detector = None


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


def get_whisper_model():
    """Lazy load Whisper model"""
    global _whisper_model
    if _whisper_model is None:
        try:
            from app.ml.audio_model import get_whisper_transcriber
            _whisper_model = get_whisper_transcriber(model_size="base")
        except Exception as e:
            print(f"Warning: Could not load Whisper model: {e}")
            _whisper_model = False
    return _whisper_model if _whisper_model is not False else None


def get_deepfake_detector():
    """Lazy load audio deepfake detector"""
    global _deepfake_detector
    if _deepfake_detector is None:
        try:
            from app.ml.audio_model import get_audio_deepfake_detector
            _deepfake_detector = get_audio_deepfake_detector()
        except Exception as e:
            print(f"Warning: Could not load deepfake detector: {e}")
            _deepfake_detector = False
    return _deepfake_detector if _deepfake_detector is not False else None


class AudioProcessor:
    """Process audio files for analysis"""
    
    @staticmethod
    def get_audio_info(file_path: str) -> Dict[str, Any]:
        """Get basic audio file information"""
        try:
            # Use ffprobe to get audio info
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
                audio_stream = next(
                    (s for s in data.get('streams', []) if s['codec_type'] == 'audio'),
                    None
                )
                
                if audio_stream:
                    return {
                        'duration': float(data['format'].get('duration', 0)),
                        'bit_rate': int(data['format'].get('bit_rate', 0)),
                        'sample_rate': int(audio_stream.get('sample_rate', 0)),
                        'channels': int(audio_stream.get('channels', 0)),
                        'codec': audio_stream.get('codec_name', 'unknown'),
                    }
        except Exception as e:
            print(f"Error getting audio info with ffprobe: {e}")
        
        # Fallback to librosa
        try:
            y, sr = librosa.load(file_path, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
            
            return {
                'duration': duration,
                'sample_rate': sr,
                'channels': 1 if len(y.shape) == 1 else y.shape[0],
                'codec': 'unknown',
            }
        except Exception as e:
            raise Exception(f"Error loading audio file: {str(e)}")
    
    @staticmethod
    def extract_features(file_path: str) -> Dict[str, Any]:
        """Extract audio features for analysis"""
        try:
            # Load audio
            y, sr = librosa.load(file_path, sr=22050)
            
            # Extract features
            features = {}
            
            # Zero Crossing Rate
            zcr = librosa.feature.zero_crossing_rate(y)
            features['zcr_mean'] = float(np.mean(zcr))
            features['zcr_std'] = float(np.std(zcr))
            
            # Spectral Centroid
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
            features['spectral_centroid_mean'] = float(np.mean(spectral_centroids))
            features['spectral_centroid_std'] = float(np.std(spectral_centroids))
            
            # Spectral Rolloff
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
            features['spectral_rolloff_mean'] = float(np.mean(spectral_rolloff))
            
            # MFCC (Mel-frequency cepstral coefficients)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            for i in range(13):
                features[f'mfcc_{i}_mean'] = float(np.mean(mfccs[i]))
                features[f'mfcc_{i}_std'] = float(np.std(mfccs[i]))
            
            # RMS Energy
            rms = librosa.feature.rms(y=y)
            features['rms_mean'] = float(np.mean(rms))
            features['rms_std'] = float(np.std(rms))
            
            return features
        except Exception as e:
            raise Exception(f"Error extracting audio features: {str(e)}")
    
    @staticmethod
    def detect_silence_segments(file_path: str, threshold: float = 0.01) -> List[Dict[str, float]]:
        """Detect silent segments in audio"""
        try:
            y, sr = librosa.load(file_path, sr=22050)
            
            # Calculate RMS energy
            rms = librosa.feature.rms(y=y)[0]
            
            # Find silent frames
            silent_frames = rms < threshold
            
            # Convert to time segments
            hop_length = 512
            frame_duration = hop_length / sr
            
            segments = []
            in_silence = False
            start_time = 0
            
            for i, is_silent in enumerate(silent_frames):
                current_time = i * frame_duration
                
                if is_silent and not in_silence:
                    start_time = current_time
                    in_silence = True
                elif not is_silent and in_silence:
                    segments.append({
                        'start': start_time,
                        'end': current_time,
                        'duration': current_time - start_time
                    })
                    in_silence = False
            
            # Close last segment if needed
            if in_silence:
                segments.append({
                    'start': start_time,
                    'end': len(silent_frames) * frame_duration,
                    'duration': len(silent_frames) * frame_duration - start_time
                })
            
            return segments
        except Exception as e:
            raise Exception(f"Error detecting silence: {str(e)}")
    
    @staticmethod
    def analyze_audio_quality(file_path: str) -> Dict[str, Any]:
        """Analyze audio quality metrics"""
        try:
            y, sr = librosa.load(file_path, sr=22050)
            
            # Signal-to-Noise Ratio (simplified)
            signal_power = np.mean(y ** 2)
            noise_estimate = np.std(y[np.abs(y) < 0.1])  # Estimate noise from quiet parts
            snr = 10 * np.log10(signal_power / (noise_estimate ** 2 + 1e-10))
            
            # Dynamic range
            dynamic_range = 20 * np.log10(np.max(np.abs(y)) / (np.min(np.abs(y[y != 0])) + 1e-10))
            
            # Clipping detection
            clipping_threshold = 0.99
            clipped_samples = np.sum(np.abs(y) > clipping_threshold)
            clipping_percentage = (clipped_samples / len(y)) * 100
            
            return {
                'snr_db': float(snr),
                'dynamic_range_db': float(dynamic_range),
                'clipping_percentage': float(clipping_percentage),
                'has_significant_clipping': clipping_percentage > 1.0,
            }
        except Exception as e:
            raise Exception(f"Error analyzing audio quality: {str(e)}")


class SimpleTranscriber:
    """Simple transcription placeholder (to be replaced with Whisper)"""
    
    @staticmethod
    async def transcribe(file_path: str) -> Dict[str, Any]:
        """
        Transcribe audio to text
        
        NOTE: This is a placeholder. Real implementation will use Whisper.
        For now, returns dummy transcription.
        """
        audio_info = AudioProcessor.get_audio_info(file_path)
        duration = audio_info.get('duration', 0)
        
        # Placeholder transcription
        return {
            'text': '[Transcription will be available when Whisper model is integrated]',
            'duration': duration,
            'language': 'en',
            'confidence': 0.0,
            'segments': [],
        }


async def analyze_audio_file(file_path: str, use_ml: bool = True) -> Dict[str, Any]:
    """
    Perform complete audio analysis
    
    Args:
        file_path: Path to audio file
        use_ml: Whether to use ML models (Whisper, deepfake detection)
    
    Returns dict with:
        - audio_info: basic file information
        - features: extracted audio features
        - quality: audio quality metrics
        - silence_segments: detected silent parts
        - transcription: speech-to-text result
        - deepfake_detection: ML-based deepfake analysis
    """
    try:
        # Get basic info
        audio_info = AudioProcessor.get_audio_info(file_path)
        
        # Extract features
        features = AudioProcessor.extract_features(file_path)
        
        # Analyze quality
        quality = AudioProcessor.analyze_audio_quality(file_path)
        
        # Detect silence
        silence_segments = AudioProcessor.detect_silence_segments(file_path)
        
        # Transcribe with ML if available
        if use_ml:
            whisper = get_whisper_model()
            if whisper:
                try:
                    transcription = whisper.transcribe(file_path)
                except Exception as e:
                    print(f"Error in Whisper transcription: {e}")
                    transcription = {
                        'text': '[Transcription failed]',
                        'segments': [],
                        'language': 'unknown',
                        'confidence': 0.0,
                    }
            else:
                # Fallback transcription
                transcription = {
                    'text': '[Whisper model not available]',
                    'segments': [],
                    'language': 'en',
                    'confidence': 0.0,
                }
        else:
            transcription = {'text': '[Transcription skipped]', 'segments': []}
        
        # Deepfake detection with ML
        deepfake_analysis = None
        if use_ml:
            detector = get_deepfake_detector()
            if detector:
                try:
                    deepfake_analysis = detector.detect(features, quality)
                except Exception as e:
                    print(f"Error in deepfake detection: {e}")
                    deepfake_analysis = None
        
        result = {
            'audio_info': audio_info,
            'features': features,
            'quality': quality,
            'silence_segments': silence_segments[:5],  # Limit to first 5
            'transcription': transcription,
            'deepfake_detection': deepfake_analysis,
        }
        
        # Convert numpy types to native Python types for JSON serialization
        return convert_numpy_types(result)
    except Exception as e:
        raise Exception(f"Audio analysis failed: {str(e)}")
