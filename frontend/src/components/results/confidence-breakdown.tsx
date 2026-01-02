'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ModalityScore {
  text?: number;
  audio?: number;
  video?: number;
  overall?: number;
}

interface ConfidenceBreakdownProps {
  scores: ModalityScore;
}

export function ConfidenceBreakdown({ scores }: ConfidenceBreakdownProps) {
  // Prepare data for stacked bar chart
  const data = [
    {
      name: 'Text',
      score: scores.text || 0,
      confidence: scores.text || 0,
      color: '#3b82f6'
    },
    {
      name: 'Audio',
      score: scores.audio || 0,
      confidence: scores.audio || 0,
      color: '#8b5cf6'
    },
    {
      name: 'Video',
      score: scores.video || 0,
      confidence: scores.video || 0,
      color: '#ec4899'
    }
  ].filter(item => item.score > 0);

  const overallScore = scores.overall || (
    data.length > 0 
      ? data.reduce((acc, item) => acc + item.score, 0) / data.length 
      : 0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Multi-Modal Confidence Breakdown</CardTitle>
        <CardDescription>
          Individual credibility scores from each analysis modality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-sm"
                />
                <YAxis 
                  domain={[0, 100]}
                  className="text-sm"
                  label={{ value: 'Credibility Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}`,
                    name === 'score' ? 'Score' : 'Confidence'
                  ]}
                />
                <Legend />
                <Bar dataKey="score" name="Credibility Score" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="confidence" name="Model Confidence" fill="#94a3b8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.map((item) => (
              <div key={item.name} className="text-center p-3 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-1">{item.name}</div>
                <div className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.score.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.confidence.toFixed(0)}% conf.
                </div>
              </div>
            ))}
            {data.length > 1 && (
              <div className="text-center p-3 rounded-lg border bg-primary/5">
                <div className="text-sm text-muted-foreground mb-1">Overall</div>
                <div className="text-2xl font-bold text-primary">
                  {overallScore.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ensemble
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
