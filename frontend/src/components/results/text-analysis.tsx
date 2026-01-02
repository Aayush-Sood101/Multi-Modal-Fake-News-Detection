'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, MessageSquare, TrendingUp, User, Hash } from 'lucide-react';

interface TextAnalysis {
  text?: string;
  suspiciousSegments?: Array<{ text: string; score: number; reason: string }>;
  sentiment?: { label: string; score: number };
  claims?: string[];
  linguisticFeatures?: {
    sensationalism: number;
    emotionalManipulation: number;
    complexity: number;
  };
  entities?: Array<{ text: string; type: string }>;
  frequentTerms?: Array<{ term: string; count: number }>;
}

interface TextAnalysisPanelProps {
  data: TextAnalysis;
}

export function TextAnalysisPanel({ data }: TextAnalysisPanelProps) {
  const {
    text = 'No text content available',
    suspiciousSegments = [],
    sentiment = { label: 'Neutral', score: 50 },
    claims = [],
    linguisticFeatures = {
      sensationalism: 45,
      emotionalManipulation: 38,
      complexity: 62
    },
    entities = [],
    frequentTerms = []
  } = data;

  const getSentimentColor = (score: number) => {
    if (score > 60) return 'text-green-600';
    if (score > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
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
              {Object.entries(linguisticFeatures).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
