'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, MessageSquare, TrendingUp, User, Hash, Brain, FileText } from 'lucide-react';

interface TextAnalysis {
  text?: string;
  fullTextLength?: number;
  wordCount?: number;
  sentenceCount?: number;
  suspiciousSegments?: Array<{ text: string; score: number; reason: string }>;
  sentiment?: { 
    label: string; 
    score: number;
    positiveCount?: number;
    negativeCount?: number;
  };
  claims?: string[];
  linguisticFeatures?: {
    sensationalism: number;
    emotionalManipulation: number;
    complexity: number;
    excessivePunctuation?: boolean;
    excessiveCapitalization?: boolean;
    conspiracyLanguage?: boolean;
  };
  entities?: Array<{ text: string; type: string; confidence?: number }>;
  frequentTerms?: Array<{ term: string; count: number }>;
  manipulationIndicators?: string[];
  readability?: {
    avg_word_length: number;
    avg_sentence_length: number;
    flesch_reading_ease: number;
  };
  mlPrediction?: {
    fakeProb: number;
    realProb: number;
    confidence: number;
    prediction: string;
  };
  mlExplanation?: Record<string, unknown>;
}

interface TextAnalysisPanelProps {
  data: TextAnalysis;
}

export function TextAnalysisPanel({ data }: TextAnalysisPanelProps) {
  const {
    text = 'No text content available',
    fullTextLength,
    wordCount,
    sentenceCount,
    suspiciousSegments = [],
    sentiment = { label: 'Neutral', score: 50 },
    claims = [],
    linguisticFeatures = {
      sensationalism: 0,
      emotionalManipulation: 0,
      complexity: 50
    },
    entities = [],
    frequentTerms = [],
    manipulationIndicators = [],
    readability,
    mlPrediction
  } = data;

  const getSentimentColor = (score: number) => {
    if (score > 60) return 'text-green-600';
    if (score > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIndicatorLabel = (indicator: string) => {
    const labels: Record<string, string> = {
      'sensational_language': 'Sensational Language',
      'emotional_manipulation': 'Emotional Manipulation',
      'excessive_capitalization': 'Excessive Capitalization',
      'excessive_punctuation': 'Excessive Punctuation',
      'conspiracy_language': 'Conspiracy Language'
    };
    return labels[indicator] || indicator;
  };

  return (
    <div className="space-y-6">
      {/* ML Prediction Results */}
      {mlPrediction && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Model Prediction
            </CardTitle>
            <CardDescription>
              Machine learning-based fake news detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fake Probability</span>
                    <span className="font-medium text-red-600">{(mlPrediction.fakeProb * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={mlPrediction.fakeProb * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Real Probability</span>
                    <span className="font-medium text-green-600">{(mlPrediction.realProb * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={mlPrediction.realProb * 100} className="h-2" />
                </div>
              </div>
              <div className="flex flex-col justify-center items-center p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Prediction</div>
                <Badge 
                  variant={mlPrediction.prediction === 'FAKE' ? 'destructive' : 'default'}
                  className="text-lg px-4 py-1"
                >
                  {mlPrediction.prediction}
                </Badge>
                <div className="text-xs text-muted-foreground mt-2">
                  Confidence: {(mlPrediction.confidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Statistics */}
      {(wordCount || sentenceCount || fullTextLength) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {wordCount && (
                <div>
                  <div className="text-2xl font-bold">{wordCount}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
              )}
              {sentenceCount && (
                <div>
                  <div className="text-2xl font-bold">{sentenceCount}</div>
                  <div className="text-sm text-muted-foreground">Sentences</div>
                </div>
              )}
              {fullTextLength && (
                <div>
                  <div className="text-2xl font-bold">{fullTextLength}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manipulation Indicators */}
      {manipulationIndicators.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <AlertCircle className="h-5 w-5" />
              Manipulation Indicators Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {manipulationIndicators.map((indicator, idx) => (
                <Badge key={idx} variant="outline" className="border-amber-300 text-amber-900 dark:text-amber-100">
                  {getIndicatorLabel(indicator)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Text Content with Highlighted Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Text Content Analysis
          </CardTitle>
          <CardDescription>
            Original text with suspicious segments highlighted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
              {text}
            </div>
          </div>
          {suspiciousSegments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Suspicious Segments ({suspiciousSegments.length})
              </h4>
              {suspiciousSegments.map((segment, idx) => (
                <div key={idx} className="p-3 border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 rounded-lg">
                  <div className="text-sm mb-1">&quot;{segment.text}&quot;</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-amber-700 border-amber-300">
                      {segment.score}% suspicious
                    </Badge>
                    <span>{segment.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getSentimentColor(sentiment.score)}`}>
                  {sentiment.label}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Confidence: {sentiment.score}%
                </div>
              </div>
              <Progress value={sentiment.score} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linguistic Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Linguistic Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sensationalism</span>
                  <span className="font-medium">{linguisticFeatures.sensationalism}%</span>
                </div>
                <Progress 
                  value={linguisticFeatures.sensationalism} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Emotional Manipulation</span>
                  <span className="font-medium">{linguisticFeatures.emotionalManipulation}%</span>
                </div>
                <Progress 
                  value={linguisticFeatures.emotionalManipulation} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Readability (Flesch Score)</span>
                  <span className="font-medium">{linguisticFeatures.complexity.toFixed(0)}</span>
                </div>
                <Progress 
                  value={linguisticFeatures.complexity} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Difficult</span>
                  <span>Easy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Readability Metrics */}
      {readability && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Readability Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{readability.avg_word_length.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Word Length</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{readability.avg_sentence_length.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Sentence Length</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{readability.flesch_reading_ease.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Flesch Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Claims */}
      {claims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Claims Extracted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {claims.map((claim, idx) => (
                <li key={idx} className="flex gap-2 p-3 border rounded-lg bg-card">
                  <Badge variant="outline" className="flex-shrink-0">{idx + 1}</Badge>
                  <span className="text-sm">{claim}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Named Entities */}
      {entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Named Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entities.map((entity, idx) => (
                <Badge key={idx} variant="secondary">
                  <span className="font-medium">{entity.text}</span>
                  <span className="ml-1 text-xs text-muted-foreground">({entity.type})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frequent Terms */}
      {frequentTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Frequent Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {frequentTerms.map((term, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {term.term}
                  <span className="ml-1 text-xs font-normal">×{term.count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
