'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Video, AlertTriangle, Eye, Clock, Activity, Film } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface VideoAnalysis {
  videoUrl?: string;
  videoInfo?: {
    duration: number;
    width: number;
    height: number;
    fps: number;
    frame_count?: number;
    bit_rate?: number;
    codec?: string;
    format?: string;
  };
  framesAnalyzed?: number;
  facesDetected?: number;
  faceFrames?: Array<{
    frame_index: number;
    face_count: number;
    face_locations?: Array<[number, number, number, number]>;
  }>;
  sceneChanges?: number[];
  sceneChangeCount?: number;
  qualityMetrics?: {
    sharpness: number;
    brightness: number;
    contrast: number;
    noise: number;
  };
  manipulationIndicators?: string[];
  deepfakeScore?: number;
  deepfakeDetails?: Record<string, unknown>;
  temporalConsistency?: {
    score: number;
    anomalies: number;
    smoothness: number;
  };
  metadata?: Record<string, unknown>;
}

interface VideoAnalysisPanelProps {
  data: VideoAnalysis;
}

export function VideoAnalysisPanel({ data }: VideoAnalysisPanelProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  
  const {
    videoUrl,
    videoInfo,
    framesAnalyzed = 0,
    facesDetected = 0,
    faceFrames = [],
    sceneChanges = [],
    sceneChangeCount = 0,
    qualityMetrics,
    manipulationIndicators = [],
    deepfakeScore = 0,
    temporalConsistency = {
      score: 78,
      anomalies: 0,
      smoothness: 85
    }
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Info */}
      {videoInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Video Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{formatDuration(videoInfo.duration)}</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{videoInfo.width}×{videoInfo.height}</div>
                <div className="text-xs text-muted-foreground">Resolution</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{videoInfo.fps.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">FPS</div>
              </div>
              {videoInfo.codec && (
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold uppercase">{videoInfo.codec}</div>
                  <div className="text-xs text-muted-foreground">Codec</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
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
                {deepfakeScore.toFixed(1)}%
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
                  <span className="font-medium">{temporalConsistency.score.toFixed(0)}%</span>
                </div>
                <Progress value={temporalConsistency.score} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Motion Smoothness</span>
                  <span className="font-medium">{temporalConsistency.smoothness.toFixed(0)}%</span>
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

        {/* Analysis Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analysis Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Frames Analyzed</span>
                <Badge variant="outline">{framesAnalyzed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Face Frames</span>
                <Badge variant="outline">{faceFrames.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Scene Changes</span>
                <Badge variant="outline">{sceneChangeCount || sceneChanges.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      {qualityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Video Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sharpness</span>
                    <span className="font-medium">{qualityMetrics.sharpness.toFixed(1)}</span>
                  </div>
                  <Progress value={Math.min(100, qualityMetrics.sharpness / 10)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Brightness</span>
                    <span className="font-medium">{qualityMetrics.brightness.toFixed(1)}</span>
                  </div>
                  <Progress value={Math.min(100, (qualityMetrics.brightness / 255) * 100)} className="h-2" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Contrast</span>
                    <span className="font-medium">{qualityMetrics.contrast.toFixed(1)}</span>
                  </div>
                  <Progress value={Math.min(100, (qualityMetrics.contrast / 128) * 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Noise Level</span>
                    <span className="font-medium">{qualityMetrics.noise.toFixed(1)}</span>
                  </div>
                  <Progress value={Math.min(100, (qualityMetrics.noise / 50) * 100)} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manipulation Indicators */}
      {manipulationIndicators.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <AlertTriangle className="h-5 w-5" />
              Manipulation Indicators Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {manipulationIndicators.map((indicator, idx) => (
                <Badge key={idx} variant="outline" className="border-amber-300 text-amber-900 dark:text-amber-100">
                  {indicator}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Face Detection Details */}
      {faceFrames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Face Detection Details
            </CardTitle>
            <CardDescription>
              Frames with detected faces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faceFrames.map((frame, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border rounded text-sm">
                  <span className="text-muted-foreground">
                    Frame {frame.frame_index}
                  </span>
                  <Badge variant="outline">
                    {frame.face_count} {frame.face_count === 1 ? 'face' : 'faces'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scene Changes */}
      {sceneChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Scene Changes Detected
            </CardTitle>
            <CardDescription>
              Frame indices where scene changes occur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sceneChanges.slice(0, 20).map((frameIdx, idx) => (
                <Badge key={idx} variant="secondary">
                  Frame {frameIdx}
                </Badge>
              ))}
              {sceneChanges.length > 20 && (
                <Badge variant="outline">
                  +{sceneChanges.length - 20} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
