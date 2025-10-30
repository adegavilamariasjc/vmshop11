import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Package, Clock, 
  MapPin, CreditCard, Users, ShoppingCart,
  AlertTriangle, Activity, Percent, TrendingDown
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  generateInsights, 
  analyzeTrend, 
  analyzeABC, 
  compareWithPreviousPeriod,
  analyzeSeasonal,
  ABCAnalysis,
  TrendAnalysis,
  Insight
} from '@/lib/analytics/insights';
import InsightsPanel from './analytics/InsightsPanel';
import PeriodComparison from './analytics/PeriodComparison';
import ABCAnalysisChart from './analytics/ABCAnalysisChart';

interface SalesData {
  date: string;
  total: number;
  orders: number;
}

interface ProductSales {
  name: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface PaymentMethodData {
  method: string;
  count: number;
  total: number;
}

interface BairroData {
  bairro: string;
  orders: number;
  revenue: number;
}

interface HourlyData {
  hour: string;
  orders: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const AnalyticsManager = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7); // dias
  
  // Métricas gerais
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  
  // Métricas financeiras
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [stockPotentialRevenue, setStockPotentialRevenue] = useState(0);
  
  // Dados para gráficos
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [bairroData, setBairroData] = useState<BairroData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
  
  // Novos estados para análises avançadas
  const [insights, setInsights] = useState<Insight[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [abcAnalysis, setABCAnalysis] = useState<ABCAnalysis | null>(null);
  const [previousRevenue, setPreviousRevenue] = useState(0);
  const [previousOrders, setPreviousOrders] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), dateRange));
      const endDate = endOfDay(new Date());

      // Buscar pedidos do período
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .gte('data_criacao', startDate.toISOString())
        .lte('data_criacao', endDate.toISOString())
        .neq('status', 'cancelado');

      if (pedidosError) throw pedidosError;

      // Calcular métricas gerais
      const revenue = pedidos?.reduce((sum, p) => sum + Number(p.total), 0) || 0;
      const orders = pedidos?.length || 0;
      setTotalRevenue(revenue);
      setTotalOrders(orders);
      setAverageTicket(orders > 0 ? revenue / orders : 0);

      // Buscar visitas totais para taxa de conversão
      const { count: visitsCount } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('data_hora', startDate.toISOString())
        .lte('data_hora', endDate.toISOString());

      setConversionRate(visitsCount && visitsCount > 0 ? (orders / visitsCount) * 100 : 0);

      // Vendas por dia
      const dailySales: { [key: string]: { total: number; orders: number } } = {};
      pedidos?.forEach(p => {
        const date = format(new Date(p.data_criacao), 'dd/MM');
        if (!dailySales[date]) {
          dailySales[date] = { total: 0, orders: 0 };
        }
        dailySales[date].total += Number(p.total);
        dailySales[date].orders += 1;
      });
      setSalesData(Object.entries(dailySales).map(([date, data]) => ({
        date,
        total: data.total,
        orders: data.orders
      })));

      // Buscar produtos para análise financeira
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, price, custo_compra, quantidade_estoque');

      const productsMap = new Map(allProducts?.map(p => [p.name, p]) || []);

      // Produtos mais vendidos com análise financeira
      const productSales: { [key: string]: { quantity: number; revenue: number; cost: number } } = {};
      let totalCostCalculated = 0;
      
      pedidos?.forEach(p => {
        const items = p.itens as any[];
        items?.forEach(item => {
          const productData = productsMap.get(item.name);
          const itemCost = (productData?.custo_compra || item.price * 0.6) * item.qty; // 60% como custo estimado se não houver
          
          if (!productSales[item.name]) {
            productSales[item.name] = { quantity: 0, revenue: 0, cost: 0 };
          }
          productSales[item.name].quantity += item.qty;
          productSales[item.name].revenue += item.price * item.qty;
          productSales[item.name].cost += itemCost;
          totalCostCalculated += itemCost;
        });
      });

      setTotalCost(totalCostCalculated);
      const calculatedProfit = revenue - totalCostCalculated;
      setTotalProfit(calculatedProfit);
      setProfitMargin(revenue > 0 ? (calculatedProfit / revenue) * 100 : 0);

      setTopProducts(
        Object.entries(productSales)
          .map(([name, data]) => ({
            name,
            quantity: data.quantity,
            revenue: data.revenue,
            cost: data.cost,
            profit: data.revenue - data.cost,
            margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0
          }))
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 10)
      );

      // Formas de pagamento
      const paymentStats: { [key: string]: { count: number; total: number } } = {};
      pedidos?.forEach(p => {
        if (!paymentStats[p.forma_pagamento]) {
          paymentStats[p.forma_pagamento] = { count: 0, total: 0 };
        }
        paymentStats[p.forma_pagamento].count += 1;
        paymentStats[p.forma_pagamento].total += Number(p.total);
      });
      setPaymentMethods(
        Object.entries(paymentStats).map(([method, data]) => ({
          method,
          ...data
        }))
      );

      // Análise por bairro
      const bairroStats: { [key: string]: { orders: number; revenue: number } } = {};
      pedidos?.forEach(p => {
        if (p.cliente_bairro !== 'BALCAO') {
          if (!bairroStats[p.cliente_bairro]) {
            bairroStats[p.cliente_bairro] = { orders: 0, revenue: 0 };
          }
          bairroStats[p.cliente_bairro].orders += 1;
          bairroStats[p.cliente_bairro].revenue += Number(p.total);
        }
      });
      setBairroData(
        Object.entries(bairroStats)
          .map(([bairro, data]) => ({ bairro, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)
      );

      // Horários de pico
      const hourlyStats: { [key: string]: number } = {};
      pedidos?.forEach(p => {
        const hour = format(new Date(p.data_criacao), 'HH:00');
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      });
      setHourlyData(
        Object.entries(hourlyStats)
          .map(([hour, orders]) => ({ hour, orders }))
          .sort((a, b) => a.hour.localeCompare(b.hour))
      );

      // Análise de estoque e valor
      const { data: stockProducts } = await supabase
        .from('products')
        .select('id, name, quantidade_estoque, estoque_minimo, custo_compra, price, controlar_estoque');

      let stockValueCalc = 0;
      let stockPotentialCalc = 0;
      const lowStock: any[] = [];

      stockProducts?.forEach(p => {
        const cost = p.custo_compra || 0;
        const price = p.price || 0;
        const qty = p.quantidade_estoque || 0;

        stockValueCalc += cost * qty;
        stockPotentialCalc += price * qty;

        if (p.controlar_estoque && qty <= p.estoque_minimo && p.estoque_minimo > 0) {
          lowStock.push(p);
        }
      });

      setStockValue(stockValueCalc);
      setStockPotentialRevenue(stockPotentialCalc);
      setLowStockProducts(lowStock);

      // Buscar dados do período anterior para comparação
      const previousStartDate = startOfDay(subDays(startDate, dateRange));
      const previousEndDate = endOfDay(subDays(endDate, dateRange));

      const { data: previousPedidos } = await supabase
        .from('pedidos')
        .select('*')
        .gte('data_criacao', previousStartDate.toISOString())
        .lte('data_criacao', previousEndDate.toISOString())
        .neq('status', 'cancelado');

      const prevRevenue = previousPedidos?.reduce((sum, p) => sum + Number(p.total), 0) || 0;
      const prevOrders = previousPedidos?.length || 0;
      setPreviousRevenue(prevRevenue);
      setPreviousOrders(prevOrders);

      // Performance por categoria
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (!categoriesError && categoriesData) {
        const categoryStats = await Promise.all(
          categoriesData.map(async (cat) => {
            const { data: catProducts } = await supabase
              .from('products')
              .select('id, name')
              .eq('category_id', cat.id);

            let totalRevenue = 0;
            let totalQuantity = 0;

            pedidos?.forEach(p => {
              const items = p.itens as any[];
              items?.forEach(item => {
                if (catProducts?.some(cp => cp.name === item.name)) {
                  totalRevenue += item.price * item.qty;
                  totalQuantity += item.qty;
                }
              });
            });

            return {
              name: cat.name,
              revenue: totalRevenue,
              quantity: totalQuantity
            };
          })
        );

        setCategoryPerformance(
          categoryStats
            .filter(c => c.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue)
        );
      }

      // Análise de tendências
      const salesTrend = analyzeTrend(
        salesData.map(s => ({ date: s.date, value: s.total }))
      );
      setTrendAnalysis(salesTrend);

      // Análise ABC de produtos
      const productList = topProducts.map(p => ({ name: p.name, revenue: p.revenue }));
      const abc = analyzeABC(productList);
      setABCAnalysis(abc);

      // Gerar insights inteligentes
      const generatedInsights = generateInsights({
        totalRevenue: revenue,
        totalOrders: orders,
        averageTicket: orders > 0 ? revenue / orders : 0,
        profitMargin: revenue > 0 ? (calculatedProfit / revenue) * 100 : 0,
        conversionRate: visitsCount && visitsCount > 0 ? (orders / visitsCount) * 100 : 0,
        stockValue: stockValueCalc,
        lowStockCount: lowStock.length,
        topProducts: topProducts,
        revenueChange: prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
        ordersChange: prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : 0,
        trend: salesTrend,
        abcAnalysis: abc
      });
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Erro ao carregar analytics",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center text-white py-8">Carregando analytics...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filtro de período */}
      <div className="flex gap-2 mb-4">
        {[7, 15, 30, 60, 90].map(days => (
          <button
            key={days}
            onClick={() => setDateRange(days)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange === days
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {days} dias
          </button>
        ))}
      </div>

      {/* Painel de Insights Inteligentes */}
      {insights.length > 0 && (
        <InsightsPanel insights={insights} />
      )}

      {/* Comparação com Período Anterior */}
      {previousRevenue > 0 && (
        <PeriodComparison
          currentRevenue={totalRevenue}
          previousRevenue={previousRevenue}
          currentOrders={totalOrders}
          previousOrders={previousOrders}
          currentPeriod={`Últimos ${dateRange} dias`}
          previousPeriod={`${dateRange} dias anteriores`}
        />
      )}

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Últimos {dateRange} dias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalOrders}</div>
            <p className="text-xs text-gray-400 mt-1">Pedidos concluídos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {averageTicket.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Por pedido</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Taxa de Conversão</CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-400 mt-1">Visitas → Pedidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de métricas financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Custo Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalCost.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Custos dos produtos vendidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border-emerald-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Lucro Bruto</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {totalProfit.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Receita - Custos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Margem de Lucro</CardTitle>
            <Percent className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-gray-400 mt-1">Margem média</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 border-indigo-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Valor em Estoque</CardTitle>
            <Package className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {stockValue.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Custo do estoque atual</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="abc">Análise ABC</TabsTrigger>
          <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
          <TabsTrigger value="bairros">Bairros</TabsTrigger>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Evolução de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Faturamento (R$)" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" name="Pedidos" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Performance por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Faturamento (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">ROI do Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-sm text-gray-400">Investimento em Estoque</p>
                    <p className="text-2xl font-bold text-red-400">R$ {stockValue.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-sm text-gray-400">Receita Potencial</p>
                    <p className="text-2xl font-bold text-green-400">R$ {stockPotentialRevenue.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-gray-400">ROI Potencial</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {stockValue > 0 ? (((stockPotentialRevenue - stockValue) / stockValue) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-sm text-gray-400">Lucro Potencial do Estoque</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      R$ {(stockPotentialRevenue - stockValue).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Resumo Financeiro do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <span className="text-gray-300">Receita Total</span>
                    <span className="text-xl font-bold text-blue-400">R$ {totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                    <span className="text-gray-300">Custo Total</span>
                    <span className="text-xl font-bold text-red-400">R$ {totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                    <span className="text-gray-300">Lucro Bruto</span>
                    <span className="text-xl font-bold text-green-400">R$ {totalProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <span className="text-gray-300">Margem de Lucro</span>
                    <span className="text-xl font-bold text-purple-400">{profitMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
                    <span className="text-gray-300">Ticket Médio</span>
                    <span className="text-xl font-bold text-amber-400">R$ {averageTicket.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <span className="text-gray-300">Lucro Médio/Pedido</span>
                    <span className="text-xl font-bold text-cyan-400">
                      R$ {totalOrders > 0 ? (totalProfit / totalOrders).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Evolução de Lucro e Margem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Receita (R$)" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" name="Pedidos" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abc" className="space-y-4">
          {abcAnalysis && <ABCAnalysisChart analysis={abcAnalysis} />}
        </TabsContent>

        <TabsContent value="produtos" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top 10 Produtos Mais Lucrativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" width={150} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Bar dataKey="profit" fill="#10b981" name="Lucro (R$)" />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Faturamento (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Detalhes dos Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {topProducts.map((product, idx) => (
                    <div key={idx} className="p-3 bg-gray-700/30 rounded-lg space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white text-sm">{product.name}</span>
                        <span className="text-xs text-gray-400">{product.quantity} vendidos</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400">Receita</p>
                          <p className="text-blue-400 font-mono">R$ {product.revenue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Custo</p>
                          <p className="text-red-400 font-mono">R$ {product.cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Lucro</p>
                          <p className="text-green-400 font-mono">R$ {product.profit.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="pt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Margem:</span>
                          <span className={`text-xs font-semibold ${product.margin >= 30 ? 'text-green-400' : product.margin >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {product.margin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Produtos por Margem de Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={[...topProducts].sort((a, b) => b.margin - a.margin).slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                      formatter={(value: any) => `${value.toFixed(1)}%`}
                    />
                    <Bar dataKey="margin" fill="#f59e0b" name="Margem %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pagamento" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Distribuição por Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, count }) => `${method}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Detalhes por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((pm, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{pm.method}</p>
                        <p className="text-sm text-gray-400">{pm.count} pedidos</p>
                      </div>
                      <p className="text-lg font-bold text-green-400">R$ {pm.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bairros" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Performance por Bairro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={bairroData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="bairro" type="category" width={120} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Bar dataKey="orders" fill="#3b82f6" name="Pedidos" />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Faturamento (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Pico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="orders" fill="#f59e0b" name="Pedidos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum produto com estoque baixo</p>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-sm text-gray-400">
                          Mínimo: {product.estoque_minimo} unidades
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-400">{product.quantidade_estoque}</p>
                        <p className="text-xs text-gray-400">em estoque</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsManager;
