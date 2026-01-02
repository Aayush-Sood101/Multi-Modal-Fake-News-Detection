'use client';

import { MainLayout } from '@/components/layout';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CredibilityScore,
  ConfidenceBreakdown,
  DetectionCategories,
  TextAnalysisPanel,
  AudioAnalysisPanel,
  VideoAnalysisPanel,
  SourceCredibility,
  SourceNetwork,
  TemporalAnalysis,
} from '@/components/results';
import { 
  FileText, 
  Volume2, 
  Video, 
  Download, 
  Share2, 
  ArrowLeft, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { getAnalysisResult } from '@/lib/api';

// Mock data structure - replace with actual API calls
interface AnalysisResult {
  id: string;
  overallScore: number;
  confidence: number;
  modalityScores: {
    text?: number;
    audio?: number;
    video?: number;
  };
  textAnalysis?: Record<string, unknown>;
  audioAnalysis?: Record<string, unknown>;
  videoAnalysis?: Record<string, unknown>;
  sourceProfile?: Record<string, unknown>;
  temporalData?: {
    propagation?: Array<{
      date: string;
      mentions: number;
      shares: number;
      credibilityScore: number;
    }>;
    timeline?: Array<{
      claim: string;
      firstAppearance: string;
      peakPropagation: string;
      currentStatus: 'spreading' | 'declining' | 'debunked' | 'verified';
    }>;
  };
  timestamp: string;
}

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const fileType = searchParams?.get('type') as 'text' | 'audio' | 'video' | null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id || !fileType) {
        setError('Missing analysis ID or file type');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch real results from backend
        console.log(`Fetching results for ID: ${id}, Type: ${fileType}`);
        const data = await getAnalysisResult(id, fileType);
        console.log('Received data:', data);
        
        // Check if analysis is still processing
        if (data.status === 'processing') {
          // Poll again after a delay
          setTimeout(() => fetchResults(), 2000);
          setResults({
            id: data.id,
            overallScore: 0,
            confidence: 0,
            modalityScores: {},
            timestamp: data.uploaded_at || new Date().toISOString(),
          });
          return;
        }
        
        // Transform backend response to match our UI structure
        const transformedResult: AnalysisResult = {
          id: data.id,
          overallScore: data.credibility_score || 0,
          confidence: (data.confidence || 0) * 100,
          modalityScores: {
            [fileType]: data.credibility_score || 0,
          },
          timestamp: data.uploaded_at || new Date().toISOString(),
        };

        // Transform data based on file type
        if (fileType === 'text' && data.result_data) {
          const resultData = data.result_data;
          const mlPrediction = resultData.ml_prediction || {};
          const sentiment = resultData.sentiment || {};
          const readability = resultData.readability || {};
          
          // Calculate linguistic features from manipulation indicators
          const manipulationIndicators = resultData.manipulation_indicators || [];
          
          transformedResult.textAnalysis = {
            text: resultData.text || resultData.full_text || '',
            fullTextLength: resultData.full_text_length,
            wordCount: resultData.word_count,
            sentenceCount: resultData.sentence_count,
            suspiciousSegments: [],
            sentiment: {
              label: sentiment.sentiment || 'neutral',
              score: (sentiment.confidence || 0.5) * 100,
              positiveCount: sentiment.positive_count || 0,
              negativeCount: sentiment.negative_count || 0
            },
            claims: resultData.claims || [],
            linguisticFeatures: {
              sensationalism: manipulationIndicators.includes('sensational_language') ? 75 : 25,
              emotionalManipulation: manipulationIndicators.includes('emotional_manipulation') ? 80 : 20,
              complexity: readability.flesch_reading_ease || 50,
              excessivePunctuation: manipulationIndicators.includes('excessive_punctuation'),
              excessiveCapitalization: manipulationIndicators.includes('excessive_capitalization'),
              conspiracyLanguage: manipulationIndicators.includes('conspiracy_language')
            },
            entities: resultData.entities || [],
            frequentTerms: [],
            manipulationIndicators: manipulationIndicators,
            readability: readability,
            mlPrediction: mlPrediction.fake_probability !== undefined ? {
              fakeProb: mlPrediction.fake_probability,
              realProb: mlPrediction.real_probability,
              confidence: mlPrediction.confidence,
              prediction: mlPrediction.prediction
            } : undefined,
            mlExplanation: resultData.ml_explanation
          };
        } else if (fileType === 'audio' && data.result_data) {
          const resultData = data.result_data;
          const transcription = resultData.transcription || {};
          const quality = resultData.quality || {};
          const deepfakeDetection = resultData.deepfake_detection || {};
          
          // Transform audio transcription object to string
          const transcriptionText = typeof transcription === 'object' 
            ? transcription.text || 'No transcription available'
            : transcription || 'No transcription available';
          
          transformedResult.audioAnalysis = {
            transcription: transcriptionText,
            transcriptionConfidence: transcription.confidence || 0,
            transcriptionLanguage: transcription.language,
            transcriptionSegments: transcription.segments || [],
            audioInfo: resultData.audio_info,
            quality: {
              snrDb: quality.snr_db,
              dynamicRangeDb: quality.dynamic_range_db,
              clippingPercentage: quality.clipping_percentage,
              hasSignificantClipping: quality.has_significant_clipping
            },
            silenceSegments: resultData.silence_segments || [],
            deepfakeScore: deepfakeDetection.score || 0,
            deepfakeDetails: {
              authenticityScore: deepfakeDetection.authenticity_score || (100 - (deepfakeDetection.score || 0)),
              spectralAnomalies: deepfakeDetection.spectral_anomalies || 0,
              artifacts: deepfakeDetection.artifacts || 0,
              confidence: deepfakeDetection.confidence || 0
            },
            features: resultData.features
          };
        } else if (fileType === 'video' && data.result_data) {
          const resultData = data.result_data;
          const deepfakeDetection = resultData.deepfake_detection || {};
          const temporalAnalysis = resultData.temporal_analysis || {};
          
          transformedResult.videoAnalysis = {
            videoInfo: resultData.video_info,
            framesAnalyzed: resultData.frames_analyzed || 0,
            facesDetected: resultData.faces_detected || 0,
            faceFrames: resultData.face_frames || [],
            sceneChanges: resultData.scene_changes || [],
            sceneChangeCount: resultData.scene_change_count || 0,
            qualityMetrics: resultData.quality_metrics || {},
            manipulationIndicators: resultData.manipulation_indicators || [],
            deepfakeScore: deepfakeDetection.score || 0,
            deepfakeDetails: deepfakeDetection,
            temporalConsistency: {
              score: temporalAnalysis.score || 78,
              anomalies: temporalAnalysis.anomalies || 0,
              smoothness: temporalAnalysis.smoothness || 85
            },
            metadata: resultData.metadata || {}
          };
        }
        
        setResults(transformedResult);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to load analysis results';
        
        // Check if it's a 404 error
        if (errorMsg.includes('404')) {
          setError('Analysis not found. It may have been deleted or the backend was restarted.');
        } else if (errorMsg.includes('Network Error')) {
          setError('Cannot connect to backend server. Please make sure it is running on http://localhost:8000');
        } else {
          setError(errorMsg);
        }
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, fileType]);

  const handleExportPDF = () => {
    // Implement PDF export using jspdf
    console.log('Exporting to PDF...');
  };

  const handleExportJSON = () => {
    if (results) {
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis-${id}.json`;
      link.click();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading analysis results...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !results) {
    return (
      <MainLayout>
        <div className="container max-w-7xl py-12">
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold mb-2">Error Loading Results</h2>
              <p className="text-muted-foreground mb-4">{error || 'Analysis not found'}</p>
              <Link href="/analyze">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const hasText = !!results.textAnalysis;
  const hasAudio = !!results.audioAnalysis;
  const hasVideo = !!results.videoAnalysis;

  return (
    <MainLayout>
      <div className="container max-w-7xl py-8 md:py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Link href="/analyze">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Analysis
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Analysis Results
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline">ID: {id}</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(results.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Dashboard Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <CredibilityScore score={results.overallScore} confidence={results.confidence} />
            <div className="md:col-span-2">
              <ConfidenceBreakdown scores={results.modalityScores} />
            </div>
          </div>

          <DetectionCategories 
            textAnalysis={results.textAnalysis}
            audioAnalysis={results.audioAnalysis}
            videoAnalysis={results.videoAnalysis}
          />

          {/* Detailed Analysis Tabs */}
          <Card>
            <Tabs defaultValue={hasText ? 'text' : hasAudio ? 'audio' : 'video'} className="w-full">
              <div className="border-b">
                <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0 h-auto">
                  {hasText && (
                    <TabsTrigger 
                      value="text" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Text Analysis
                    </TabsTrigger>
                  )}
                  {hasAudio && (
                    <TabsTrigger 
                      value="audio"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Audio Analysis
                    </TabsTrigger>
                  )}
                  {hasVideo && (
                    <TabsTrigger 
                      value="video"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video Analysis
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <CardContent className="pt-6">
                {hasText && (
                  <TabsContent value="text" className="mt-0">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextAnalysisPanel data={results.textAnalysis as any} />
                  </TabsContent>
                )}
                {hasAudio && (
                  <TabsContent value="audio" className="mt-0">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <AudioAnalysisPanel data={results.audioAnalysis as any} />
                  </TabsContent>
                )}
                {hasVideo && (
                  <TabsContent value="video" className="mt-0">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <VideoAnalysisPanel data={results.videoAnalysis as any} />
                  </TabsContent>
                )}
              </CardContent>
            </Tabs>
          </Card>

          {/* Advanced Features */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Only show these if we have source data - currently not implemented in backend */}
            {results.sourceProfile && (
              <>
                <SourceCredibility profile={results.sourceProfile} />
                <SourceNetwork />
              </>
            )}
          </div>

          {/* Temporal Analysis - only show if data is available */}
          <TemporalAnalysis 
            propagation={results.temporalData?.propagation}
            timeline={results.temporalData?.timeline}
          />
        </div>
      </div>
    </MainLayout>
  );
}
