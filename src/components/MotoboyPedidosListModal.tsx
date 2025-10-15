import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, LogOut, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import MotoboyPedidoDetalheModal from './MotoboyPedidoDetalheModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pedido {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_bairro: string;
  cliente_endereco: string;
  cliente_complemento: string | null;
  cliente_referencia: string | null;
  cliente_whatsapp: string;
  total: number;
  taxa_entrega: number;
  status: string;
  entregador: string | null;
  data_criacao: string;
  itens: any;
  forma_pagamento: string;
  troco: string | null;
}

interface MotoboyPedidosListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MotoboyPedidosListModal: React.FC<MotoboyPedidosListModalProps> = ({
  isOpen,
  onClose
}) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const { toast } = useToast();

  const loadPedidos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .in('status', ['preparando', 'pronto', 'saiu_entrega'])
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPedidos();

      const channel = supabase
        .channel('motoboy-pedidos')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'pedidos' },
          () => loadPedidos()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      preparando: { label: 'Preparando', variant: 'secondary' },
      pronto: { label: 'Pronto', variant: 'default' },
      saiu_entrega: { label: 'Saiu para Entrega', variant: 'outline' }
    };
    
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen && !selectedPedido} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-4 sm:p-6">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Package size={20} className="sm:w-6 sm:h-6" />
                Pedidos para Entrega
              </DialogTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadPedidos}
                  disabled={loading}
                  className="border-gray-600 flex-1 sm:flex-initial"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sair
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-120px)] pr-2 sm:pr-4">
            <div className="space-y-3">
              {pedidos.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Nenhum pedido disponível
                </div>
              ) : (
                pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 cursor-pointer transition-colors"
                    onClick={() => setSelectedPedido(pedido)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-lg">#{pedido.codigo_pedido}</div>
                        <div className="text-sm text-gray-400">
                          {format(new Date(pedido.data_criacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      {getStatusBadge(pedido.status)}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div><strong>Cliente:</strong> {pedido.cliente_nome}</div>
                      <div><strong>Bairro:</strong> {pedido.cliente_bairro}</div>
                      <div className="text-gray-400 truncate">{pedido.cliente_endereco}</div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                        <span className="text-green-400 font-bold">
                          R$ {Number(pedido.total).toFixed(2)}
                        </span>
                        {pedido.entregador && (
                          <Badge variant="outline" className="bg-purple-600/20 border-purple-600">
                            {pedido.entregador}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedPedido && (
        <MotoboyPedidoDetalheModal
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
          onUpdate={loadPedidos}
        />
      )}
    </>
  );
};

export default MotoboyPedidosListModal;
