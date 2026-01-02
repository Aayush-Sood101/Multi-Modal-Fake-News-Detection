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
  // Ensure score is within valid range
  const validScore = Math.max(0, Math.min(100, score || 0));
  const validConfidence = Math.max(0, Math.min(100, confidence || 0));
  
  // Determine credibility level and color
  const getScoreLevel = (score: number) => {
    if (score >= 70) return { label: 'Credible', color: '#22c55e', icon: CheckCircle, bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (score >= 40) return { label: 'Uncertain', color: '#eab308', icon: AlertTriangle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    return { label: 'Not Credible', color: '#ef4444', icon: XCircle, bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  };

  const level = getScoreLevel(validScore);
  const Icon = level.icon;

  // Data for the gauge chart (ensure no negative values)
  const data = [
    { name: 'Score', value: validScore },
    { name: 'Remaining', value: Math.max(0, 100 - validScore) }
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
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 10}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {validScore}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-sm"
                            >
                              out of 100
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-3 text-center">
            <Icon className="w-8 h-8" style={{ color: level.color }} />
            <div>
              <p className="text-2xl font-bold" style={{ color: level.color }}>
                {level.label}
              </p>
              <p className="text-sm text-muted-foreground">
                Confidence: {validConfidence}%
              </p>
            </div>
          </div>

          {/* Score interpretation */}
          <div className={`w-full p-4 rounded-lg border ${level.borderColor} ${level.bgColor}`}>
            <p className="text-sm text-center">
              {validScore >= 70 && "This content shows strong indicators of credibility and authenticity."}
              {validScore >= 40 && validScore < 70 && "This content has mixed signals. Additional verification recommended."}
              {validScore < 40 && "This content shows multiple indicators of misinformation or manipulation."}
            </p>
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
