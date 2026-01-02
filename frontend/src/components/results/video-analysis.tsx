'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Video, AlertTriangle, Eye, Clock, Activity } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface VideoAnalysis {
  videoUrl?: string;
  deepfakeScore?: number;
  facesDetected?: number;
  frameAnalysis?: Array<{
    timestamp: number;
    deepfakeScore: number;
    facesDetected: number;
    manipulation: string;
  }>;
  temporalConsistency?: {
    score: number;
    anomalies: number;
    smoothness: number;
  };
  manipulationIndicators?: {
    faceInconsistency: number;
    edgeArtifacts: number;
    compressionAnomalies: number;
    lightingIssues: number;
  };
  sceneBreakdown?: Array<{
    start: number;
    end: number;
    description: string;
    suspicious: boolean;
  }>;
}

interface VideoAnalysisPanelProps {
  data: VideoAnalysis;
}

export function VideoAnalysisPanel({ data }: VideoAnalysisPanelProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  
  const {
    videoUrl,
    deepfakeScore = 0,
    facesDetected = 0,
    frameAnalysis = [],
    temporalConsistency = {
      score: 78,
      anomalies: 3,
      smoothness: 85
    },
    manipulationIndicators = {
      faceInconsistency: 15,
      edgeArtifacts: 22,
      compressionAnomalies: 8,
      lightingIssues: 12
    },
    sceneBreakdown = []
  } = data;

  useEffect(() => {
    if (videoRef.current && videoUrl && typeof window !== 'undefined') {
      // Video.js would be initialized here
      // const videojs = require('video.js');
      // const player = videojs(videoRef.current, options);
    }
  }, [videoUrl]);

  const getDeepfakeLevel = (score: number) => {
    if (score < 30) return { label: 'Likely Authentic', color: 'text-green-600', bg: 'bg-green-50' };
    if (score < 70) return { label: 'Uncertain', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Likely Deepfake', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const deepfakeLevel = getDeepfakeLevel(deepfakeScore);

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Player
          </CardTitle>
          <CardDescription>
            Interactive player with frame-by-frame analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for Video.js */}
            <div 
              ref={videoRef} 
              className="w-full aspect-video bg-black rounded-lg flex items-center justify-center border-2"
            >
              <div className="text-center text-white/70">
                <Video className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Video player</p>
                {!videoUrl && <p className="text-xs mt-1">No video URL provided</p>}
              </div>
            </div>
            
            {/* Timeline with deepfake scores */}
            {frameAnalysis.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Frame-by-Frame Analysis</div>
                <div className="h-16 bg-muted rounded flex items-end gap-px overflow-hidden">
                  {frameAnalysis.map((frame, idx) => (
                    <div
                      key={idx}
                      className="flex-1 transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${frame.deepfakeScore}%`,
                        backgroundColor: frame.deepfakeScore > 70 ? '#ef4444' : frame.deepfakeScore > 40 ? '#eab308' : '#22c55e'
                      }}
                      title={`${frame.timestamp}s: ${frame.deepfakeScore}% suspicious`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Start</span>
                  <span>Timeline</span>
                  <span>End</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Deepfake Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deepfake Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-center p-4 rounded-lg ${deepfakeLevel.bg} dark:bg-opacity-20`}>
              <div className={`text-4xl font-bold ${deepfakeLevel.color}`}>
                {deepfakeScore}%
              </div>
              <div className="text-sm font-medium mt-1">
                {deepfakeLevel.label}
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{facesDetected} faces detected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temporal Consistency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Temporal Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consistency Score</span>
                  <span className="font-medium">{temporalConsistency.score}%</span>
                </div>
                <Progress value={temporalConsistency.score} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Motion Smoothness</span>
                  <span className="font-medium">{temporalConsistency.smoothness}%</span>
                </div>
                <Progress value={temporalConsistency.smoothness} className="h-2" />
              </div>
              <div className="pt-2 text-center text-sm">
                <span className="text-amber-600 font-medium">{temporalConsistency.anomalies}</span>
                <span className="text-muted-foreground ml-1">anomalies detected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manipulation Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {Object.entries(manipulationIndicators).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge 
                    variant={value > 50 ? 'destructive' : value > 25 ? 'secondary' : 'outline'}
                  >
                    {value}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scene Breakdown */}
      {sceneBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Scene-by-Scene Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sceneBreakdown.map((scene, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border ${
                    scene.suspicious 
                      ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20' 
                      : 'bg-card'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground">
                      {scene.start.toFixed(1)}s - {scene.end.toFixed(1)}s
                    </span>
                    {scene.suspicious && (
                      <Badge variant="outline" className="text-amber-700 border-amber-300">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Suspicious
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">{scene.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
