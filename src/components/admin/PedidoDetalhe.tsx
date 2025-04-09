
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PedidoDetalheProps {
  pedidoId: string;
  onClose: () => void;
}

interface PedidoCompleto {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_endereco: string;
  cliente_numero: string;
  cliente_complemento: string;
  cliente_referencia: string;
  cliente_bairro: string;
  taxa_entrega: number;
  cliente_whatsapp: string;
  forma_pagamento: string;
  troco: string;
  itens: {
    name: string;
    qty: number;
    price: number;
    ice?: Record<string, number>;
    alcohol?: string;
  }[];
  total: number;
  status: string;
  data_criacao: string;
  observacao: string;
}

const PedidoDetalhe: React.FC<PedidoDetalheProps> = ({ pedidoId, onClose }) => {
  const [pedido, setPedido] = useState<PedidoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const impressaoRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPedido();
  }, [pedidoId]);

  const fetchPedido = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setPedido(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do pedido.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprimir = () => {
    if (!impressaoRef.current) return;
    
    setIsPrinting(true);
    
    const conteudo = impressaoRef.current;
    const janela = window.open('', '_blank');
    
    if (janela) {
      janela.document.write(`
        <html>
          <head>
            <title>Pedido ${pedido?.codigo_pedido}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                width: 80mm;
                margin: 0 auto;
                padding: 5mm;
              }
              .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .title {
                font-size: 18px;
                font-weight: bold;
              }
              .info {
                margin-bottom: 10px;
              }
              .items {
                margin-top: 10px;
                margin-bottom: 10px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .item {
                margin-bottom: 5px;
              }
              .total {
                font-weight: bold;
                text-align: right;
                font-size: 16px;
                margin-top: 10px;
                margin-bottom: 10px;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                margin-top: 20px;
                border-top: 1px dashed #000;
                padding-top: 10px;
              }
              .print-hidden {
                display: none;
              }
              .status {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: bold;
                background-color: #ccc;
                color: white;
              }
              .status-pendente {
                background-color: #f59e0b;
              }
              .status-preparando {
                background-color: #3b82f6;
              }
              .status-entregue {
                background-color: #10b981;
              }
              .status-cancelado {
                background-color: #ef4444;
              }
            </style>
          </head>
          <body>
            ${conteudo.innerHTML}
            <div class="footer">
              Obrigado pela preferência!<br>
              ADEGA VM
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 750);
              };
            </script>
          </body>
        </html>
      `);
      
      janela.document.close();
    }
    
    setIsPrinting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <span className="status status-pendente">Pendente</span>;
      case 'preparando':
        return <span className="status status-preparando">Preparando</span>;
      case 'entregue':
        return <span className="status status-entregue">Entregue</span>;
      case 'cancelado':
        return <span className="status status-cancelado">Cancelado</span>;
      default:
        return <span className="status">{status}</span>;
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

  const calcularSubtotal = () => {
    if (!pedido) return 0;
    return pedido.total - pedido.taxa_entrega;
  };

  const handleAtualizarStatus = async (novoStatus: string) => {
    if (!pedido) return;
    
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: novoStatus })
        .eq('id', pedido.id);
      
      if (error) {
        throw error;
      }
      
      setPedido({
        ...pedido,
        status: novoStatus
      });
      
      toast({
        title: 'Status atualizado',
        description: `Pedido marcado como ${novoStatus}.`
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Detalhes do Pedido {pedido?.codigo_pedido}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-8">Carregando detalhes do pedido...</div>
        ) : pedido ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div ref={impressaoRef}>
                <div className="header">
                  <div className="title">ADEGA VM</div>
                  <div>PEDIDO #{pedido.codigo_pedido}</div>
                  <div>{formatDateTime(pedido.data_criacao)}</div>
                  <div className="print-hidden">{getStatusBadge(pedido.status)}</div>
                </div>
                
                <div className="info">
                  <div><strong>Cliente:</strong> {pedido.cliente_nome}</div>
                  <div><strong>Endereço:</strong> {pedido.cliente_endereco}, {pedido.cliente_numero}</div>
                  {pedido.cliente_complemento && (
                    <div><strong>Complemento:</strong> {pedido.cliente_complemento}</div>
                  )}
                  {pedido.cliente_referencia && (
                    <div><strong>Referência:</strong> {pedido.cliente_referencia}</div>
                  )}
                  <div><strong>Bairro:</strong> {pedido.cliente_bairro}</div>
                  <div><strong>WhatsApp:</strong> {pedido.cliente_whatsapp}</div>
                  {pedido.observacao && (
                    <div><strong>Observação:</strong> {pedido.observacao}</div>
                  )}
                </div>
                
                <div className="items">
                  <h3><strong>ITENS DO PEDIDO</strong></h3>
                  {pedido.itens.map((item, index) => (
                    <div key={index} className="item">
                      <div>
                        {item.qty}x {item.name} 
                        {item.alcohol ? ` (${item.alcohol})` : ""}
                      </div>
                      {item.ice && Object.entries(item.ice).some(([_, qty]) => qty > 0) && (
                        <div style={{ marginLeft: '20px', fontSize: '14px' }}>
                          Gelo: {Object.entries(item.ice)
                            .filter(([_, qty]) => qty > 0)
                            .map(([flavor, qty]) => `${flavor} x${qty}`)
                            .join(", ")}
                        </div>
                      )}
                      <div style={{ textAlign: 'right' }}>
                        R$ {(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>Subtotal:</div>
                    <div>R$ {calcularSubtotal().toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>Taxa de entrega:</div>
                    <div>R$ {pedido.taxa_entrega.toFixed(2)}</div>
                  </div>
                  <div className="total">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>TOTAL:</div>
                      <div>R$ {pedido.total.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <strong>Forma de pagamento:</strong> {pedido.forma_pagamento}
                    {pedido.forma_pagamento === 'Dinheiro' && pedido.troco && (
                      <div>
                        <strong>Troco para:</strong> R$ {pedido.troco}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 print-hidden">
                <div className="bg-black/40 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-3">Status do Pedido</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant={pedido.status === 'pendente' ? 'default' : 'outline'}
                      className={pedido.status === 'pendente' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-gray-600'}
                      onClick={() => handleAtualizarStatus('pendente')}
                    >
                      Pendente
                    </Button>
                    <Button 
                      variant={pedido.status === 'preparando' ? 'default' : 'outline'}
                      className={pedido.status === 'preparando' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600'}
                      onClick={() => handleAtualizarStatus('preparando')}
                    >
                      Preparando
                    </Button>
                    <Button 
                      variant={pedido.status === 'entregue' ? 'default' : 'outline'}
                      className={pedido.status === 'entregue' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600'}
                      onClick={() => handleAtualizarStatus('entregue')}
                    >
                      <Check size={16} className="mr-1" />
                      Entregue
                    </Button>
                    <Button 
                      variant={pedido.status === 'cancelado' ? 'default' : 'outline'}
                      className={pedido.status === 'cancelado' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-600'}
                      onClick={() => handleAtualizarStatus('cancelado')}
                    >
                      <X size={16} className="mr-1" />
                      Cancelado
                    </Button>
                  </div>
                </div>
                
                <div className="bg-black/40 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-3">Ações</h3>
                  <div>
                    <Button 
                      onClick={handleImprimir}
                      disabled={isPrinting}
                      className="w-full bg-purple-dark hover:bg-purple-600"
                    >
                      <Printer size={16} className="mr-2" />
                      Imprimir Comanda
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-red-500">
            Erro ao carregar os detalhes do pedido.
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-600"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetalhe;
