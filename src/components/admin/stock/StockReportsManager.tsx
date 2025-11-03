import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useStockReports } from '@/hooks/useStockReports';
import { Loader2, Package, TrendingUp, AlertTriangle, DollarSign, RefreshCw, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { StockStatusBadge } from './StockStatusBadge';
import { ProfitMarginBadge } from './ProfitMarginBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const StockReportsManager = () => {
  const { stockReport, topSelling, alerts, financialSummary, isLoading, errorMessage, lastRunMs, refreshReports } = useStockReports();
  const [activeTab, setActiveTab] = useState('resumo');

  const hasData = stockReport.length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Guia de Uso */}
        <Alert className="bg-blue-900/20 border-blue-500">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Como usar:</strong> Acompanhe seu estoque em tempo real, veja produtos mais vendidos e receba alertas de produtos com estoque baixo. 
            Use essas informações para planejar suas compras e evitar ruptura de estoque.
          </AlertDescription>
        </Alert>

        {/* Banner de Erro */}
        {errorMessage && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refreshReports()}
                disabled={isLoading}
                className="ml-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Cards de Resumo com Tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-400">Total Investido</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Valor total investido em todo o estoque atual (custo de compra × quantidade)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    R$ {financialSummary.totalInvestido.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-4">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-400">Valor Potencial</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Quanto você receberá se vender todo o estoque pelo preço de venda (preço × quantidade)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    R$ {financialSummary.valorPotencial.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-4">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-400">Lucro Estimado</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Lucro que você terá se vender todo o estoque (Valor Potencial - Total Investido)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    R$ {financialSummary.lucroEstimado.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Margem média: {financialSummary.margemMedia.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-4">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${alerts.length > 0 ? 'bg-red-500/20 animate-pulse' : 'bg-green-500/20'}`}>
                  <AlertTriangle className={`h-6 w-6 ${alerts.length > 0 ? 'text-red-400' : 'text-green-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-400">Alertas de Estoque</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Produtos com estoque baixo ou esgotado que precisam ser repostos</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-white">{alerts.length}</p>
                  <p className="text-xs text-gray-500">
                    {alerts.length === 0 ? '✓ Tudo OK!' : 'Atenção necessária'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Tabs de Relatórios */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800">
            <TabsTrigger value="resumo" className="gap-2">
              <Package className="h-4 w-4" />
              Estoque Atual
            </TabsTrigger>
            <TabsTrigger value="vendas" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Mais Vendidos
            </TabsTrigger>
            <TabsTrigger value="alertas" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas {alerts.length > 0 && <Badge variant="destructive" className="ml-1">{alerts.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="mt-4">
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">Estoque Atual por Produto</h3>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Veja o status de cada produto: quantidade disponível, valor investido e margem de lucro</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {lastRunMs > 0 && !isLoading && (
                    <span className="text-xs text-gray-500">
                      Carregado em {lastRunMs}ms
                    </span>
                  )}
                </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-12 flex-1" />
                      <Skeleton className="h-12 w-24" />
                      <Skeleton className="h-12 w-24" />
                    </div>
                  ))}
                </div>
              ) : !hasData ? (
                <div className="text-center text-gray-400 py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg mb-2">Nenhum produto com controle de estoque ativo</p>
                  <p className="text-sm">Configure produtos na aba "Produtos" para começar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Produto</TableHead>
                        <TableHead className="text-gray-300">Categoria</TableHead>
                        <TableHead className="text-gray-300 text-center">Estoque</TableHead>
                        <TableHead className="text-gray-300 text-right">Custo Unit.</TableHead>
                        <TableHead className="text-gray-300 text-right">Valor Estoque</TableHead>
                        <TableHead className="text-gray-300 text-center">Margem</TableHead>
                        <TableHead className="text-gray-300 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockReport.map((item) => (
                        <TableRow key={item.produto_id} className="border-gray-700">
                          <TableCell className="text-white font-medium">{item.produto_nome}</TableCell>
                          <TableCell className="text-gray-400">{item.categoria}</TableCell>
                          <TableCell className="text-center">
                            <StockStatusBadge
                              quantidade={item.quantidade}
                              estoqueMinimo={item.estoque_minimo}
                              unidade={item.unidade_medida}
                            />
                          </TableCell>
                          <TableCell className="text-right text-white font-mono">
                            R$ {item.custo_unitario.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-white font-mono font-bold">
                            R$ {item.valor_estoque.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <ProfitMarginBadge margem={item.margem_lucro} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={item.status === 'ok' ? 'default' : item.status === 'atencao' ? 'secondary' : 'destructive'}>
                              {item.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

          <TabsContent value="vendas" className="mt-4">
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-white">Top 20 Produtos Mais Vendidos</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Produtos com melhor desempenho nos últimos 30 dias. Use para priorizar compras e promoções.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-gray-400 mb-4">📊 Últimos 30 dias - Use para planejar suas compras prioritárias</p>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-12 w-12" />
                      <Skeleton className="h-12 flex-1" />
                      <Skeleton className="h-12 w-24" />
                    </div>
                  ))}
                </div>
              ) : topSelling.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg mb-2">Nenhuma venda registrada nos últimos 30 dias</p>
                  <p className="text-sm">Vendas aparecerão aqui quando houver pedidos</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Posição</TableHead>
                        <TableHead className="text-gray-300">Produto</TableHead>
                        <TableHead className="text-gray-300 text-right">Total Vendido</TableHead>
                        <TableHead className="text-gray-300 text-right">Receita Total</TableHead>
                        <TableHead className="text-gray-300 text-right">N° Pedidos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSelling.map((item, index) => (
                        <TableRow key={item.produto_id} className="border-gray-700">
                          <TableCell className="text-white font-bold">#{index + 1}</TableCell>
                          <TableCell className="text-white font-medium">{item.produto_nome}</TableCell>
                          <TableCell className="text-right text-green-400 font-bold">
                            {item.total_vendido}
                          </TableCell>
                          <TableCell className="text-right text-white font-mono">
                            R$ {Number(item.receita_total).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-gray-300">
                            {item.quantidade_pedidos}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

          <TabsContent value="alertas" className="mt-4">
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">Alertas de Estoque Baixo</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Produtos que precisam de reposição urgente para evitar vendas perdidas</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-gray-400 mb-4">⚠️ Ação necessária - Repor estes produtos o mais rápido possível</p>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-12 flex-1" />
                      <Skeleton className="h-12 w-24" />
                      <Skeleton className="h-12 w-24" />
                    </div>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Nenhum alerta no momento. Todos os estoques estão OK! 🎉
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Produto</TableHead>
                        <TableHead className="text-gray-300 text-center">Quantidade Atual</TableHead>
                        <TableHead className="text-gray-300 text-center">Estoque Mínimo</TableHead>
                        <TableHead className="text-gray-300 text-center">Diferença</TableHead>
                        <TableHead className="text-gray-300 text-center">Nível</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.produto_id} className="border-gray-700">
                          <TableCell className="text-white font-medium">{alert.produto_nome}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={alert.status === 'critico' ? 'destructive' : 'secondary'}>
                              {alert.quantidade_atual}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-gray-300">
                            {alert.estoque_minimo}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-red-400 font-bold">
                              -{alert.diferenca}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={alert.status === 'critico' ? 'destructive' : 'secondary'}>
                              {alert.status === 'critico' ? 'CRÍTICO' : 'ATENÇÃO'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
