'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Volume2, AlertTriangle, FileAudio, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AudioAnalysis {
  audioUrl?: string;
  transcription?: string;
  confidence?: number;
  deepfakeScore?: number;
  deepfakeDetails?: {
    authenticityScore: number;
    spectralAnomalies: number;
    artifacts: number;
  };
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
    suspicious: boolean;
  }>;
  speakers?: Array<{
    id: string;
    duration: number;
    percentage: number;
  }>;
}

interface AudioAnalysisPanelProps {
  data: AudioAnalysis;
}

export function AudioAnalysisPanel({ data }: AudioAnalysisPanelProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  
  const {
    audioUrl,
    transcription = 'No transcription available',
    confidence = 0,
    deepfakeScore = 0,
    deepfakeDetails = {
      authenticityScore: 85,
      spectralAnomalies: 12,
      artifacts: 8
    },
    segments = [],
    speakers = []
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

  return (
    <div className="space-y-6">
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
                  {deepfakeScore}%
                </div>
                <div className="text-sm font-medium mt-1">
                  {deepfakeLevel.label}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Authenticity Score</span>
                    <span className="font-medium">{deepfakeDetails.authenticityScore}%</span>
                  </div>
                  <Progress value={deepfakeDetails.authenticityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Spectral Anomalies</span>
                    <span className="font-medium">{deepfakeDetails.spectralAnomalies}%</span>
                  </div>
                  <Progress value={deepfakeDetails.spectralAnomalies} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Artifacts Detected</span>
                    <span className="font-medium">{deepfakeDetails.artifacts}%</span>
                  </div>
                  <Progress value={deepfakeDetails.artifacts} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcription Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transcription Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {confidence}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Overall Confidence
                </div>
              </div>
              <Progress value={confidence} className="h-2" />
              {speakers.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Speakers Detected: {speakers.length}
                  </div>
                  {speakers.map((speaker) => (
                    <div key={speaker.id} className="text-xs text-muted-foreground mb-1">
                      {speaker.id}: {speaker.percentage}% of audio
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transcription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Transcription
            {confidence > 0 && (
              <Badge variant="outline">
                {confidence}% confidence
              </Badge>
            )}
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

      {/* Suspicious Segments */}
      {segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Suspicious Audio Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {segments.filter(s => s.suspicious).map((segment, idx) => (
                <div key={idx} className="p-3 border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground">
                      {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s
                    </span>
                    <Badge variant="outline" className="text-amber-700 border-amber-300">
                      {segment.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="text-sm">&quot;{segment.text}&quot;</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
