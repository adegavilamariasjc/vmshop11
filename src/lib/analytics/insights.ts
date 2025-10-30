// Sistema de Insights Inteligentes para Analytics

export interface Insight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  metric?: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TrendAnalysis {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  prediction: number;
  confidence: number;
}

export interface ABCAnalysis {
  classA: number; // 20% produtos = 80% receita
  classB: number; // 30% produtos = 15% receita
  classC: number; // 50% produtos = 5% receita
  products: {
    name: string;
    class: 'A' | 'B' | 'C';
    revenue: number;
    percentage: number;
  }[];
}

// Análise de tendências com previsão simples (regressão linear)
export const analyzeTrend = (data: { date: string; value: number }[]): TrendAnalysis => {
  if (data.length < 2) {
    return { trend: 'stable', percentage: 0, prediction: 0, confidence: 0 };
  }

  const values = data.map(d => d.value);
  const n = values.length;
  
  // Calcular regressão linear simples
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  values.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += Math.pow(x - xMean, 2);
  });
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  
  // Previsão para próximo período
  const prediction = slope * n + intercept;
  
  // Calcular R² (coeficiente de determinação) para confidence
  const yPredicted = values.map((_, x) => slope * x + intercept);
  const ssRes = values.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
  const ssTot = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
  
  // Percentual de mudança
  const firstValue = values[0] || 1;
  const lastValue = values[n - 1] || 0;
  const percentage = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  
  // Determinar tendência
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(percentage) > 5) {
    trend = percentage > 0 ? 'up' : 'down';
  }
  
  return {
    trend,
    percentage,
    prediction: Math.max(0, prediction),
    confidence: Math.max(0, Math.min(100, rSquared * 100))
  };
};

// Análise ABC de produtos (Pareto)
export const analyzeABC = (
  products: { name: string; revenue: number }[]
): ABCAnalysis => {
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sorted.reduce((sum, p) => sum + p.revenue, 0);
  
  let accumulated = 0;
  let classACount = 0;
  let classBCount = 0;
  let classCCount = 0;
  
  const classified = sorted.map(product => {
    accumulated += product.revenue;
    const percentage = totalRevenue > 0 ? (accumulated / totalRevenue) * 100 : 0;
    
    let productClass: 'A' | 'B' | 'C' = 'C';
    if (percentage <= 80) {
      productClass = 'A';
      classACount++;
    } else if (percentage <= 95) {
      productClass = 'B';
      classBCount++;
    } else {
      productClass = 'C';
      classCCount++;
    }
    
    return {
      name: product.name,
      class: productClass,
      revenue: product.revenue,
      percentage: totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0
    };
  });
  
  return {
    classA: classACount,
    classB: classBCount,
    classC: classCCount,
    products: classified
  };
};

// Comparação com período anterior
export const compareWithPreviousPeriod = (
  currentRevenue: number,
  previousRevenue: number,
  currentOrders: number,
  previousOrders: number
) => {
  const revenueChange = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;
  
  const ordersChange = previousOrders > 0 
    ? ((currentOrders - previousOrders) / previousOrders) * 100 
    : 0;
  
  return {
    revenueChange,
    ordersChange,
    avgTicketChange: previousOrders > 0 && currentOrders > 0
      ? ((currentRevenue / currentOrders) - (previousRevenue / previousOrders)) / (previousRevenue / previousOrders) * 100
      : 0
  };
};

