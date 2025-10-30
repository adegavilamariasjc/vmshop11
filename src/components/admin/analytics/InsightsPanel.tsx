import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Info, CheckCircle, Lightbulb } from 'lucide-react';
import { Insight } from '@/lib/analytics/insights';
import { Badge } from '@/components/ui/badge';

interface InsightsPanelProps {
  insights: Insight[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'danger':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'from-emerald-600/20 to-emerald-800/20 border-emerald-500/30';
      case 'warning':
        return 'from-amber-600/20 to-amber-800/20 border-amber-500/30';
      case 'danger':
        return 'from-red-600/20 to-red-800/20 border-red-500/30';
      case 'info':
        return 'from-blue-600/20 to-blue-800/20 border-blue-500/30';
    }
  };

  const getPriorityBadge = (priority: Insight['priority']) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'}
      </Badge>
    );
  };

  if (insights.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Ainda não há insights suficientes. Continue vendendo para gerar análises automáticas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Insights Inteligentes
          <Badge variant="outline" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg bg-gradient-to-br ${getColor(insight.type)} border`}
          >
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-semibold text-sm">{insight.title}</h4>
                  {getPriorityBadge(insight.priority)}
                </div>
                <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
                {insight.metric && (
                  <div className="text-lg font-bold text-white mb-2">{insight.metric}</div>
                )}
                {insight.action && (
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Ação recomendada: {insight.action}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
