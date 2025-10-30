import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ABCAnalysis } from '@/lib/analytics/insights';
import { Badge } from '@/components/ui/badge';

interface ABCAnalysisChartProps {
  analysis: ABCAnalysis;
}

const ABCAnalysisChart: React.FC<ABCAnalysisChartProps> = ({ analysis }) => {
  const pieData = [
    { name: 'Classe A', value: analysis.classA, color: '#10b981' },
    { name: 'Classe B', value: analysis.classB, color: '#f59e0b' },
    { name: 'Classe C', value: analysis.classC, color: '#ef4444' }
  ];

  const topClassA = analysis.products
    .filter(p => p.class === 'A')
    .slice(0, 5);

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Análise ABC de Produtos (Curva de Pareto)</CardTitle>
        <p className="text-sm text-gray-400">
          Identifica quais produtos geram mais receita
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de pizza */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Legenda explicativa */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-300">
                  <strong>Classe A:</strong> ~20% produtos = 80% receita
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-gray-300">
                  <strong>Classe B:</strong> ~30% produtos = 15% receita
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">
                  <strong>Classe C:</strong> ~50% produtos = 5% receita
                </span>
              </div>
            </div>
          </div>

          {/* Top 5 produtos Classe A */}
          <div>
            <h4 className="text-white font-semibold mb-3">
              Top 5 Produtos Classe A
            </h4>
            <div className="space-y-2">
              {topClassA.map((product, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">
                      {product.name}
                    </span>
                    <Badge className="bg-emerald-600">A</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      R$ {product.revenue.toFixed(2)}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {product.percentage.toFixed(1)}% da receita
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recomendação */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-gray-300">
                💡 <strong>Recomendação:</strong> Foque em manter estoque adequado e promoções
                nos produtos Classe A. Eles são responsáveis pela maior parte da sua receita.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ABCAnalysisChart;