// Gerador de insights automáticos
export const generateInsights = (metrics: {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  profitMargin: number;
  conversionRate: number;
  stockValue: number;
  lowStockCount: number;
  topProducts: any[];
  revenueChange?: number;
  ordersChange?: number;
  trend?: TrendAnalysis;
  abcAnalysis?: ABCAnalysis;
}): Insight[] => {
  const insights: Insight[] = [];
  
  // Insights de margem de lucro
  if (metrics.profitMargin < 20) {
    insights.push({
      type: 'danger',
      title: 'Margem de Lucro Baixa',
      description: `Sua margem está em ${metrics.profitMargin.toFixed(1)}%. Considere revisar custos ou aumentar preços.`,
      metric: `${metrics.profitMargin.toFixed(1)}%`,
      action: 'Analisar custos e preços',
      priority: 'high'
    });
  } else if (metrics.profitMargin > 40) {
    insights.push({
      type: 'success',
      title: 'Excelente Margem de Lucro',
      description: `Margem de ${metrics.profitMargin.toFixed(1)}% acima da média. Ótima gestão de custos!`,
      metric: `${metrics.profitMargin.toFixed(1)}%`,
      priority: 'low'
    });
  }
  
  // Insights de conversão
  if (metrics.conversionRate < 2) {
    insights.push({
      type: 'warning',
      title: 'Taxa de Conversão Baixa',
      description: `Apenas ${metrics.conversionRate.toFixed(1)}% das visitas viram pedidos. Revise a experiência do usuário.`,
      metric: `${metrics.conversionRate.toFixed(1)}%`,
      action: 'Otimizar funil de vendas',
      priority: 'high'
    });
  } else if (metrics.conversionRate > 5) {
    insights.push({
      type: 'success',
      title: 'Alta Taxa de Conversão',
      description: `${metrics.conversionRate.toFixed(1)}% de conversão! Seu site está convertendo muito bem.`,
      metric: `${metrics.conversionRate.toFixed(1)}%`,
      priority: 'low'
    });
  }
  
  // Insights de estoque
  if (metrics.lowStockCount > 5) {
    insights.push({
      type: 'danger',
      title: 'Múltiplos Produtos em Falta',
      description: `${metrics.lowStockCount} produtos com estoque baixo ou zerado. Risco de perder vendas!`,
      metric: `${metrics.lowStockCount} produtos`,
      action: 'Revisar lista de compras',
      priority: 'high'
    });
  }
  
  // Insights de ticket médio
  if (metrics.averageTicket < 30) {
    insights.push({
      type: 'info',
      title: 'Oportunidade de Upsell',
      description: `Ticket médio de R$ ${metrics.averageTicket.toFixed(2)}. Considere combos ou produtos complementares.`,
      metric: `R$ ${metrics.averageTicket.toFixed(2)}`,
      action: 'Criar estratégias de upsell',
      priority: 'medium'
    });
  }
  
  // Insights de crescimento
  if (metrics.revenueChange !== undefined) {
    if (metrics.revenueChange > 20) {
      insights.push({
        type: 'success',
        title: 'Crescimento Acelerado',
        description: `Faturamento cresceu ${metrics.revenueChange.toFixed(1)}% vs período anterior. Continue assim!`,
        metric: `+${metrics.revenueChange.toFixed(1)}%`,
        priority: 'medium'
    });
    } else if (metrics.revenueChange < -10) {
      insights.push({
        type: 'danger',
        title: 'Queda no Faturamento',
        description: `Faturamento caiu ${Math.abs(metrics.revenueChange).toFixed(1)}% vs período anterior. Ação necessária!`,
        metric: `${metrics.revenueChange.toFixed(1)}%`,
        action: 'Investigar causas da queda',
        priority: 'high'
      });
    }
  }
  
  // Insights de tendência
  if (metrics.trend) {
    if (metrics.trend.trend === 'down' && metrics.trend.confidence > 70) {
      insights.push({
        type: 'warning',
        title: 'Tendência de Queda Detectada',
        description: `Análise indica tendência de queda com ${metrics.trend.confidence.toFixed(0)}% de confiança. Previsão: R$ ${metrics.trend.prediction.toFixed(2)}`,
        metric: `${metrics.trend.percentage.toFixed(1)}%`,
        action: 'Revisar estratégia',
        priority: 'high'
      });
    } else if (metrics.trend.trend === 'up' && metrics.trend.confidence > 70) {
      insights.push({
        type: 'success',
        title: 'Tendência de Crescimento',
        description: `Análise indica crescimento sustentável. Previsão próximo período: R$ ${metrics.trend.prediction.toFixed(2)}`,
        metric: `+${metrics.trend.percentage.toFixed(1)}%`,
        priority: 'low'
      });
    }
  }
  
  // Insights de análise ABC
  if (metrics.abcAnalysis) {
    insights.push({
      type: 'info',
      title: 'Análise ABC de Produtos',
      description: `${metrics.abcAnalysis.classA} produtos Classe A geram 80% da receita. Foque nesses produtos!`,
      metric: `${metrics.abcAnalysis.classA} produtos`,
      action: 'Ver produtos Classe A',
      priority: 'medium'
    });
  }
  
  // Insight de ROI de estoque
  if (metrics.stockValue > 0 && metrics.totalRevenue > 0) {
    const stockTurnoverRate = metrics.totalRevenue / metrics.stockValue;
    if (stockTurnoverRate < 2) {
      insights.push({
        type: 'warning',
        title: 'Giro de Estoque Baixo',
        description: `Seu estoque está girando ${stockTurnoverRate.toFixed(1)}x. Pode ter capital parado demais.`,
        metric: `${stockTurnoverRate.toFixed(1)}x`,
        action: 'Otimizar níveis de estoque',
        priority: 'medium'
      });
    }
  }
  
  // Ordenar por prioridade
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return insights;
};

// Análise de sazonalidade (detecta padrões semanais)
export const analyzeSeasonal = (hourlyData: { hour: string; orders: number }[]) => {
  const peakHours = hourlyData
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 3);
  
  const avgOrders = hourlyData.reduce((sum, h) => sum + h.orders, 0) / hourlyData.length;
  
  return {
    peakHours: peakHours.map(h => h.hour),
    avgOrdersPerHour: avgOrders,
    peakOrderCount: peakHours[0]?.orders || 0
  };
};

// Previsão de demanda simples (média móvel exponencial)
export const forecastDemand = (
  productName: string,
  historicalSales: number[],
  alpha: number = 0.3
): { forecast: number; confidence: 'high' | 'medium' | 'low' } => {
  if (historicalSales.length === 0) {
    return { forecast: 0, confidence: 'low' };
  }
  
  let forecast = historicalSales[0];
  
  for (let i = 1; i < historicalSales.length; i++) {
    forecast = alpha * historicalSales[i] + (1 - alpha) * forecast;
  }
  
  // Calcular variância para determinar confiança
  const mean = historicalSales.reduce((a, b) => a + b, 0) / historicalSales.length;
  const variance = historicalSales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalSales.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? (stdDev / mean) : 1;
  
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (coefficientOfVariation < 0.3) confidence = 'high';
  else if (coefficientOfVariation < 0.6) confidence = 'medium';
  
  return {
    forecast: Math.round(forecast),
    confidence
  };
};
