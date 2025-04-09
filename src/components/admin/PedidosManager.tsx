
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellRing, Printer, Eye, Check, RefreshCcw, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import PedidoDetalhe from './PedidoDetalhe';
import { fetchPedidos, updatePedidoStatus, deletePedido, SupabasePedido } from '@/lib/supabase';

interface Pedido {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_bairro: string;
  forma_pagamento: string;
  total: number;
  status: string;
  data_criacao: string;
}

const PedidosManager: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<string | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [hasNewPedido, setHasNewPedido] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Criar elemento de áudio para notificação com som de telefone antigo
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3');
    
    // Buscar pedidos iniciais
    fetchPedidosData();
    
    // Configurar listener para novos pedidos
    const channel = supabase
      .channel('pedidos-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'pedidos' 
        }, 
        (payload) => {
          console.log('Novo pedido recebido:', payload);
          // Tocar alerta sonoro
          playAlertSound();
          // Atualizar lista de pedidos
          fetchPedidosData();
          // Mostrar notificação
          setHasNewPedido(true);
          toast({
            title: "Novo Pedido Recebido!",
            description: "Um cliente finalizou um pedido no sistema.",
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidosData = async () => {
    setIsLoading(true);
    try {
      const pedidosData = await fetchPedidos();
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPedidosData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Erro ao tocar som:", e));
    }
  };

  const handleAcknowledge = () => {
    setHasNewPedido(false);
  };

  const handleVisualizarPedido = (id: string) => {
    setSelectedPedido(id);
    setShowDetalhe(true);
  };

  const handleExcluirPedido = async (id: string, codigo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o pedido ${codigo}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const success = await deletePedido(id);
      
      if (!success) {
        throw new Error('Falha ao excluir pedido');
      }
      
      // Atualizar a lista de pedidos após exclusão
      setPedidos(pedidos.filter(p => p.id !== id));
      
      toast({
        title: 'Pedido excluído',
        description: `O pedido ${codigo} foi excluído com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o pedido.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAtualizarStatus = async (id: string, novoStatus: string) => {
    try {
      const success = await updatePedidoStatus(id, novoStatus);
      
      if (!success) {
        throw new Error('Falha ao atualizar status');
      }
      
      // Atualizar o status localmente para evitar nova busca
      setPedidos(pedidos.map(p => 
        p.id === id ? { ...p, status: novoStatus } : p
      ));
      
      toast({
        title: 'Status atualizado',
        description: `Pedido marcado como ${novoStatus}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-600 text-white">Pendente</Badge>;
      case 'preparando':
        return <Badge className="bg-blue-600 text-white">Preparando</Badge>;
      case 'entregue':
        return <Badge className="bg-green-600 text-white">Entregue</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-600 text-white">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return <div className="text-center py-4 text-white">Carregando pedidos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Gerenciar Pedidos</h2>
        <div className="flex items-center gap-3">
          {hasNewPedido && (
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium flex items-center gap-2 animate-pulse"
              onClick={handleAcknowledge}
            >
              <BellRing size={16} />
              <span>Novo Pedido!</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            className="text-black font-medium border-gray-600"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCcw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      <div className="bg-black/50 rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800">
            <TableRow>
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Cliente</TableHead>
              <TableHead className="text-white">Local</TableHead>
              <TableHead className="text-white">Pagamento</TableHead>
              <TableHead className="text-white text-right">Total</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Data/Hora</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id} className="border-gray-700 hover:bg-gray-800">
                <TableCell className="text-white font-mono">
                  {pedido.codigo_pedido}
                </TableCell>
                <TableCell className="text-white">
                  {pedido.cliente_nome}
                </TableCell>
                <TableCell className="text-white">
                  {pedido.cliente_bairro}
                </TableCell>
                <TableCell className="text-white">
                  {pedido.forma_pagamento}
                </TableCell>
                <TableCell className="text-white text-right">
                  R$ {pedido.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(pedido.status)}
                </TableCell>
                <TableCell className="text-white text-sm">
                  {formatDateTime(pedido.data_criacao)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleVisualizarPedido(pedido.id)}
                      className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                      title="Ver detalhes"
                    >
                      <Eye size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleAtualizarStatus(pedido.id, 'preparando')}
                      disabled={pedido.status !== 'pendente'}
                      className="text-yellow-500 hover:text-yellow-400 hover:bg-gray-700"
                      title="Marcar como preparando"
                    >
                      <Check size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleAtualizarStatus(pedido.id, 'entregue')}
                      disabled={pedido.status !== 'preparando'}
                      className="text-green-500 hover:text-green-400 hover:bg-gray-700"
                      title="Marcar como entregue"
                    >
                      <Check size={18} className="mr-1" />
                      <Check size={18} className="-ml-2" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleVisualizarPedido(pedido.id)}
                      className="text-purple-500 hover:text-purple-400 hover:bg-gray-700"
                      title="Imprimir pedido"
                    >
                      <Printer size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleExcluirPedido(pedido.id, pedido.codigo_pedido)}
                      className="text-red-500 hover:text-red-400 hover:bg-gray-700"
                      title="Excluir pedido"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pedidos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-6">
                  Nenhum pedido registrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {showDetalhe && selectedPedido && (
        <PedidoDetalhe 
          pedidoId={selectedPedido} 
          onClose={() => setShowDetalhe(false)} 
          onDelete={fetchPedidosData} 
        />
      )}
    </div>
  );
};

export default PedidosManager;
