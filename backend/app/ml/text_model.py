import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    pipeline,
)
from typing import Dict, Any, List, Optional
import numpy as np
from pathlib import Path


class TextFakeNewsDetector:
    """
    Text-based fake news detection using transformer models.
    Supports DistilBERT, RoBERTa, and other HuggingFace models.
    """
    
    def __init__(
        self,
        model_name: str = "distilbert-base-uncased",
        cache_dir: Optional[str] = None,
        device: Optional[str] = None
    ):
        """
        Initialize the text fake news detector
        
        Args:
            model_name: HuggingFace model identifier
            cache_dir: Directory to cache downloaded models
            device: Device to run inference on ('cuda', 'cpu', or None for auto)
        """
        self.model_name = model_name
        self.cache_dir = cache_dir
        
        # Determine device
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        print(f"Loading text model '{model_name}' on device: {self.device}")
        
        # For now, use a general sentiment/text classification model
        # In production, this would be fine-tuned on fake news datasets
        self.tokenizer = None
        self.model = None
        self.classifier = None
        
        self._load_model()
    
    def _load_model(self):
        """Load the transformer model and tokenizer"""
        try:
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                cache_dir=self.cache_dir
            )
            
            # For demonstration, we'll use a zero-shot classification pipeline
            # In production, replace with fine-tuned fake news detection model
            self.classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=0 if self.device == "cuda" else -1
            )
            
            print(f"✓ Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Will use fallback rule-based detection")
            self.classifier = None
    
    def predict(
        self,
        text: str,
        return_features: bool = True
    ) -> Dict[str, Any]:
        """
        Predict if text is fake news
        
        Args:
            text: Input text to analyze
            return_features: Whether to return intermediate features
        
        Returns:
            Dict containing:
                - is_fake: Boolean prediction
                - confidence: Confidence score (0-1)
                - fake_probability: Probability text is fake (0-1)
                - real_probability: Probability text is real (0-1)
                - features: Optional feature dict
        """
        if self.classifier is None:
            return self._fallback_prediction(text)
        
        try:
            # Use zero-shot classification with relevant labels
            result = self.classifier(
                text[:512],  # Truncate to avoid token limits
                candidate_labels=[
                    "fake news",
                    "misinformation",
                    "propaganda",
                    "factual news",
                    "reliable information"
                ],
                multi_label=True
            )
            
            # Calculate fake probability from relevant labels
            fake_labels = {"fake news", "misinformation", "propaganda"}
            fake_scores = [
                score for label, score in zip(result['labels'], result['scores'])
                if label in fake_labels
            ]
            fake_prob = np.mean(fake_scores) if fake_scores else 0.3
            
            # Apply calibration (adjust these thresholds based on validation)
            fake_prob = min(max(fake_prob, 0.0), 1.0)
            
            prediction = {
                'is_fake': fake_prob > 0.5,
                'confidence': abs(fake_prob - 0.5) * 2,  # Convert to 0-1 scale
                'fake_probability': fake_prob,
                'real_probability': 1 - fake_prob,
            }
            
            if return_features:
                prediction['features'] = {
                    'all_labels': result['labels'],
                    'all_scores': result['scores'],
                    'text_length': len(text),
                    'model_used': 'zero-shot-bart'
                }
            
            return prediction
            
        except Exception as e:
            print(f"Error in ML prediction: {e}")
            return self._fallback_prediction(text)
    
    def _fallback_prediction(self, text: str) -> Dict[str, Any]:
        """Enhanced rule-based prediction when ML model unavailable"""
        text_lower = text.lower()
        
        # Expanded suspicious indicators with weights
        clickbait_phrases = [
            'you won\'t believe', 'shocking truth', 'doctors hate', 
            'one weird trick', 'what happened next', 'mind blowing',
            'this is why', 'the real reason', 'they don\'t want'
        ]
        
        emotional_manipulation = [
            'outrageous', 'devastating', 'terrifying', 'horrifying',
            'amazing', 'incredible', 'unbelievable', 'miracle',
            'scandal', 'exposed', 'revealed', 'conspiracy'
        ]
        
        urgency_words = [
            'breaking', 'urgent', 'alert', 'warning', 'must read',
            'immediately', 'right now', 'before it\'s too late',
            'limited time', 'act now', 'don\'t miss'
        ]
        
        credibility_indicators = [
            'study shows', 'research indicates', 'according to',
            'expert', 'professor', 'dr.', 'ph.d.', 'university',
            'institute', 'published', 'journal', 'peer-reviewed',
            'data shows', 'statistics', 'evidence', 'analysis'
        ]
        
        source_citations = [
            'source:', 'via', 'according to', 'reported by',
            'published in', 'study by', 'cited in'
        ]
        
        # Count indicators
        clickbait_count = sum(1 for phrase in clickbait_phrases if phrase in text_lower)
        emotional_count = sum(1 for word in emotional_manipulation if word in text_lower)
        urgency_count = sum(1 for word in urgency_words if word in text_lower)
        credibility_count = sum(1 for phrase in credibility_indicators if phrase in text_lower)
        citation_count = sum(1 for phrase in source_citations if phrase in text_lower)
        
        # Additional heuristics
        has_all_caps = any(word.isupper() and len(word) > 3 for word in text.split())
        excessive_punctuation = text.count('!') > 3 or text.count('?') > 3
        short_text = len(text.split()) < 20
        
        # Calculate weighted fake score
        fake_score = 0.3  # Base score
        fake_score += clickbait_count * 0.12
        fake_score += emotional_count * 0.08
        fake_score += urgency_count * 0.10
        fake_score -= credibility_count * 0.08
        fake_score -= citation_count * 0.06
        fake_score += 0.05 if has_all_caps else 0
        fake_score += 0.05 if excessive_punctuation else 0
        fake_score += 0.03 if short_text else 0
        
        fake_prob = min(max(fake_score, 0.15), 0.85)
        
        # Calculate confidence based on indicator strength
        indicator_strength = clickbait_count + emotional_count + urgency_count + credibility_count
        confidence = min(0.35 + (indicator_strength * 0.04), 0.65)
        
        return {
            'is_fake': fake_prob > 0.5,
            'confidence': confidence,
            'fake_probability': fake_prob,
            'real_probability': 1 - fake_prob,
            'features': {
                'clickbait_indicators': clickbait_count,
                'emotional_manipulation': emotional_count,
                'urgency_tactics': urgency_count,
                'credibility_markers': credibility_count,
                'source_citations': citation_count,
                'has_all_caps': has_all_caps,
                'excessive_punctuation': excessive_punctuation,
                'model_used': 'enhanced-rule-based'
            }
        }
    
    def predict_batch(
        self,
        texts: List[str],
        batch_size: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Predict on multiple texts
        
        Args:
            texts: List of texts to analyze
            batch_size: Batch size for processing
        
        Returns:
            List of prediction dicts
        """
        results = []
        for text in texts:
            results.append(self.predict(text, return_features=False))
        return results
    
    def get_explanation(self, text: str) -> Dict[str, Any]:
        """
        Get human-readable explanation for prediction
        
        Returns:
            Dict with explanation details
        """
        prediction = self.predict(text, return_features=True)
        
        explanation = {
            'verdict': 'FAKE' if prediction['is_fake'] else 'REAL',
            'confidence_level': self._get_confidence_level(prediction['confidence']),
            'key_factors': [],
        }
        
        # Extract key factors from features
        if 'features' in prediction:
            features = prediction['features']
            
            if 'all_labels' in features:
                # Add top predictions as factors
                for label, score in zip(features['all_labels'][:3], features['all_scores'][:3]):
                    explanation['key_factors'].append(
                        f"{label}: {score:.2%} confidence"
                    )
            
            if 'suspicious_word_count' in features:
                if features['suspicious_word_count'] > 2:
                    explanation['key_factors'].append(
                        f"Contains {features['suspicious_word_count']} suspicious phrases"
                    )
                if features['credibility_word_count'] > 1:
                    explanation['key_factors'].append(
                        f"Contains {features['credibility_word_count']} credibility indicators"
                    )
        
        return explanation
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Convert confidence score to human-readable level"""
        if confidence > 0.8:
            return "Very High"
        elif confidence > 0.6:
            return "High"
        elif confidence > 0.4:
            return "Medium"
        else:
            return "Low"


# Singleton instance for reuse
_text_detector_instance = None


def get_text_detector(
    model_name: str = "distilbert-base-uncased",
    force_reload: bool = False
) -> TextFakeNewsDetector:
    """
    Get or create text detector instance (singleton pattern)
    
    Args:
        model_name: Model to use
        force_reload: Force reload the model
    
    Returns:
        TextFakeNewsDetector instance
    """
    global _text_detector_instance
    
    if _text_detector_instance is None or force_reload:
        _text_detector_instance = TextFakeNewsDetector(model_name=model_name)
    
    return _text_detector_instance
