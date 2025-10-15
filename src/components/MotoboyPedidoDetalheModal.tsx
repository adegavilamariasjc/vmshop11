import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, User, MapPin, Phone, DollarSign, Package } from 'lucide-react';
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
  const [motoboyName, setMotoboyName] = useState(pedido.entregador || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveEntregador = async () => {
    const trimmedName = motoboyName.trim();
    
    if (!trimmedName) {
      toast({
        title: "Nome obrigatório",
        description: "Digite seu nome para registrar a entrega",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length < 2) {
      toast({
        title: "Nome muito curto",
        description: "Digite seu nome completo",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ entregador: trimmedName })
        .eq('id', pedido.id);

      if (error) throw error;

      toast({
        title: "Entregador registrado!",
        description: `${trimmedName} foi atribuído ao pedido #${pedido.codigo_pedido}`,
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar entregador:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
                {pedido.itens.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm border-b border-gray-700 pb-2">
                    <div>
                      <div>{item.quantity}x {item.name}</div>
                      {item.ice && <div className="text-gray-400 text-xs">Gelo: {item.ice}</div>}
                      {item.alcohol && <div className="text-gray-400 text-xs">Bebida: {item.alcohol}</div>}
                    </div>
                    <div className="text-green-400">R$ {Number(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
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
                  <span>R$ {(Number(pedido.total) - Number(pedido.taxa_entrega)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span>R$ {Number(pedido.taxa_entrega).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2">
                  <span>Total:</span>
                  <span className="text-green-400">R$ {Number(pedido.total).toFixed(2)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div><strong>Forma:</strong> {pedido.forma_pagamento}</div>
                  {pedido.troco && <div><strong>Troco para:</strong> R$ {pedido.troco}</div>}
                </div>
              </div>
            </div>

            {/* Registrar Entregador */}
            <div className="bg-purple-600/20 border border-purple-600 p-4 rounded-lg space-y-3">
              <h3 className="font-bold text-base sm:text-lg">Registrar Entregador</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Digite seu nome completo"
                  value={motoboyName}
                  onChange={(e) => setMotoboyName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={saving}
                  required
                />
                <Button
                  onClick={handleSaveEntregador}
                  disabled={saving || !motoboyName.trim()}
                  className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
              {pedido.entregador && (
                <div className="text-sm text-gray-400">
                  Entregador atual: <strong className="text-white">{pedido.entregador}</strong>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MotoboyPedidoDetalheModal;
