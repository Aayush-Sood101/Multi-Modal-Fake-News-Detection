'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Clock, TrendingUp, Calendar, Info } from 'lucide-react';

interface PropagationEvent {
  date: string;
  mentions: number;
  shares: number;
  credibilityScore: number;
}

interface ClaimTimeline {
  claim: string;
  firstAppearance: string;
  peakPropagation: string;
  currentStatus: 'spreading' | 'declining' | 'debunked' | 'verified';
}

interface TemporalAnalysisProps {
  propagation?: PropagationEvent[];
  timeline?: ClaimTimeline[];
}

export function TemporalAnalysis({ 
  propagation = [],
  timeline = []
}: TemporalAnalysisProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'debunked': return 'destructive';
      case 'declining': return 'secondary';
      case 'spreading': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return '✓';
      case 'debunked': return '✗';
      case 'declining': return '↓';
      case 'spreading': return '↑';
      default: return '•';
    }
  };

  // If no data is available, show info message
  if (propagation.length === 0 && timeline.length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Temporal Analysis Not Available
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                This feature tracks claim propagation over time and requires historical data. 
                It will be available when connected to a social media monitoring system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">{propagation.length > 0 && (
        <>
          {/* Propagation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Claim Propagation Over Time
              </CardTitle>
              <CardDescription>
                Timeline showing how claims spread and evolved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={propagation}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="mentions" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Mentions"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="shares" 
                      stackId="2"
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.6}
                      name="Shares"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Credibility Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Credibility Score Trend
              </CardTitle>
              <CardDescription>
                How credibility assessment changed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={propagation}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value}%`, 'Credibility']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="credibilityScore" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Credibility Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Timeline Events */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Key Timeline Events
            </CardTitle>
            <CardDescription>
              Notable milestones in claim evolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative pl-8 pb-4 border-l-2 border-muted last:border-0 last:pb-0">
                  <div 
                    className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background"
                    style={{ 
                      backgroundColor: event.currentStatus === 'verified' ? '#22c55e' : 
                                      event.currentStatus === 'debunked' ? '#ef4444' : '#94a3b8' 
                    }}
                  />
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.claim}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>First: {new Date(event.firstAppearance).toLocaleString()}</span>
                          <span>Peak: {new Date(event.peakPropagation).toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(event.currentStatus)} className="flex-shrink-0">
                        {getStatusIcon(event.currentStatus)} {event.currentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {propagation.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {new Date(propagation[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                First Appeared
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {Math.max(...propagation.map(p => p.mentions))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Peak Mentions
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {propagation.reduce((acc, p) => acc + p.shares, 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Total Shares
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {propagation[propagation.length - 1]?.credibilityScore || 0}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Current Score
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
