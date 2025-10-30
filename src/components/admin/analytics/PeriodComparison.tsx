import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PeriodComparisonProps {
  currentRevenue: number;
  previousRevenue: number;
  currentOrders: number;
  previousOrders: number;
  currentPeriod: string;
  previousPeriod: string;
}

const PeriodComparison: React.FC<PeriodComparisonProps> = ({
  currentRevenue,
  previousRevenue,
  currentOrders,
  previousOrders,
  currentPeriod,
  previousPeriod
}) => {
  const revenueChange = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;
  
  const ordersChange = previousOrders > 0 
    ? ((currentOrders - previousOrders) / previousOrders) * 100 
    : 0;

  const currentAvgTicket = currentOrders > 0 ? currentRevenue / currentOrders : 0;
  const previousAvgTicket = previousOrders > 0 ? previousRevenue / previousOrders : 0;
  const avgTicketChange = previousAvgTicket > 0
    ? ((currentAvgTicket - previousAvgTicket) / previousAvgTicket) * 100
    : 0;

  const getTrendIcon = (change: number) => {
    if (change > 2) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (change < -2) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 2) return 'text-emerald-400';
    if (change < -2) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangeText = (change: number) => {
    const abs = Math.abs(change);
    const sign = change > 0 ? '+' : '';
    return `${sign}${abs.toFixed(1)}%`;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Comparação de Períodos</CardTitle>
        <p className="text-sm text-gray-400">
          {currentPeriod} vs {previousPeriod}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Faturamento */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Faturamento</span>
              {getTrendIcon(revenueChange)}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              R$ {currentRevenue.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={getTrendColor(revenueChange)}>
                {getChangeText(revenueChange)}
              </span>
              <span className="text-gray-500">
                vs R$ {previousRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pedidos */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pedidos</span>
              {getTrendIcon(ordersChange)}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {currentOrders}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={getTrendColor(ordersChange)}>
                {getChangeText(ordersChange)}
              </span>
              <span className="text-gray-500">
                vs {previousOrders}
              </span>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Ticket Médio</span>
              {getTrendIcon(avgTicketChange)}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              R$ {currentAvgTicket.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={getTrendColor(avgTicketChange)}>
                {getChangeText(avgTicketChange)}
              </span>
              <span className="text-gray-500">
                vs R$ {previousAvgTicket.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Análise textual */}
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-gray-300">
            {revenueChange > 5 && ordersChange > 5 ? (
              <>✨ Ótimo desempenho! Tanto faturamento quanto pedidos cresceram significativamente.</>
            ) : revenueChange > 5 && ordersChange < 0 ? (
              <>📊 Faturamento cresceu apesar da queda em pedidos. Ticket médio aumentou!</>
            ) : revenueChange < -5 ? (
              <>⚠️ Faturamento caiu em relação ao período anterior. Revise suas estratégias.</>
            ) : (
              <>📈 Desempenho estável comparado ao período anterior.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodComparison;
