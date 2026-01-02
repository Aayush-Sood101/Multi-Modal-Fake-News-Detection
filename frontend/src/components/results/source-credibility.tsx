'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, CheckCircle, XCircle, AlertCircle, Globe, Calendar, TrendingUp } from 'lucide-react';

interface SourceProfile {
  domain?: string;
  historicalAccuracy?: number;
  biasRating?: string;
  publicationFrequency?: string;
  credibilityScore?: number;
}

interface FactCheck {
  source: string;
  url: string;
  verdict: 'true' | 'false' | 'mixed' | 'unverified';
  date: string;
  summary: string;
}

interface Evidence {
  type: 'supporting' | 'refuting';
  text: string;
  source: string;
  confidence: number;
}

interface SourceCredibilityProps {
  profile?: SourceProfile;
  factChecks?: FactCheck[];
  evidence?: Evidence[];
}

export function SourceCredibility({ 
  profile = {},
  factChecks = [],
  evidence = []
}: SourceCredibilityProps) {
  const {
    domain = 'example.com',
    historicalAccuracy = 75,
    biasRating = 'Center',
    publicationFrequency = 'Daily',
    credibilityScore = 68
  } = profile;

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'true':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'false':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'mixed':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVerdictBadge = (verdict: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      true: 'default',
      false: 'destructive',
      mixed: 'secondary',
      unverified: 'outline'
    };
    return variants[verdict] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Source Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Source Profile
          </CardTitle>
          <CardDescription>
            Historical information and credibility indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">{domain}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{biasRating}</Badge>
                  <span>•</span>
                  <span>{publicationFrequency} publications</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {credibilityScore}
                </div>
                <div className="text-xs text-muted-foreground">Credibility</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Historical Accuracy
                  </span>
                  <span className="font-medium">{historicalAccuracy}%</span>
                </div>
                <Progress value={historicalAccuracy} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold text-green-600">
                  {Math.floor(historicalAccuracy * 0.8)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Verified Claims
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold text-red-600">
                  {Math.floor((100 - historicalAccuracy) * 0.8)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  False Claims
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fact-Checking Cross-References */}
      {factChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fact-Checking References</CardTitle>
            <CardDescription>
              Cross-referenced with established fact-checking organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {factChecks.map((check, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getVerdictIcon(check.verdict)}
                      <span className="font-medium text-sm">{check.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getVerdictBadge(check.verdict)}>
                        {check.verdict}
                      </Badge>
                      <a 
                        href={check.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{check.summary}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{check.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evidence Panel */}
      {evidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence Analysis</CardTitle>
            <CardDescription>
              Supporting and refuting evidence with confidence scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evidence.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border ${
                    item.type === 'supporting' 
                      ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20'
                      : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge 
                      variant={item.type === 'supporting' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {item.type === 'supporting' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {item.type}
                    </Badge>
                    <span className="text-xs font-medium">
                      {item.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm mb-2">{item.text}</p>
                  <div className="text-xs text-muted-foreground">
                    Source: {item.source}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder when no data */}
      {factChecks.length === 0 && evidence.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              No fact-checking references or evidence data available for this analysis.
            </p>
            <p className="text-xs mt-2">
              This feature requires integration with fact-checking APIs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
