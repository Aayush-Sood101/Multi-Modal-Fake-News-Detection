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
        """Fallback rule-based prediction when ML model unavailable"""
        # Simple heuristic-based detection
        text_lower = text.lower()
        
        # Suspicious indicators
        suspicious_words = [
            'breaking', 'shocking', 'unbelievable', 'must read',
            'they don\'t want you to know', 'secret', 'exposed',
            'miracle', 'instant', 'guaranteed', '100%'
        ]
        
        credibility_words = [
            'study', 'research', 'according to', 'expert',
            'professor', 'university', 'published', 'data'
        ]
        
        suspicious_count = sum(1 for word in suspicious_words if word in text_lower)
        credibility_count = sum(1 for word in credibility_words if word in text_lower)
        
        # Calculate score
        fake_score = (suspicious_count * 0.15) - (credibility_count * 0.1) + 0.5
        fake_prob = min(max(fake_score, 0.2), 0.8)  # Keep in reasonable range
        
        return {
            'is_fake': fake_prob > 0.5,
            'confidence': 0.4,  # Lower confidence for rule-based
            'fake_probability': fake_prob,
            'real_probability': 1 - fake_prob,
            'features': {
                'suspicious_word_count': suspicious_count,
                'credibility_word_count': credibility_count,
                'model_used': 'rule-based-fallback'
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
