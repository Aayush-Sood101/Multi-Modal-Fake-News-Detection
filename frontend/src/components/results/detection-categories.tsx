'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DetectionCategory {
  type: string;
  count: number;
  certainty: number;
}

interface DetectionCategoriesProps {
  textAnalysis?: {
    manipulationIndicators?: string[];
    mlPrediction?: {
      prediction: string;
      confidence: number;
    };
  };
  audioAnalysis?: {
    quality?: {
      hasSignificantClipping: boolean;
      snrDb: number;
    };
    deepfakeScore?: number;
  };
  videoAnalysis?: {
    manipulationIndicators?: string[];
    deepfakeScore?: number;
  };
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#3b82f6'];

export function DetectionCategories({ textAnalysis, audioAnalysis, videoAnalysis }: DetectionCategoriesProps) {
  // Build categories from actual analysis data
  const categories: DetectionCategory[] = [];
  
  // Text manipulation indicators
  if (textAnalysis?.manipulationIndicators) {
    const indicators = textAnalysis.manipulationIndicators;
    if (indicators.includes('sensational_language')) {
      categories.push({ type: 'Sensational Language', count: 1, certainty: 85 });
    }
    if (indicators.includes('emotional_manipulation')) {
      categories.push({ type: 'Emotional Manipulation', count: 1, certainty: 80 });
    }
    if (indicators.includes('conspiracy_language')) {
      categories.push({ type: 'Conspiracy Language', count: 1, certainty: 75 });
    }
    if (indicators.includes('excessive_punctuation') || indicators.includes('excessive_capitalization')) {
      categories.push({ type: 'Formatting Manipulation', count: 1, certainty: 70 });
    }
    
    // Check ML prediction
    if (textAnalysis.mlPrediction && textAnalysis.mlPrediction.prediction === 'FAKE') {
      categories.push({ 
        type: 'ML-Detected Fake Content', 
        count: 1, 
        certainty: Math.round(textAnalysis.mlPrediction.confidence * 100)
      });
    }
  }
  
  // Audio quality issues
  if (audioAnalysis?.quality) {
    const quality = audioAnalysis.quality;
    if (quality.hasSignificantClipping) {
      categories.push({ type: 'Audio Quality Issues', count: 1, certainty: 90 });
    }
    if (quality.snrDb < 15) {
      categories.push({ type: 'Low Signal Quality', count: 1, certainty: 75 });
    }
  }
  
  // Audio deepfake
  if (audioAnalysis?.deepfakeScore && audioAnalysis.deepfakeScore > 50) {
    categories.push({ 
      type: 'Audio Deepfake Detected', 
      count: 1, 
      certainty: Math.round(audioAnalysis.deepfakeScore)
    });
  }
  
  // Video manipulation
  if (videoAnalysis?.manipulationIndicators && videoAnalysis.manipulationIndicators.length > 0) {
    videoAnalysis.manipulationIndicators.forEach((indicator: string) => {
      categories.push({ 
        type: indicator, 
        count: 1, 
        certainty: 70 
      });
    });
  }
  
  // Video deepfake
  if (videoAnalysis?.deepfakeScore && videoAnalysis.deepfakeScore > 50) {
    categories.push({ 
      type: 'Video Deepfake Detected', 
      count: 1, 
      certainty: Math.round(videoAnalysis.deepfakeScore)
    });
  }
  
  // If no categories, show placeholder
  if (categories.length === 0) {
    categories.push({ type: 'No Issues Detected', count: 1, certainty: 100 });
  }

  // Calculate total and percentages
  const total = categories.reduce((acc, cat) => acc + cat.count, 0);
  const chartData = categories.map((cat, index) => ({
    name: cat.type,
    value: cat.count,
    percentage: ((cat.count / total) * 100).toFixed(1),
    certainty: cat.certainty,
    color: COLORS[index % COLORS.length]
  }));

  const renderCustomLabel = (entry: { percentage: string }) => {
    return `${entry.percentage}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detection Categories</CardTitle>
        <CardDescription>
          Types of issues and manipulation patterns detected
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {chartData.length > 1 && (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.certainty}% certainty
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t text-center">
            <div className="text-sm text-muted-foreground">Total Detections</div>
            <div className="text-3xl font-bold text-primary">{total}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
