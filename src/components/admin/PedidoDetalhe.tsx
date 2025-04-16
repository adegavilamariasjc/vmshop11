import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Check, Truck, ShoppingBag, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchPedidoById, updatePedidoStatus, deletePedido, SupabasePedido } from '@/lib/supabase';

interface PedidoDetalheProps {
  pedidoId: string;
  onClose: () => void;
  onDelete?: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

type PedidoCompleto = SupabasePedido;

const PedidoDetalhe: React.FC<PedidoDetalheProps> = ({ 
  pedidoId, 
  onClose, 
  onDelete, 
  onStatusChange 
}) => {
  const [pedido, setPedido] = useState<PedidoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const impressaoRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPedido();
  }, [pedidoId]);

  const fetchPedido = async () => {
    setIsLoading(true);
    try {
      const pedidoData = await fetchPedidoById(pedidoId);
      if (pedidoData) {
        setPedido(pedidoData);
      } else {
        throw new Error('Pedido não encontrado');
      }
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
    if (!pedido) return;
    
    setIsPrinting(true);
    
    const itensFormatados = pedido.itens.map((item: any) => {
      let texto = `${item.qty}x ${item.name}`;
      if (item.alcohol) {
        texto += ` (${item.alcohol})`;
      }
      
      if (item.ice && Object.entries(item.ice).some(([_, qty]: [string, any]) => qty > 0)) {
        const geloInfo = Object.entries(item.ice)
          .filter(([_, qty]: [string, any]) => qty > 0)
          .map(([flavor, qty]: [string, any]) => `${flavor} x${qty}`)
          .join(", ");
        
        texto += `\n   Gelo: ${geloInfo}`;
      }
      
      texto += `\n   R$ ${(item.price * item.qty).toFixed(2)}`;
      return texto;
    }).join('\n\n');
    
    const conteudoImpressao = `
ADEGA VM
PEDIDO #${pedido.codigo_pedido}
${new Date(pedido.data_criacao).toLocaleString('pt-BR')}

CLIENTE: ${pedido.cliente_nome}
ENDEREÇO: ${pedido.cliente_endereco}, ${pedido.cliente_numero || ''}
${pedido.cliente_complemento ? `COMPLEMENTO: ${pedido.cliente_complemento}` : ''}
${pedido.cliente_referencia ? `REFERÊNCIA: ${pedido.cliente_referencia}` : ''}
BAIRRO: ${pedido.cliente_bairro}
WHATSAPP: ${pedido.cliente_whatsapp}
${pedido.observacao ? `OBSERVAÇÃO: ${pedido.observacao}` : ''}

ITENS DO PEDIDO:
${itensFormatados}

SUBTOTAL: R$ ${(pedido.total - pedido.taxa_entrega).toFixed(2)}
TAXA DE ENTREGA: R$ ${pedido.taxa_entrega.toFixed(2)}
TOTAL: R$ ${pedido.total.toFixed(2)}

FORMA DE PAGAMENTO: ${pedido.forma_pagamento}
${pedido.forma_pagamento === 'Dinheiro' && pedido.troco ? `TROCO PARA: R$ ${pedido.troco}` : ''}

Obrigado pela preferência!
ADEGA VM
    `.trim();
    
    const janela = window.open('', '_blank');
    
    if (janela) {
      janela.document.write(`
        <html>
          <head>
            <title>Pedido ${pedido.codigo_pedido}</title>
            <style>
              body {
                font-family: monospace;
                font-size: 12pt;
                line-height: 1.2;
                white-space: pre-wrap;
                margin: 10mm;
              }
              @media print {
                body {
                  width: 80mm;
                }
              }
            </style>
          </head>
          <body>
${conteudoImpressao}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      janela.document.close();
    }
    
    setIsPrinting(false);
  };

  const handleExcluirPedido = async () => {
    if (!pedido) return;
    
    if (!confirm(`Tem certeza que deseja excluir o pedido ${pedido.codigo_pedido}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const success = await deletePedido(pedido.id);
      
      if (!success) {
        throw new Error('Falha ao excluir pedido');
      }
      
      toast({
        title: 'Pedido excluído',
        description: `O pedido ${pedido.codigo_pedido} foi excluído com sucesso.`,
      });
      
      onClose();
      if (onDelete) {
        onDelete();
      }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <span className="status status-pendente">Pendente</span>;
      case 'preparando':
        return <span className="status status-preparando">Em Produção</span>;
      case 'em_deslocamento':
        return <span className="status status-em-deslocamento">Em Deslocamento</span>;
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
      const success = await updatePedidoStatus(pedido.id, novoStatus);
      
      if (!success) {
        throw new Error('Falha ao atualizar status');
      }
      
      setPedido({
        ...pedido,
        status: novoStatus
      });
      
      if (onStatusChange) {
        onStatusChange(pedido.id, novoStatus);
      }
      
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
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Detalhes do Pedido {pedido?.codigo_pedido}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-8">Carregando detalhes do pedido...</div>
        ) : pedido ? (
          <ScrollArea className="h-[calc(90vh-170px)] pr-4">
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
                  {pedido.itens.map((item: any, index: number) => (
                    <div key={index} className="item">
                      <div>
                        {item.qty}x {item.name} 
                        {item.alcohol ? ` (${item.alcohol})` : ""}
                      </div>
                      {item.ice && Object.entries(item.ice).some(([_, qty]: [string, any]) => qty > 0) && (
                        <div style={{ marginLeft: '20px', fontSize: '14px' }}>
                          Gelo: {Object.entries(item.ice)
                            .filter(([_, qty]: [string, any]) => qty > 0)
                            .map(([flavor, qty]: [string, any]) => `${flavor} x${qty}`)
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
                      className={`text-black font-medium ${pedido.status === 'pendente' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-gray-600'}`}
                      onClick={() => handleAtualizarStatus('pendente')}
                    >
                      Pendente
                    </Button>
                    <Button 
                      variant={pedido.status === 'preparando' ? 'default' : 'outline'}
                      className={`text-black font-medium ${pedido.status === 'preparando' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600'}`}
                      onClick={() => handleAtualizarStatus('preparando')}
                    >
                      <ShoppingBag size={16} className="mr-1" />
                      Em Produção
                    </Button>
                    <Button 
                      variant={pedido.status === 'em_deslocamento' ? 'default' : 'outline'}
                      className={`text-black font-medium ${pedido.status === 'em_deslocamento' ? 'bg-orange-600 hover:bg-orange-700' : 'border-gray-600'}`}
                      onClick={() => handleAtualizarStatus('em_deslocamento')}
                    >
                      <Truck size={16} className="mr-1" />
                      Em Deslocamento
                    </Button>
                    <Button 
                      variant={pedido.status === 'entregue' ? 'default' : 'outline'}
                      className={`text-black font-medium ${pedido.status === 'entregue' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600'}`}
                      onClick={() => handleAtualizarStatus('entregue')}
                    >
                      <Check size={16} className="mr-1" />
                      Entregue
                    </Button>
                    <Button 
                      variant={pedido.status === 'cancelado' ? 'default' : 'outline'}
                      className={`text-black font-medium ${pedido.status === 'cancelado' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-600'}`}
                      onClick={() => handleAtualizarStatus('cancelado')}
                    >
                      <X size={16} className="mr-1" />
                      Cancelado
                    </Button>
                  </div>
                </div>
                
                <div className="bg-black/40 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-3">Ações</h3>
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleImprimir}
                      disabled={isPrinting}
                      className="w-full bg-purple-dark hover:bg-purple-600 text-black font-medium"
                    >
                      <Printer size={16} className="mr-2" />
                      Imprimir Comanda
                    </Button>
                    
                    <Button 
                      onClick={handleExcluirPedido}
                      disabled={isDeleting}
                      className="w-full bg-red-600 hover:bg-red-700 text-black font-medium"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir Pedido
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-red-500">
            Erro ao carregar os detalhes do pedido.
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-600 text-black font-medium"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetalhe;
