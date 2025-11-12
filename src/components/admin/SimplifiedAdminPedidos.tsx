import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Eye, Check, UserPlus, MapPin, Phone, DollarSign, BellOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import PedidoDetalhe from './PedidoDetalhe';
import { useOrderAlerts } from '@/hooks/pedidos/useOrderAlerts';
import DelivererSelectModal from './DelivererSelectModal';

interface PedidoSimplificado {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_bairro: string;
  cliente_endereco: string;
  cliente_numero: string | null;
  cliente_complemento: string | null;
  cliente_referencia: string | null;
  cliente_whatsapp: string;
  status: string;
  total: number;
  taxa_entrega: number;
  data_criacao: string;
  forma_pagamento: string;
  troco: string | null;
  entregador: string | null;
  itens: any;
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
  const [delivererModalOpen, setDelivererModalOpen] = useState(false);
  const [selectedPedidoForDeliverer, setSelectedPedidoForDeliverer] = useState<string | null>(null);
  const { toast } = useToast();
  const { setupRealtimeMonitoring, muteAlerts, stopAlert } = useOrderAlerts();

  useEffect(() => {
    loadPedidos();
    
    // Only setup audio alerts for delivery, not for balcao
    let cleanup: (() => void) | null = null;
    
    if (filterType === 'delivery') {
      // Setup realtime with audio alerts for delivery
      cleanup = setupRealtimeMonitoring((updatedPedidos) => {
        console.log('📥 Pedidos updated via realtime:', updatedPedidos.length);
        const filteredPedidos = updatedPedidos.filter(p => p.cliente_bairro !== 'BALCAO');
        console.log('🔍 Filtered pedidos for delivery:', filteredPedidos.length);
        setPedidos(filteredPedidos);
      });
    } else {
      // For balcao, setup realtime without audio alerts
      const channel = supabase
        .channel('balcao-pedidos-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pedidos'
          },
          () => {
            console.log('📥 Balcão pedidos changed, reloading...');
            loadPedidos();
          }
        )
        .subscribe();
      
      cleanup = () => {
        supabase.removeChannel(channel);
      };
    }

    return cleanup;
  }, [setupRealtimeMonitoring, filterType]);

  const loadPedidos = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('pedidos')
        .select('*');

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

  const handleAssignDeliverer = (pedidoId: string) => {
    setSelectedPedidoForDeliverer(pedidoId);
    setDelivererModalOpen(true);
  };

  const handleConfirmDeliverer = async (deliverer: string) => {
    if (!selectedPedidoForDeliverer) return;

    // Find the full pedido object
    const pedidoData = pedidos.find(p => p.id === selectedPedidoForDeliverer);
    if (!pedidoData) return;

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ entregador: deliverer })
        .eq('id', selectedPedidoForDeliverer);

      if (error) throw error;

      // Update local state
      setPedidos(prev => prev.map(p => 
        p.id === selectedPedidoForDeliverer ? { ...p, entregador: deliverer } : p
      ));

      toast({
        title: "Entregador atribuído",
        description: `Pedido atribuído para ${deliverer}`,
      });

      // Send to Telegram with deliverer info
      try {
        console.log('📤 Enviando pedido para Telegram com entregador:', deliverer);
        await supabase.functions.invoke('send-telegram-order', {
          body: {
            codigoPedido: pedidoData.codigo_pedido,
            clienteNome: pedidoData.cliente_nome,
            clienteEndereco: pedidoData.cliente_endereco,
            clienteNumero: pedidoData.cliente_numero,
            clienteComplemento: pedidoData.cliente_complemento,
            clienteReferencia: pedidoData.cliente_referencia,
            clienteBairro: pedidoData.cliente_bairro,
            taxaEntrega: pedidoData.taxa_entrega,
            clienteWhatsapp: pedidoData.cliente_whatsapp,
            formaPagamento: pedidoData.forma_pagamento,
            troco: pedidoData.troco,
            observacao: null,
            itens: pedidoData.itens,
            total: pedidoData.total,
            discountAmount: 0,
            entregador: deliverer
          }
        });
        console.log('✅ Pedido enviado para Telegram');
      } catch (telegramError) {
        console.error('❌ Erro ao enviar para Telegram:', telegramError);
      }

      // Broadcast alert to motoboys
      try {
        console.log('🔔 Enviando alerta para motoboys');
        const channel = supabase.channel('motoboy-alerts');
        await channel.send({
          type: 'broadcast',
          event: 'play-alert',
          payload: { pedidoId: selectedPedidoForDeliverer, entregador: deliverer }
        });
        console.log('✅ Alerta enviado para motoboys');
      } catch (broadcastError) {
        console.error('❌ Erro ao enviar alerta:', broadcastError);
      }

    } catch (error) {
      console.error('Error assigning deliverer:', error);
      toast({
        title: "Erro ao atribuir entregador",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Carregando...</div>
        ) : pedidos.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Nenhum pedido encontrado</div>
        ) : (
          pedidos.map((pedido) => (
            <Card key={pedido.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-white font-mono font-bold text-lg">#{pedido.codigo_pedido}</span>
                    <div className="text-gray-400 text-sm mt-1">
                      {new Date(pedido.data_criacao).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(pedido.status)} text-white`}>
                    {getStatusText(pedido.status)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[80px]">Cliente:</span>
                    <span className="text-white font-medium">{getClientDisplayName(pedido.cliente_nome, pedido.cliente_bairro === 'BALCAO')}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-white">
                        {pedido.cliente_endereco}
                        {pedido.cliente_numero && `, ${pedido.cliente_numero}`}
                      </div>
                      {pedido.cliente_complemento && (
                        <div className="text-gray-400 text-xs">{pedido.cliente_complemento}</div>
                      )}
                      {pedido.cliente_referencia && (
                        <div className="text-gray-400 text-xs">Ref: {pedido.cliente_referencia}</div>
                      )}
                      <div className="text-white font-medium mt-1">{pedido.cliente_bairro}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{pedido.cliente_whatsapp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-white">{pedido.forma_pagamento}</span>
                      {pedido.troco && (
                        <span className="text-gray-400 text-xs ml-2">Troco: {pedido.troco}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Taxa Entrega:</span>
                      <span className="text-white">R$ {pedido.taxa_entrega.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold mt-1">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-green-400 text-lg">R$ {pedido.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {pedido.entregador && (
                    <div className="pt-2 border-t border-gray-700">
                      <Badge variant="outline" className="bg-purple-600/20 border-purple-600 text-purple-300">
                        Entregador: {pedido.entregador}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-700">
                  <Button
                    onClick={() => handleViewOrder(pedido.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                  
                  {pedido.status === 'pendente' && filterType !== 'balcao' && (
                    <Button
                      onClick={() => handleAcceptOrder(pedido.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                  )}

                  {filterType === 'delivery' && !pedido.entregador && pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
                    <Button
                      onClick={() => handleAssignDeliverer(pedido.id)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Atribuir Motoboy
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showDetalhe && selectedPedido && (
        <PedidoDetalhe 
          pedidoId={selectedPedido}
          onClose={() => setShowDetalhe(false)}
          onDelete={handleRefresh}
          onStatusChange={() => {}}
        />
      )}

      <DelivererSelectModal
        open={delivererModalOpen}
        onOpenChange={setDelivererModalOpen}
        onConfirm={handleConfirmDeliverer}
      />
    </div>
  );
};

export default SimplifiedAdminPedidos;