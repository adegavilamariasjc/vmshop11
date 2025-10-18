import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Eye, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import PedidoDetalhe from './PedidoDetalhe';
import { useOrderAlerts } from '@/hooks/pedidos/useOrderAlerts';
import { useIsMobile } from '@/hooks/use-mobile';

interface PedidoSimplificado {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_bairro: string;
  status: string;
  total: number;
  taxa_entrega: number;
  data_criacao: string;
  forma_pagamento: string;
}

interface SimplifiedAdminPedidosProps {
  filterType?: 'delivery' | 'balcao';
  title?: string;
}

const SimplifiedAdminPedidos: React.FC<SimplifiedAdminPedidosProps> = ({ 
  filterType = 'delivery',
  title = 'Pedidos'
}) => {
  const [pedidos, setPedidos] = useState<PedidoSimplificado[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<string | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { setupRealtimeMonitoring, stopAlert } = useOrderAlerts();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadPedidos();
    
    // Setup realtime with audio alerts
    const cleanup = setupRealtimeMonitoring((updatedPedidos) => {
      console.log('📥 Pedidos updated via realtime:', updatedPedidos.length);
      
      // Apply the same filter as loadPedidos
      const filteredPedidos = filterType === 'balcao'
        ? updatedPedidos.filter(p => p.cliente_bairro === 'BALCAO')
        : updatedPedidos.filter(p => p.cliente_bairro !== 'BALCAO');
      
      console.log('🔍 Filtered pedidos for', filterType, ':', filteredPedidos.length);
      setPedidos(filteredPedidos);
    });

    return cleanup;
  }, [setupRealtimeMonitoring, filterType]);

  const loadPedidos = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('pedidos')
        .select('id, codigo_pedido, cliente_nome, cliente_bairro, status, total, taxa_entrega, data_criacao, forma_pagamento');

      // Apply filter based on type
      if (filterType === 'balcao') {
        query = query.eq('cliente_bairro', 'BALCAO');
      } else {
        query = query.neq('cliente_bairro', 'BALCAO');
      }

      const { data, error } = await query.order('data_criacao', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error loading pedidos:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPedidos();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleAcceptOrder = async (pedidoId: string) => {
    try {
      console.log('🎯 Accepting order:', pedidoId);
      
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'aceito' })
        .eq('id', pedidoId);

      if (error) throw error;

      // Update local state
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, status: 'aceito' } : p
      ));

      // Check if there are still pending orders (excluding balcão)
      const stillHasPending = pedidos.some(p => 
        p.id !== pedidoId && 
        p.status === 'pendente' && 
        p.cliente_bairro !== 'BALCAO'
      );
      
      // Stop alert if no more pending orders
      if (!stillHasPending) {
        console.log('✅ No more pending orders, stopping alert');
        stopAlert();
      }

      toast({
        title: "Pedido aceito",
        description: "O pedido foi aceito e enviado para produção",
      });
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Erro ao aceitar pedido",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleViewOrder = (pedidoId: string) => {
    setSelectedPedido(pedidoId);
    setShowDetalhe(true);
  };

  const getClientDisplayName = (nomeCompleto: string, isBalcao: boolean) => {
    if (isBalcao && nomeCompleto.startsWith('BALCÃO - ')) {
      // Extract employee name and show first name prominently
      const funcionarioNome = nomeCompleto.replace('BALCÃO - ', '');
      const primeiroNome = funcionarioNome.split(' ')[0];
      return (
        <span>
          <span className="font-bold text-orange-400">BALCÃO</span>
          {' - '}
          <span className="font-bold text-lg">{primeiroNome}</span>
          {funcionarioNome.length > primeiroNome.length && (
            <span className="text-sm text-gray-400"> {funcionarioNome.substring(primeiroNome.length)}</span>
          )}
        </span>
      );
    }
    
    // For delivery orders, show first name prominently
    const primeiroNome = nomeCompleto.split(' ')[0];
    return (
      <span>
        <span className="font-bold text-lg">{primeiroNome}</span>
        {nomeCompleto.length > primeiroNome.length && (
          <span className="text-sm text-gray-400"> {nomeCompleto.substring(primeiroNome.length)}</span>
        )}
      </span>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500';
      case 'aceito': return 'bg-blue-500';
      case 'preparando': return 'bg-orange-500';
      case 'pronto': return 'bg-green-500';
      case 'em_deslocamento': return 'bg-purple-500';
      case 'entregue': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aceito': return 'Aceito';
      case 'preparando': return 'Em Produção';
      case 'pronto': return 'Pronto';
      case 'em_deslocamento': return 'Em Deslocamento';
      case 'entregue': return 'Entregue';
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="bg-purple-dark hover:bg-purple-600 text-white w-full sm:w-auto"
          size="sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      
      <Card className="bg-black/50 border-purple-dark">
        <CardContent className="p-2 sm:p-6">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Carregando...</div>
          ) : pedidos.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Nenhum pedido encontrado</div>
          ) : isMobile ? (
            <div className="space-y-3">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-white font-mono font-bold">#{pedido.codigo_pedido}</span>
                    <Badge className={`${getStatusColor(pedido.status)} text-white text-xs`}>
                      {getStatusText(pedido.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Cliente:</span>
                      <span className="text-white">{getClientDisplayName(pedido.cliente_nome, pedido.cliente_bairro === 'BALCAO')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bairro:</span>
                      <span className="text-white">{pedido.cliente_bairro}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pagamento:</span>
                      <span className="text-white">{pedido.forma_pagamento}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-green-400">R$ {pedido.total.toFixed(2)}</span>
                    </div>
                    <div className="text-gray-400 text-xs pt-1">
                      {new Date(pedido.data_criacao).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                    <Button
                      onClick={() => handleViewOrder(pedido.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {pedido.status === 'pendente' && (
                      <Button
                        onClick={() => handleAcceptOrder(pedido.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Código</TableHead>
                    <TableHead className="text-white">Cliente</TableHead>
                    <TableHead className="text-white">Bairro</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Total</TableHead>
                    <TableHead className="text-white">Data/Hora</TableHead>
                    <TableHead className="text-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="text-white font-medium">
                        #{pedido.codigo_pedido}
                      </TableCell>
                      <TableCell className="text-white">{getClientDisplayName(pedido.cliente_nome, pedido.cliente_bairro === 'BALCAO')}</TableCell>
                      <TableCell className="text-white">{pedido.cliente_bairro}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(pedido.status)} text-white`}>
                          {getStatusText(pedido.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        R$ {pedido.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-white">
                        {new Date(pedido.data_criacao).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleViewOrder(pedido.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {pedido.status === 'pendente' && (
                            <Button
                              onClick={() => handleAcceptOrder(pedido.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showDetalhe && selectedPedido && (
        <PedidoDetalhe 
          pedidoId={selectedPedido}
          onClose={() => setShowDetalhe(false)}
          onDelete={handleRefresh}
          onStatusChange={() => {}}
        />
      )}
    </div>
  );
};

export default SimplifiedAdminPedidos;