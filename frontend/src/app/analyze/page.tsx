'use client';

import { MainLayout } from '@/components/layout';
import { FileUpload } from '@/components/upload';
import { useState, useEffect, useRef } from 'react';
import { uploadFile, UploadProgress } from '@/lib/api';
import { Loader2, CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface UploadStatus {
  filename: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  analysisId?: string;
  fileType?: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, UploadStatus>>({});
  const [isUploading, setIsUploading] = useState(false);
  const pollIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Cleanup polling intervals on unmount
  useEffect(() => {
    const currentIntervals = pollIntervalsRef.current;
    return () => {
      Object.values(currentIntervals).forEach(interval => clearInterval(interval));
    };
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    // Clear previous upload statuses when new files are selected
    setUploadStatuses({});
  };

  const handleStartAnalysis = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    for (const file of selectedFiles) {
      const fileId = `${file.name}-${Date.now()}-${Math.random()}`;
      
      setUploadStatuses((prev) => ({
        ...prev,
        [fileId]: {
          filename: file.name,
          status: 'uploading',
          progress: 0,
        },
      }));

      try {
        // Determine endpoint based on file type
        let endpoint: 'text' | 'audio' | 'video' = 'text';
        if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
          endpoint = 'audio';
        } else if (file.type.startsWith('video/') || file.name.match(/\.(mp4|avi|mov|webm)$/i)) {
          endpoint = 'video';
        } else if (file.type.startsWith('text/') || file.name.match(/\.(txt|pdf|docx)$/i)) {
          endpoint = 'text';
        }

        // Upload file
        const result = await uploadFile(
          file,
          endpoint,
          (progress: UploadProgress) => {
            setUploadStatuses((prev) => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                progress: progress.progress,
              },
            }));
          }
        );

        // Set to processing state
        setUploadStatuses((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'processing',
            progress: 100,
            message: 'Analysis in progress...',
            analysisId: result.id,
            fileType: endpoint,
          },
        }));

        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const { getAnalysisResult } = await import('@/lib/api');
            const analysisResult = await getAnalysisResult(result.id, endpoint);
            
            if (analysisResult.status === 'completed') {
              clearInterval(pollInterval);
              delete pollIntervalsRef.current[fileId];
              setUploadStatuses((prev) => ({
                ...prev,
                [fileId]: {
                  ...prev[fileId],
                  status: 'completed',
                  message: 'Analysis complete!',
                },
              }));
            } else if (analysisResult.status === 'failed') {
              clearInterval(pollInterval);
              delete pollIntervalsRef.current[fileId];
              setUploadStatuses((prev) => ({
                ...prev,
                [fileId]: {
                  ...prev[fileId],
                  status: 'error',
                  message: 'Analysis failed',
                },
              }));
            }
          } catch (error) {
            console.error('Polling error:', error);
          }
        }, 2000); // Poll every 2 seconds

        // Store interval reference
        pollIntervalsRef.current[fileId] = pollInterval;

        // Cleanup after 5 minutes
        setTimeout(() => {
          if (pollIntervalsRef.current[fileId]) {
            clearInterval(pollIntervalsRef.current[fileId]);
            delete pollIntervalsRef.current[fileId];
          }
        }, 300000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadStatuses((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'error',
            message: errorMessage,
          },
        }));
      }
    }

    setIsUploading(false);
  };

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-7xl py-8 md:py-12">
        <div className="mx-auto space-y-8">
          {/* Hero Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Analyze Content</h1>
            <p className="text-lg text-muted-foreground">
              Upload text, audio, or video files to detect fake news and deepfakes using advanced AI models.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                  <CardDescription>
                    Select up to 5 files for analysis. Supports text, audio, and video formats.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onFilesSelected={handleFilesSelected} maxFiles={5} />
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-6 flex justify-end">
                      <Button 
                        onClick={handleStartAnalysis}
                        disabled={isUploading}
                        size="lg"
                        className="gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            Start Analysis
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upload Status */}
              {Object.keys(uploadStatuses).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Progress</CardTitle>
                    <CardDescription>
                      Track the status of your file uploads and analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(uploadStatuses).map(([id, status]) => (
                      <div key={id} className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="mt-0.5">
                              {getStatusIcon(status.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{status.filename}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={
                                    status.status === 'completed' ? 'default' : 
                                    status.status === 'error' ? 'destructive' : 
                                    'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {status.status === 'uploading' ? 'Uploading' :
                                   status.status === 'processing' ? 'Processing' :
                                   status.status === 'completed' ? 'Completed' :
                                   'Error'}
                                </Badge>
                                {status.message && (
                                  <span className="text-xs text-muted-foreground">{status.message}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium tabular-nums">{status.progress}%</span>
                            {status.status === 'completed' && status.analysisId && status.fileType && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/results/${status.analysisId}?type=${status.fileType}`)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                        <Progress value={status.progress} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Instructions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { step: '1', title: 'Upload Files', desc: 'Drag and drop or select your files' },
                      { step: '2', title: 'AI Analysis', desc: 'Our models analyze for misinformation' },
                      { step: '3', title: 'View Results', desc: 'Get detailed credibility scores' },
                      { step: '4', title: 'Explore Data', desc: 'Visualize confidence and evidence' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Important Note</p>
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        Analysis results are for informational purposes. Always verify important claims from multiple reliable sources.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
