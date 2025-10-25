import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, User, MapPin, Phone, DollarSign, Package, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
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

interface MotoboyPedidoDetalheModalProps {
  pedido: Pedido;
  onClose: () => void;
  onUpdate: () => void;
}

const MotoboyPedidoDetalheModal: React.FC<MotoboyPedidoDetalheModalProps> = ({
  pedido,
  onClose,
  onUpdate
}) => {
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const { toast } = useToast();

  const handleConfirmDelivery = async () => {
    setConfirmingDelivery(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'entregue' })
        .eq('id', pedido.id);

      if (error) throw error;

      toast({
        title: "Entrega confirmada!",
        description: `Pedido #${pedido.codigo_pedido} foi marcado como entregue.`,
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      toast({
        title: "Erro ao confirmar entrega",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setConfirmingDelivery(false);
    }
  };

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white w-[95vw] max-w-2xl h-[90vh] max-h-[90vh] p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-gray-800 p-2"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <DialogTitle className="text-lg sm:text-xl">
                Pedido #{pedido.codigo_pedido}
              </DialogTitle>
              {getStatusBadge(pedido.status)}
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            {format(new Date(pedido.data_criacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] sm:h-[calc(90vh-200px)]">
          <div className="space-y-4 pr-4">
            {/* Informações do Cliente */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-3">
              <h3 className="font-bold flex items-center gap-2 text-base sm:text-lg">
                <User size={20} />
                Informações do Cliente
              </h3>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="text-base sm:text-lg"><strong>Nome:</strong> <span className="text-white">{pedido.cliente_nome}</span></div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-1 flex-shrink-0" />
                  <div>
                    <div>{pedido.cliente_endereco}</div>
                    {pedido.cliente_complemento && (
                      <div className="text-gray-400">Complemento: {pedido.cliente_complemento}</div>
                    )}
                    {pedido.cliente_referencia && (
                      <div className="text-gray-400">Referência: {pedido.cliente_referencia}</div>
                    )}
                    <div><strong>Bairro:</strong> {pedido.cliente_bairro}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <a 
                    href={`https://wa.me/55${pedido.cliente_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 underline font-semibold"
                  >
                    {pedido.cliente_whatsapp}
                  </a>
                </div>
              </div>
            </div>

            {/* Itens do Pedido */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Package size={18} />
                Itens do Pedido
              </h3>
              <div className="space-y-2">
                {pedido.itens.map((item: any, index: number) => {
                  const qty = Number(item.qty) || 0;
                  const price = Number(item.price) || 0;
                  const itemTotal = price * qty;
                  
                  return (
                    <div key={index} className="flex justify-between text-sm border-b border-gray-700 pb-2">
                      <div>
                        <div>{qty}x {item.name}</div>
                        {item.ice && typeof item.ice === 'object' && Object.entries(item.ice).some(([_, qty]) => Number(qty) > 0) && (
                          <div className="text-gray-400 text-xs">
                            Gelo: {Object.entries(item.ice)
                              .filter(([_, qty]) => Number(qty) > 0)
                              .map(([flavor, qty]) => `${flavor} x${qty}`)
                              .join(", ")}
                          </div>
                        )}
                        {item.alcohol && <div className="text-gray-400 text-xs">Bebida: {item.alcohol}</div>}
                      </div>
                      <div className="text-green-400">R$ {itemTotal.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-2">
              <h3 className="font-bold flex items-center gap-2">
                <DollarSign size={18} />
                Pagamento
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {((Number(pedido.total) || 0) - (Number(pedido.taxa_entrega) || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span>R$ {(Number(pedido.taxa_entrega) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2">
                  <span>Total:</span>
                  <span className="text-green-400">R$ {(Number(pedido.total) || 0).toFixed(2)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div><strong>Forma:</strong> {pedido.forma_pagamento}</div>
                  {pedido.troco && <div><strong>Troco para:</strong> R$ {pedido.troco}</div>}
                </div>
              </div>
            </div>

            {/* Informações do Entregador */}
            {pedido.entregador && (
              <div className="bg-purple-600/20 border border-purple-600 p-4 rounded-lg">
                <h3 className="font-bold text-base sm:text-lg mb-2">Entregador Responsável</h3>
                <div className="text-lg">
                  <strong className="text-white">{pedido.entregador}</strong>
                </div>
              </div>
            )}

            {/* Botão Confirmar Entrega */}
            <Button
              onClick={handleConfirmDelivery}
              disabled={confirmingDelivery}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold"
              size="lg"
            >
              <CheckCircle size={24} className="mr-2" />
              {confirmingDelivery ? 'Confirmando...' : 'Confirmar Entrega'}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MotoboyPedidoDetalheModal;
