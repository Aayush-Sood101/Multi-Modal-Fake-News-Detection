'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CredibilityScoreProps {
  score: number; // 0-100
  confidence?: number; // 0-100
}

export function CredibilityScore({ score, confidence = 85 }: CredibilityScoreProps) {
  // Determine credibility level and color
  const getScoreLevel = (score: number) => {
    if (score >= 70) return { label: 'Credible', color: '#22c55e', icon: CheckCircle };
    if (score >= 40) return { label: 'Uncertain', color: '#eab308', icon: AlertTriangle };
    return { label: 'Not Credible', color: '#ef4444', icon: XCircle };
  };

  const level = getScoreLevel(score);
  const Icon = level.icon;

  // Data for the gauge chart
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Overall Credibility Score
          <Badge 
            variant={score >= 70 ? 'default' : score >= 40 ? 'secondary' : 'destructive'}
            className="text-sm"
          >
            {level.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full max-w-sm aspect-square">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill={level.color} />
                  <Cell fill="#e5e7eb" />
                  <Label
                    value={score.toFixed(0)}
                    position="center"
                    className="text-6xl font-bold"
                    fill="currentColor"
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 bottom-0 text-center pb-8">
              <div className="flex items-center justify-center gap-2">
                <Icon className="h-5 w-5" style={{ color: level.color }} />
                <span className="text-sm font-medium text-muted-foreground">
                  {confidence}% Confidence
                </span>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-4 text-center pt-4 border-t">
            <div>
              <div className="text-2xl font-bold text-green-600">70+</div>
              <div className="text-xs text-muted-foreground">Credible</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">40-69</div>
              <div className="text-xs text-muted-foreground">Uncertain</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">0-39</div>
              <div className="text-xs text-muted-foreground">Not Credible</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
