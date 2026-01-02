import re
import string
from pathlib import Path
from typing import Dict, Any, List, Optional
import PyPDF2
import docx
import numpy as np

# Import ML model (lazy load to avoid startup delays)
_text_ml_model = None


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


def get_text_ml_model():
    """Lazy load text ML model"""
    global _text_ml_model
    if _text_ml_model is None:
        try:
            from app.ml.text_model import get_text_detector
            _text_ml_model = get_text_detector()
        except Exception as e:
            print(f"Warning: Could not load text ML model: {e}")
            _text_ml_model = False  # Mark as failed to avoid retrying
    return _text_ml_model if _text_ml_model is not False else None


class TextExtractor:
    """Extract text from various file formats"""
    
    @staticmethod
    async def extract_from_txt(file_path: str) -> str:
        """Extract text from .txt file"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    
    @staticmethod
    async def extract_from_pdf(file_path: str) -> str:
        """Extract text from .pdf file"""
        text = []
        try:
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text.append(page.extract_text())
        except Exception as e:
            raise Exception(f"Error extracting PDF: {str(e)}")
        
        return '\n'.join(text)
    
    @staticmethod
    async def extract_from_docx(file_path: str) -> str:
        """Extract text from .docx file"""
        try:
            doc = docx.Document(file_path)
            text = []
            for paragraph in doc.paragraphs:
                text.append(paragraph.text)
            return '\n'.join(text)
        except Exception as e:
            raise Exception(f"Error extracting DOCX: {str(e)}")
    
    @staticmethod
    async def extract_text(file_path: str) -> str:
        """Extract text from file based on extension"""
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext == '.txt':
            return await TextExtractor.extract_from_txt(file_path)
        elif file_ext == '.pdf':
            return await TextExtractor.extract_from_pdf(file_path)
        elif file_ext in ['.docx', '.doc']:
            return await TextExtractor.extract_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")


class TextPreprocessor:
    """Preprocess text for analysis"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove URLs
        text = re.sub(r'http\S+|www.\S+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters (keep punctuation)
        text = re.sub(r'[^\w\s.,!?;:\-\'"()]', '', text)
        
        return text.strip()
    
    @staticmethod
    def split_sentences(text: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence splitting (can be improved with NLTK)
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    @staticmethod
    def extract_claims(text: str) -> List[str]:
        """Extract potential claims from text"""
        sentences = TextPreprocessor.split_sentences(text)
        
        # Keywords that often indicate claims
        claim_indicators = [
            'according to', 'studies show', 'research indicates',
            'experts say', 'scientists found', 'data reveals',
            'reports confirm', 'evidence suggests', 'statistics show'
        ]
        
        claims = []
        for sentence in sentences:
            lower_sentence = sentence.lower()
            if any(indicator in lower_sentence for indicator in claim_indicators):
                claims.append(sentence)
        
        return claims


class TextAnalyzer:
    """Analyze text for various features"""
    
    @staticmethod
    def calculate_sentiment(text: str) -> Dict[str, Any]:
        """Calculate sentiment (simple version, to be replaced with ML model)"""
        # Simple sentiment based on word lists (placeholder)
        positive_words = set([
            'good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic',
            'positive', 'beneficial', 'helpful', 'effective', 'successful'
        ])
        negative_words = set([
            'bad', 'terrible', 'horrible', 'awful', 'poor', 'negative',
            'harmful', 'dangerous', 'ineffective', 'failed', 'wrong'
        ])
        
        words = text.lower().split()
        pos_count = sum(1 for word in words if word in positive_words)
        neg_count = sum(1 for word in words if word in negative_words)
        
        if pos_count > neg_count:
            sentiment = 'positive'
            score = pos_count / (pos_count + neg_count + 1)
        elif neg_count > pos_count:
            sentiment = 'negative'
            score = neg_count / (pos_count + neg_count + 1)
        else:
            sentiment = 'neutral'
            score = 0.5
        
        return {
            'sentiment': sentiment,
            'confidence': score,
            'positive_count': pos_count,
            'negative_count': neg_count,
        }
    
    @staticmethod
    def detect_manipulation_indicators(text: str) -> List[str]:
        """Detect linguistic patterns that may indicate manipulation"""
        indicators = []
        text_lower = text.lower()
        
        # Check for sensationalism
        sensational_words = [
            'shocking', 'unbelievable', 'explosive', 'bombshell',
            'devastating', 'catastrophic', 'miracle', 'breaking'
        ]
        if any(word in text_lower for word in sensational_words):
            indicators.append('sensational_language')
        
        # Check for emotional manipulation
        emotional_words = [
            'terrifying', 'horrifying', 'outrageous', 'disgusting',
            'infuriating', 'heart-breaking', 'tragic'
        ]
        if any(word in text_lower for word in emotional_words):
            indicators.append('emotional_manipulation')
        
        # Check for ALL CAPS (excessive emphasis)
        if sum(1 for c in text if c.isupper()) / max(len(text), 1) > 0.3:
            indicators.append('excessive_capitalization')
        
        # Check for excessive punctuation
        if text.count('!') > 5 or text.count('?') > 5:
            indicators.append('excessive_punctuation')
        
        # Check for conspiracy language
        conspiracy_terms = [
            'cover-up', 'conspiracy', 'they don\'t want you to know',
            'hidden truth', 'wake up', 'mainstream media lies'
        ]
        if any(term in text_lower for term in conspiracy_terms):
            indicators.append('conspiracy_language')
        
        return indicators
    
    @staticmethod
    def extract_simple_entities(text: str) -> List[Dict[str, str]]:
        """Simple entity extraction (to be replaced with spaCy)"""
        entities = []
        
        # Extract potential names (capitalized words)
        words = text.split()
        for i, word in enumerate(words):
            if word and word[0].isupper() and len(word) > 1:
                # Check if it's not at the start of a sentence
                if i > 0 and not words[i-1].endswith('.'):
                    entities.append({
                        'text': word,
                        'type': 'PERSON_OR_ORG',
                        'confidence': 0.5
                    })
        
        return entities[:10]  # Limit to 10 entities
    
    @staticmethod
    def calculate_readability(text: str) -> Dict[str, float]:
        """Calculate readability metrics"""
        words = text.split()
        sentences = TextPreprocessor.split_sentences(text)
        
        # Average word length
        avg_word_length = sum(len(word) for word in words) / max(len(words), 1)
        
        # Average sentence length
        avg_sentence_length = len(words) / max(len(sentences), 1)
        
        # Flesch Reading Ease approximation
        # Higher score = easier to read (0-100 scale)
        if len(words) > 0 and len(sentences) > 0:
            syllables_per_word = avg_word_length / 2  # Rough approximation
            flesch_score = 206.835 - 1.015 * avg_sentence_length - 84.6 * syllables_per_word
            flesch_score = max(0, min(100, flesch_score))
        else:
            flesch_score = 50.0
        
        return {
            'avg_word_length': avg_word_length,
            'avg_sentence_length': avg_sentence_length,
            'flesch_reading_ease': flesch_score,
        }


async def analyze_text_file(file_path: str, use_ml: bool = True) -> Dict[str, Any]:
    """
    Perform complete text analysis
    
    Args:
        file_path: Path to text file
        use_ml: Whether to use ML models for analysis
    
    Returns dict with:
        - text: extracted text
        - word_count: number of words
        - sentiment: sentiment analysis
        - claims: extracted claims
        - entities: named entities
        - manipulation_indicators: detected manipulation patterns
        - readability: readability metrics
        - ml_prediction: ML-based fake news prediction (if use_ml=True)
        - ml_explanation: Human-readable explanation
    """
    # Extract text
    text = await TextExtractor.extract_text(file_path)
    
    # Clean text
    clean_text = TextPreprocessor.clean_text(text)
    sentences = TextPreprocessor.split_sentences(clean_text)
    
    # Analyze
    result = {
        'text': clean_text[:1000],  # First 1000 chars for preview
        'full_text_length': len(text),
        'word_count': len(clean_text.split()),
        'sentence_count': len(sentences),
        'sentiment': TextAnalyzer.calculate_sentiment(clean_text),
        'claims': TextPreprocessor.extract_claims(clean_text),
        'entities': TextAnalyzer.extract_simple_entities(clean_text),
        'manipulation_indicators': TextAnalyzer.detect_manipulation_indicators(clean_text),
        'readability': TextAnalyzer.calculate_readability(clean_text),
    }
    
    # Add ML prediction if requested
    if use_ml:
        ml_model = get_text_ml_model()
        if ml_model:
            try:
                # Use meaningful sample for analysis
                text_sample = ' '.join(sentences[:10]) if sentences else clean_text[:2000]
                ml_prediction = ml_model.predict(text_sample, return_features=True)
                ml_explanation = ml_model.get_explanation(text_sample)
                
                result['ml_prediction'] = ml_prediction
                result['ml_explanation'] = ml_explanation
            except Exception as e:
                print(f"Error in ML prediction: {e}")
                result['ml_prediction'] = None
                result['ml_explanation'] = {'error': str(e)}
        else:
            result['ml_prediction'] = None
            result['ml_explanation'] = None
    
    # Convert numpy types to native Python types for JSON serialization
    return convert_numpy_types(result)
