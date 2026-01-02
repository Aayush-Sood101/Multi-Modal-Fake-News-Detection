'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Volume2, AlertTriangle, FileAudio, Activity, Signal } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AudioAnalysis {
  audioUrl?: string;
  transcription?: string;
  transcriptionConfidence?: number;
  transcriptionLanguage?: string;
  transcriptionSegments?: Array<{
    start: number;
    end: number;
    text: string;
    confidence?: number;
  }>;
  audioInfo?: {
    duration: number;
    sample_rate: number;
    channels: number;
    bit_rate?: number;
    codec?: string;
  };
  quality?: {
    snrDb: number;
    dynamicRangeDb: number;
    clippingPercentage: number;
    hasSignificantClipping: boolean;
  };
  silenceSegments?: Array<{
    start: number;
    end: number;
    duration: number;
  }>;
  deepfakeScore?: number;
  deepfakeDetails?: {
    authenticityScore: number;
    spectralAnomalies: number;
    artifacts: number;
    confidence?: number;
  };
  features?: Record<string, number>;
}

interface AudioAnalysisPanelProps {
  data: AudioAnalysis;
}

export function AudioAnalysisPanel({ data }: AudioAnalysisPanelProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  
  const {
    audioUrl,
    transcription = 'No transcription available',
    transcriptionConfidence = 0,
    transcriptionLanguage,
    transcriptionSegments = [],
    audioInfo,
    quality,
    silenceSegments = [],
    deepfakeScore = 0,
    deepfakeDetails = {
      authenticityScore: 85,
      spectralAnomalies: 12,
      artifacts: 8
    }
  } = data;

  useEffect(() => {
    if (waveformRef.current && audioUrl && typeof window !== 'undefined') {
      // WaveSurfer.js would be initialized here
      // For now, we'll show a placeholder
      // const WaveSurfer = require('wavesurfer.js');
      // const wavesurfer = WaveSurfer.create({...});
    }
  }, [audioUrl]);

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
      {/* Audio Info */}
      {audioInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileAudio className="h-5 w-5" />
              Audio Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{formatDuration(audioInfo.duration)}</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{(audioInfo.sample_rate / 1000).toFixed(0)}kHz</div>
                <div className="text-xs text-muted-foreground">Sample Rate</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{audioInfo.channels}</div>
                <div className="text-xs text-muted-foreground">Channels</div>
              </div>
              {audioInfo.codec && (
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold uppercase">{audioInfo.codec}</div>
                  <div className="text-xs text-muted-foreground">Codec</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Waveform Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Waveform
          </CardTitle>
          <CardDescription>
            Visual representation with deepfake probability indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for WaveSurfer.js */}
            <div 
              ref={waveformRef} 
              className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed"
            >
              <div className="text-center text-muted-foreground">
                <FileAudio className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Audio waveform visualization</p>
                {!audioUrl && <p className="text-xs mt-1">No audio URL provided</p>}
              </div>
            </div>
            
            {/* Playback controls would go here */}
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                disabled={!audioUrl}
              >
                Play
              </button>
              <div className="text-sm text-muted-foreground">
                Duration: --:--
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Deepfake Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deepfake Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`text-center p-4 rounded-lg ${deepfakeLevel.bg} dark:bg-opacity-20`}>
                <div className={`text-3xl font-bold ${deepfakeLevel.color}`}>
                  {deepfakeScore.toFixed(1)}%
                </div>
                <div className="text-sm font-medium mt-1">
                  {deepfakeLevel.label}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Authenticity Score</span>
                    <span className="font-medium">{deepfakeDetails.authenticityScore.toFixed(1)}%</span>
                  </div>
                  <Progress value={deepfakeDetails.authenticityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Spectral Anomalies</span>
                    <span className="font-medium">{deepfakeDetails.spectralAnomalies.toFixed(1)}%</span>
                  </div>
                  <Progress value={deepfakeDetails.spectralAnomalies} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Artifacts Detected</span>
                    <span className="font-medium">{deepfakeDetails.artifacts.toFixed(1)}%</span>
                  </div>
                  <Progress value={deepfakeDetails.artifacts} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio Quality */}
        {quality && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Signal className="h-5 w-5" />
                Audio Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Signal-to-Noise Ratio</span>
                    <span className="font-medium">{quality.snrDb.toFixed(1)} dB</span>
                  </div>
                  <Progress value={Math.min(100, (quality.snrDb / 40) * 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Dynamic Range</span>
                    <span className="font-medium">{quality.dynamicRangeDb.toFixed(1)} dB</span>
                  </div>
                  <Progress value={Math.min(100, (quality.dynamicRangeDb / 96) * 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Clipping</span>
                    <span className="font-medium">{quality.clippingPercentage.toFixed(2)}%</span>
                  </div>
                  <Progress value={Math.min(100, quality.clippingPercentage * 10)} className="h-2" />
                </div>
                {quality.hasSignificantClipping && (
                  <Badge variant="destructive" className="w-full justify-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Significant Clipping Detected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transcription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <span>Transcription</span>
            <div className="flex gap-2">
              {transcriptionLanguage && (
                <Badge variant="outline">{transcriptionLanguage.toUpperCase()}</Badge>
              )}
              {transcriptionConfidence > 0 && (
                <Badge variant="outline">
                  {(transcriptionConfidence * 100).toFixed(0)}% confidence
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
              {transcription}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Silence Segments */}
      {silenceSegments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Silence Segments ({silenceSegments.length})
            </CardTitle>
            <CardDescription>
              Periods of silence detected in the audio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {silenceSegments.map((segment, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border rounded text-sm">
                  <span className="text-muted-foreground">
                    {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s
                  </span>
                  <Badge variant="outline">
                    {segment.duration.toFixed(2)}s
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription Segments */}
      {transcriptionSegments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Transcription Segments
            </CardTitle>
            <CardDescription>
              Time-aligned transcription segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transcriptionSegments.map((segment, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground">
                      {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s
                    </span>
                    {segment.confidence !== undefined && (
                      <Badge variant="outline">
                        {(segment.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">{segment.text}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
