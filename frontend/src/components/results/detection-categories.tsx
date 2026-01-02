'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DetectionCategory {
  type: string;
  count: number;
  certainty: number;
}

interface DetectionCategoriesProps {
  categories?: DetectionCategory[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

const DEFAULT_CATEGORIES = [
  { type: 'Fabricated Content', count: 2, certainty: 85 },
  { type: 'Manipulated Media', count: 1, certainty: 72 },
  { type: 'False Context', count: 1, certainty: 65 },
  { type: 'Misleading Claims', count: 3, certainty: 78 },
];

export function DetectionCategories({ categories = DEFAULT_CATEGORIES }: DetectionCategoriesProps) {
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
          Types of misinformation detected and their distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
