import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Package, ShoppingCart, TrendingUp, AlertTriangle, Search, Plus, Minus, Edit } from 'lucide-react';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { toast } from 'sonner';

interface ProductStock {
  id: number;
  name: string;
  categoria: string;
  quantidade_estoque: number;
  estoque_minimo: number;
  custo_compra: number;
  price: number;
  margem_lucro: number;
  unidade_medida: string;
  controlar_estoque: boolean;
  vendas_30d?: number;
  giro?: number;
  sugestao_compra?: number;
}

export const StockInventoryManager = () => {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterStatus]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);

      // Buscar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          quantidade_estoque,
          estoque_minimo,
          custo_compra,
          price,
          margem_lucro,
          unidade_medida,
          controlar_estoque,
          categories(name)
        `)
        .order('name');

      if (productsError) throw productsError;

      // Buscar vendas dos últimos 30 dias
      const { data: pedidosData } = await supabase
        .from('pedidos')
        .select('itens')
        .gte('data_criacao', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .neq('status', 'cancelado');

      // Calcular vendas por produto
      const vendasPorProduto: Record<number, number> = {};
      pedidosData?.forEach((pedido) => {
        const itens = pedido.itens as any[];
        itens.forEach((item) => {
          const prodId = Number(item.id);
          const qty = Number(item.qty);
          vendasPorProduto[prodId] = (vendasPorProduto[prodId] || 0) + qty;
        });
      });

      // Processar dados
      const processedProducts: ProductStock[] = (productsData || []).map((p: any) => {
        const vendas30d = vendasPorProduto[p.id] || 0;
        const giro = p.quantidade_estoque > 0 ? vendas30d / p.quantidade_estoque : 0;
        
        // Lógica inteligente de sugestão de compra
        let sugestaoCompra = 0;
        
        if (p.controlar_estoque) {
          // Se está abaixo do mínimo, sugerir pelo menos até o mínimo
          if (p.quantidade_estoque < p.estoque_minimo) {
            sugestaoCompra = p.estoque_minimo - p.quantidade_estoque;
          }
          
          // Se tem bom giro (vendeu mais que o estoque), aumentar sugestão
          if (giro > 1) {
            const projecao = Math.ceil(vendas30d * 1.5); // 50% a mais que vendeu
            sugestaoCompra = Math.max(sugestaoCompra, projecao - p.quantidade_estoque);
          }
          
          // Se vendeu nos últimos 30 dias mas está próximo ao mínimo
          if (vendas30d > 0 && p.quantidade_estoque <= p.estoque_minimo * 1.5) {
            sugestaoCompra = Math.max(sugestaoCompra, Math.ceil(vendas30d * 0.5));
          }
        }

        return {
          id: p.id,
          name: p.name,
          categoria: p.categories?.name || 'Sem categoria',
          quantidade_estoque: p.quantidade_estoque,
          estoque_minimo: p.estoque_minimo,
          custo_compra: p.custo_compra,
          price: p.price,
          margem_lucro: p.margem_lucro,
          unidade_medida: p.unidade_medida,
          controlar_estoque: p.controlar_estoque,
          vendas_30d: vendas30d,
          giro: giro,
          sugestao_compra: Math.max(0, sugestaoCompra),
        };
      });

      setProducts(processedProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de status
    switch (filterStatus) {
      case 'critico':
        filtered = filtered.filter(p => p.quantidade_estoque === 0);
        break;
      case 'baixo':
        filtered = filtered.filter(p => p.quantidade_estoque > 0 && p.quantidade_estoque <= p.estoque_minimo);
        break;
      case 'comprar':
        filtered = filtered.filter(p => p.sugestao_compra && p.sugestao_compra > 0);
        break;
      case 'ok':
        filtered = filtered.filter(p => p.quantidade_estoque > p.estoque_minimo);
        break;
    }

    setFilteredProducts(filtered);
  };

  const getStatusBadge = (produto: ProductStock) => {
    if (produto.quantidade_estoque === 0) {
      return <Badge variant="destructive">ESGOTADO</Badge>;
    }
    if (produto.quantidade_estoque <= produto.estoque_minimo) {
      return <Badge variant="secondary">BAIXO</Badge>;
    }
    return <Badge variant="default">OK</Badge>;
  };

  const handleAdjustStock = (produto: ProductStock) => {
    setSelectedProduct(produto);
    setShowAdjustModal(true);
  };

  const handleAdjustmentComplete = () => {
    setShowAdjustModal(false);
    setSelectedProduct(null);
    loadProducts();
  };

  // Calcular estatísticas
  const stats = {
    total: products.length,
    criticos: products.filter(p => p.quantidade_estoque === 0).length,
    baixo: products.filter(p => p.quantidade_estoque > 0 && p.quantidade_estoque <= p.estoque_minimo).length,
    comprar: products.filter(p => p.sugestao_compra && p.sugestao_compra > 0).length,
    valorTotal: products.reduce((sum, p) => sum + (p.quantidade_estoque * p.custo_compra), 0),
  };

  const listaCompras = products
    .filter(p => p.sugestao_compra && p.sugestao_compra > 0)
    .sort((a, b) => (b.sugestao_compra || 0) - (a.sugestao_compra || 0));

  const custoListaCompras = listaCompras.reduce((sum, p) => 
    sum + ((p.sugestao_compra || 0) * p.custo_compra), 0
  );

  return (
    <div className="space-y-4">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Package className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Produtos</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Esgotados</p>
              <p className="text-2xl font-bold text-white">{stats.criticos}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Package className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Estoque Baixo</p>
              <p className="text-2xl font-bold text-white">{stats.baixo}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Itens p/ Comprar</p>
              <p className="text-2xl font-bold text-white">{stats.comprar}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Valor Estoque</p>
              <p className="text-lg font-bold text-white">R$ {stats.valorTotal.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventario" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="inventario">Inventário Completo</TabsTrigger>
          <TabsTrigger value="compras">Lista de Compras</TabsTrigger>
        </TabsList>

        {/* Tab Inventário */}
        <TabsContent value="inventario" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4 space-y-4">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produto ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="critico">Esgotados</SelectItem>
                    <SelectItem value="baixo">Estoque Baixo</SelectItem>
                    <SelectItem value="comprar">Precisa Comprar</SelectItem>
                    <SelectItem value="ok">Estoque OK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabela */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Produto</TableHead>
                        <TableHead className="text-gray-300">Categoria</TableHead>
                        <TableHead className="text-gray-300 text-center">Estoque</TableHead>
                        <TableHead className="text-gray-300 text-center">Mínimo</TableHead>
                        <TableHead className="text-gray-300 text-right">Vendas 30d</TableHead>
                        <TableHead className="text-gray-300 text-center">Giro</TableHead>
                        <TableHead className="text-gray-300 text-center">Sugestão</TableHead>
                        <TableHead className="text-gray-300 text-center">Status</TableHead>
                        <TableHead className="text-gray-300 text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((produto) => (
                        <TableRow key={produto.id} className="border-gray-700">
                          <TableCell className="text-white font-medium">{produto.name}</TableCell>
                          <TableCell className="text-gray-400">{produto.categoria}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-mono font-bold ${
                              produto.quantidade_estoque === 0 ? 'text-red-400' :
                              produto.quantidade_estoque <= produto.estoque_minimo ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {produto.quantidade_estoque} {produto.unidade_medida}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-gray-300 font-mono">
                            {produto.estoque_minimo} {produto.unidade_medida}
                          </TableCell>
                          <TableCell className="text-right text-blue-400 font-mono">
                            {produto.vendas_30d || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={
                              (produto.giro || 0) > 1 ? 'default' :
                              (produto.giro || 0) > 0.5 ? 'secondary' :
                              'outline'
                            }>
                              {(produto.giro || 0).toFixed(2)}x
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {produto.sugestao_compra && produto.sugestao_compra > 0 ? (
                              <span className="text-purple-400 font-bold">
                                +{produto.sugestao_compra} {produto.unidade_medida}
                              </span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(produto)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjustStock(produto)}
                              className="gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Ajustar
                            </Button>
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

        {/* Tab Lista de Compras */}
        <TabsContent value="compras" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Lista Inteligente de Compras</h3>
                  <p className="text-sm text-gray-400">Baseado em vendas, giro e estoque mínimo</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Custo Estimado</p>
                  <p className="text-2xl font-bold text-green-400">R$ {custoListaCompras.toFixed(2)}</p>
                </div>
              </div>

              {listaCompras.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>Nenhum item precisa ser comprado no momento</p>
                  <p className="text-sm mt-2">Todos os estoques estão adequados!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Produto</TableHead>
                        <TableHead className="text-gray-300 text-center">Estoque Atual</TableHead>
                        <TableHead className="text-gray-300 text-center">Comprar</TableHead>
                        <TableHead className="text-gray-300 text-right">Custo Unit.</TableHead>
                        <TableHead className="text-gray-300 text-right">Custo Total</TableHead>
                        <TableHead className="text-gray-300">Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listaCompras.map((produto) => {
                        const custoTotal = (produto.sugestao_compra || 0) * produto.custo_compra;
                        let motivo = [];
                        
                        if (produto.quantidade_estoque === 0) motivo.push('Esgotado');
                        else if (produto.quantidade_estoque < produto.estoque_minimo) motivo.push('Abaixo do mínimo');
                        
                        if ((produto.giro || 0) > 1) motivo.push('Alto giro');
                        if ((produto.vendas_30d || 0) > 0) motivo.push(`${produto.vendas_30d} vendidos`);
                        
                        return (
                          <TableRow key={produto.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">{produto.name}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={produto.quantidade_estoque === 0 ? 'destructive' : 'secondary'}>
                                {produto.quantidade_estoque} {produto.unidade_medida}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-purple-400 font-bold text-lg">
                                {produto.sugestao_compra} {produto.unidade_medida}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-white font-mono">
                              R$ {produto.custo_compra.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-green-400 font-mono font-bold">
                              R$ {custoTotal.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {motivo.join(' • ')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Ajuste */}
      {selectedProduct && (
        <StockAdjustmentModal
          isOpen={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          produto={selectedProduct}
          onSuccess={handleAdjustmentComplete}
        />
      )}
    </div>
  );
};
