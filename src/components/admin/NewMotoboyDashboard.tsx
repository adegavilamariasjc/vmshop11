import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, MessageCircle, Package } from 'lucide-react';
import Logo from '../Logo';
import MotoboyChat from './MotoboyChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MotoboyPedido {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_endereco: string;
  cliente_numero: string;
  cliente_complemento: string;
  cliente_referencia: string;
  cliente_bairro: string;
  cliente_whatsapp: string;
  status: string;
  total: number;
  taxa_entrega: number;
  data_criacao: string;
  forma_pagamento: string;
  troco: string;
  observacao: string;
}

interface NewMotoboyDashboardProps {
  onLogout: () => void;
}

const NewMotoboyDashboard: React.FC<NewMotoboyDashboardProps> = ({ onLogout }) => {
  const [pedidos, setPedidos] = useState<MotoboyPedido[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<MotoboyPedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPedidos();
    subscribeToRealtime();
  }, []);

  const loadPedidos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .in('status', ['aceito', 'preparando', 'pronto', 'em_deslocamento'])
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      setPedidos(data || []);
      
      // Auto-select first available pedido
      if (data && data.length > 0 && !selectedPedido) {
        setSelectedPedido(data[0]);
      }
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

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel('motoboy-pedidos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          loadPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPedidos();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleStatusChange = async (pedidoId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', pedidoId);

      if (error) throw error;

      // Update local state
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, status: newStatus } : p
      ));
      
      if (selectedPedido?.id === pedidoId) {
        setSelectedPedido(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast({
        title: "Status atualizado",
        description: `Pedido ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
      case 'aceito': return 'Aceito';
      case 'preparando': return 'Em Produção';
      case 'pronto': return 'Pronto';
      case 'em_deslocamento': return 'Em Deslocamento';
      case 'entregue': return 'Entregue';
      default: return status;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="w-40">
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="bg-purple-dark hover:bg-purple-600 text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onLogout}
            className="text-white"
          >
            Sair
          </Button>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Pedidos List */}
        <div className="lg:col-span-1">
          <Card className="bg-black/50 border-purple-dark h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pedidos Ativos ({pedidos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto">
              {isLoading ? (
                <div className="text-center text-gray-400">Carregando...</div>
              ) : pedidos.length === 0 ? (
                <div className="text-center text-gray-400">Nenhum pedido ativo</div>
              ) : (
                <div className="space-y-3">
                  {pedidos.map((pedido) => (
                    <Card 
                      key={pedido.id}
                      className={`cursor-pointer transition-all ${
                        selectedPedido?.id === pedido.id 
                          ? 'bg-purple-dark border-purple-light' 
                          : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedPedido(pedido)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-white">#{pedido.codigo_pedido}</span>
                          <Badge className={`${getStatusColor(pedido.status)} text-white text-xs`}>
                            {getStatusText(pedido.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{pedido.cliente_nome}</p>
                        <p className="text-xs text-gray-400">{pedido.cliente_bairro}</p>
                        <p className="text-sm text-green-400 font-medium mt-2">
                          Taxa: R$ {pedido.taxa_entrega.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedPedido ? (
            <MotoboyChat
              pedido={selectedPedido}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <Card className="bg-black/50 border-purple-dark h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Selecione um pedido</h3>
                <p className="text-gray-400">
                  Clique em um pedido à esquerda para iniciar o atendimento
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default NewMotoboyDashboard;