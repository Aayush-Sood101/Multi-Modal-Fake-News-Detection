"""Multi-modal fusion engine for combining text, audio, and video analysis"""
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from enum import Enum


class ModalityType(str, Enum):
    """Types of modalities"""
    TEXT = "text"
    AUDIO = "audio"
    VIDEO = "video"


class FusionStrategy(str, Enum):
    """Fusion strategies"""
    WEIGHTED_AVERAGE = "weighted_average"
    MAXIMUM = "maximum"
    MINIMUM = "minimum"
    VOTING = "voting"
    LEARNED = "learned"  # For future ML-based fusion


class MultiModalFusionEngine:
    """
    Fuses predictions from multiple modalities for final verdict
    
    Combines text, audio, and video analysis with configurable weights
    and strategies for robust multi-modal fake news detection.
    """
    
    def __init__(
        self,
        strategy: FusionStrategy = FusionStrategy.WEIGHTED_AVERAGE,
        weights: Optional[Dict[str, float]] = None,
        confidence_threshold: float = 0.5
    ):
        """
        Initialize fusion engine
        
        Args:
            strategy: Fusion strategy to use
            weights: Custom weights for each modality (must sum to 1.0)
            confidence_threshold: Minimum confidence for predictions
        """
        self.strategy = strategy
        self.confidence_threshold = confidence_threshold
        
        # Default weights (can be tuned based on validation data)
        self.weights = weights or {
            ModalityType.TEXT: 0.45,    # Text is often most informative
            ModalityType.AUDIO: 0.30,   # Audio provides voice authenticity
            ModalityType.VIDEO: 0.25,   # Video for visual manipulation
        }
        
        # Validate weights sum to 1.0
        weight_sum = sum(self.weights.values())
        if not np.isclose(weight_sum, 1.0):
            # Normalize weights
            self.weights = {k: v/weight_sum for k, v in self.weights.items()}
    
    def fuse(
        self,
        text_result: Optional[Dict[str, Any]] = None,
        audio_result: Optional[Dict[str, Any]] = None,
        video_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Fuse results from multiple modalities
        
        Args:
            text_result: Text analysis result
            audio_result: Audio analysis result
            video_result: Video analysis result
        
        Returns:
            Dict with:
                - final_score: Combined credibility score (0-100)
                - final_verdict: 'FAKE', 'REAL', or 'UNCERTAIN'
                - confidence: Overall confidence (0-1)
                - modality_contributions: Individual modality scores
                - explanation: Human-readable explanation
                - detailed_analysis: Breakdown by modality
        """
        # Collect available modalities
        modalities = {}
        if text_result:
            modalities[ModalityType.TEXT] = self._extract_text_score(text_result)
        if audio_result:
            modalities[ModalityType.AUDIO] = self._extract_audio_score(audio_result)
        if video_result:
            modalities[ModalityType.VIDEO] = self._extract_video_score(video_result)
        
        if not modalities:
            return self._no_data_result()
        
        # Apply fusion strategy
        if self.strategy == FusionStrategy.WEIGHTED_AVERAGE:
            final_score, confidence = self._weighted_average_fusion(modalities)
        elif self.strategy == FusionStrategy.MAXIMUM:
            final_score, confidence = self._maximum_fusion(modalities)
        elif self.strategy == FusionStrategy.MINIMUM:
            final_score, confidence = self._minimum_fusion(modalities)
        elif self.strategy == FusionStrategy.VOTING:
            final_score, confidence = self._voting_fusion(modalities)
        else:
            final_score, confidence = self._weighted_average_fusion(modalities)
        
        # Determine verdict
        verdict = self._determine_verdict(final_score, confidence)
        
        # Build explanation
        explanation = self._build_explanation(
            final_score, confidence, verdict, modalities
        )
        
        return {
            'final_score': final_score,
            'final_verdict': verdict,
            'confidence': confidence,
            'modality_contributions': {
                str(k): v for k, v in modalities.items()
            },
            'explanation': explanation,
            'detailed_analysis': {
                'text': text_result,
                'audio': audio_result,
                'video': video_result,
            },
            'fusion_strategy': self.strategy.value,
            'weights_used': self.weights,
        }
    
    def _extract_text_score(self, text_result: Dict[str, Any]) -> Dict[str, float]:
        """Extract credibility score and confidence from text analysis"""
        # Check for ML prediction first
        if text_result.get('ml_prediction'):
            ml = text_result['ml_prediction']
            # Convert fake probability to credibility
            fake_prob = ml.get('fake_probability', 0.5)
            credibility = (1 - fake_prob) * 100
            confidence = ml.get('confidence', 0.5)
            
            # Adjust confidence based on text features
            features = ml.get('features', {})
            if features.get('clickbait_indicators', 0) > 3:
                confidence = min(confidence + 0.1, 0.95)
            if features.get('credibility_markers', 0) > 2:
                credibility = min(credibility + 5, 100)
        else:
            # Fallback to manipulation-based score
            manipulation_count = len(text_result.get('manipulation_indicators', []))
            sentiment = text_result.get('sentiment_analysis', {})
            
            # More sophisticated scoring
            base_credibility = 65
            manipulation_penalty = manipulation_count * 12
            
            # Adjust for extreme sentiment (often indicates bias)
            if sentiment:
                compound = abs(sentiment.get('compound', 0))
                if compound > 0.8:
                    manipulation_penalty += 8
            
            credibility = max(10, base_credibility - manipulation_penalty)
            confidence = 0.55 + min(manipulation_count * 0.05, 0.25)
        
        return {
            'score': credibility,
            'confidence': confidence,
            'weight': self.weights.get(ModalityType.TEXT, 0.33),
        }
    
    def _extract_audio_score(self, audio_result: Dict[str, Any]) -> Dict[str, float]:
        """Extract authenticity score and confidence from audio analysis with improvements"""
        # Check for deepfake detection result
        if audio_result.get('deepfake_detection'):
            df = audio_result['deepfake_detection']
            authenticity = df.get('authenticity_score', 50)
            confidence = df.get('confidence', 0.5)
            
            # Boost confidence for severe indicators
            indicators = df.get('indicators', [])
            severe_count = sum(1 for i in indicators if 'severe' in i.lower() or 'extreme' in i.lower())
            if severe_count > 0:
                confidence = min(confidence + (severe_count * 0.08), 0.92)
        else:
            # Fallback to quality-based score
            quality = audio_result.get('quality', {})
            snr = quality.get('snr_db', 20)
            clipping = quality.get('clipping_percentage', 0)
            
            # Calculate score from quality metrics
            authenticity = 70.0
            if snr < 15:
                authenticity -= 15
            if snr > 50:  # Too clean
                authenticity -= 10
            if clipping > 1.0:
                authenticity -= 10
            
            confidence = 0.5
        
        return {
            'score': authenticity,
            'confidence': confidence,
            'weight': self.weights.get(ModalityType.AUDIO, 0.33),
        }
    
    def _extract_video_score(self, video_result: Dict[str, Any]) -> Dict[str, float]:
        """Extract authenticity score and confidence from video analysis with improvements"""
        # Check for deepfake detection result
        if video_result.get('deepfake_detection'):
            df = video_result['deepfake_detection']
            authenticity = df.get('authenticity_score', 50)
            confidence = df.get('confidence', 0.5)
            
            # Enhance confidence based on indicators
            indicators = df.get('indicators', [])
            severe_count = sum(1 for i in indicators if 'severe' in i.lower() or 'extreme' in i.lower())
            edge_artifacts = sum(1 for i in indicators if 'edge' in i.lower())
            
            if severe_count > 0:
                confidence = min(confidence + (severe_count * 0.07), 0.88)
            if edge_artifacts > 0:
                confidence = min(confidence + 0.10, 0.90)
        else:
            # Fallback to quality/scene-based score
            quality = video_result.get('quality_metrics', {})
            scene_count = video_result.get('scene_change_count', 0)
            duration = video_result.get('video_info', {}).get('duration', 1)
            
            authenticity = 70.0
            scene_rate = scene_count / max(duration, 1)
            if scene_rate > 5:
                authenticity -= 15
            if quality.get('sharpness', 0) < 30:
                authenticity -= 10
            
            confidence = 0.5
        
        return {
            'score': authenticity,
            'confidence': confidence,
            'weight': self.weights.get(ModalityType.VIDEO, 0.33),
        }
    
    def _weighted_average_fusion(
        self,
        modalities: Dict[ModalityType, Dict[str, float]]
    ) -> Tuple[float, float]:
        """Enhanced weighted average fusion with cross-modal consistency"""
        # Normalize weights for available modalities
        available_weight_sum = sum(
            m['weight'] for m in modalities.values()
        )
        
        # Calculate weighted score
        weighted_score = sum(
            (m['score'] * m['weight']) / available_weight_sum
            for m in modalities.values()
        )
        
        # Calculate confidence (weighted by individual confidences)
        weighted_confidence = sum(
            (m['confidence'] * m['weight']) / available_weight_sum
            for m in modalities.values()
        )
        
        # Cross-modal consistency bonus
        if len(modalities) > 1:
            scores = [m['score'] for m in modalities.values()]
            score_std = np.std(scores)
            
            # If all modalities agree (low std), boost confidence
            if score_std < 15:
                consistency_bonus = 0.10
                weighted_confidence = min(weighted_confidence + consistency_bonus, 0.95)
            elif score_std > 35:
                # High disagreement - reduce confidence
                weighted_confidence = max(weighted_confidence - 0.10, 0.35)
        
        return weighted_score, weighted_confidence
    
    def _maximum_fusion(
        self,
        modalities: Dict[ModalityType, Dict[str, float]]
    ) -> Tuple[float, float]:
        """Maximum fusion - most optimistic score"""
        scores = [m['score'] for m in modalities.values()]
        confidences = [m['confidence'] for m in modalities.values()]
        
        max_idx = np.argmax(scores)
        return scores[max_idx], confidences[max_idx]
    
    def _minimum_fusion(
        self,
        modalities: Dict[ModalityType, Dict[str, float]]
    ) -> Tuple[float, float]:
        """Minimum fusion - most pessimistic score"""
        scores = [m['score'] for m in modalities.values()]
        confidences = [m['confidence'] for m in modalities.values()]
        
        min_idx = np.argmin(scores)
        return scores[min_idx], confidences[min_idx]
    
    def _voting_fusion(
        self,
        modalities: Dict[ModalityType, Dict[str, float]]
    ) -> Tuple[float, float]:
        """Majority voting fusion"""
        # Convert scores to binary votes (>50 = real, <=50 = fake)
        votes = [1 if m['score'] > 50 else 0 for m in modalities.values()]
        confidences = [m['confidence'] for m in modalities.values()]
        
        # Majority vote
        real_votes = sum(votes)
        fake_votes = len(votes) - real_votes
        
        if real_votes > fake_votes:
            final_score = 75.0  # Lean towards real
        elif fake_votes > real_votes:
            final_score = 25.0  # Lean towards fake
        else:
            final_score = 50.0  # Uncertain
        
        avg_confidence = np.mean(confidences)
        return final_score, avg_confidence
    
    def _determine_verdict(self, score: float, confidence: float) -> str:
        """Determine final verdict from score and confidence"""
        if confidence < self.confidence_threshold:
            return "UNCERTAIN"
        
        if score >= 70:
            return "REAL"
        elif score <= 30:
            return "FAKE"
        else:
            return "UNCERTAIN"
    
    def _build_explanation(
        self,
        score: float,
        confidence: float,
        verdict: str,
        modalities: Dict[ModalityType, Dict[str, float]]
    ) -> Dict[str, Any]:
        """Build human-readable explanation"""
        # Determine confidence level
        if confidence >= 0.8:
            confidence_level = "Very High"
        elif confidence >= 0.6:
            confidence_level = "High"
        elif confidence >= 0.4:
            confidence_level = "Medium"
        else:
            confidence_level = "Low"
        
        # Build summary
        summary = f"Overall Assessment: {verdict} (Score: {score:.1f}/100)\n"
        summary += f"Confidence Level: {confidence_level} ({confidence:.2%})\n\n"
        
        # Add modality breakdown
        summary += "Analysis by Modality:\n"
        for modality, data in modalities.items():
            summary += f"- {modality.value.capitalize()}: "
            summary += f"{data['score']:.1f}/100 "
            summary += f"(confidence: {data['confidence']:.2%})\n"
        
        # Add recommendation
        if verdict == "FAKE":
            recommendation = "This content shows significant indicators of manipulation or falsehood. Exercise caution and verify from reliable sources."
        elif verdict == "REAL":
            recommendation = "This content appears credible with few indicators of manipulation. However, always verify important claims."
        else:
            recommendation = "Analysis is inconclusive. Additional verification recommended before drawing conclusions."
        
        return {
            'summary': summary,
            'verdict': verdict,
            'confidence_level': confidence_level,
            'recommendation': recommendation,
        }
    
    def _no_data_result(self) -> Dict[str, Any]:
        """Return result when no modality data is available"""
        return {
            'final_score': 50.0,
            'final_verdict': "UNCERTAIN",
            'confidence': 0.0,
            'modality_contributions': {},
            'explanation': {
                'summary': "No analysis data available",
                'verdict': "UNCERTAIN",
                'confidence_level': "None",
                'recommendation': "Unable to analyze - no data provided",
            },
            'detailed_analysis': {},
            'fusion_strategy': self.strategy.value,
            'weights_used': self.weights,
        }


# Singleton instance
_fusion_engine_instance = None


def get_fusion_engine(
    strategy: FusionStrategy = FusionStrategy.WEIGHTED_AVERAGE,
    weights: Optional[Dict[str, float]] = None,
    force_reload: bool = False
) -> MultiModalFusionEngine:
    """Get or create fusion engine instance"""
    global _fusion_engine_instance
    
    if _fusion_engine_instance is None or force_reload:
        _fusion_engine_instance = MultiModalFusionEngine(
            strategy=strategy,
            weights=weights
        )
    
    return _fusion_engine_instance
