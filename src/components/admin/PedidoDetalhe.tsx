
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchPedidoById, updatePedidoStatus, deletePedido, SupabasePedido } from '@/lib/supabase';
import DelivererSelectModal from './DelivererSelectModal';
import OrderHeader from './pedido-detalhe/OrderHeader';
import CustomerInfo from './pedido-detalhe/CustomerInfo';
import OrderItems from './pedido-detalhe/OrderItems';
import OrderSummary from './pedido-detalhe/OrderSummary';
import OrderStatusControls from './pedido-detalhe/OrderStatusControls';
import OrderActions from './pedido-detalhe/OrderActions';

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
  const [showDelivererModal, setShowDelivererModal] = useState(false);
  const [selectedDeliverer, setSelectedDeliverer] = useState<string | null>(null);
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

  const handlePrintRequest = () => {
    setShowDelivererModal(true);
  };

  const handleDelivererSelect = (deliverer: string) => {
    setSelectedDeliverer(deliverer);
    handleImprimir(deliverer);
  };

  const handleImprimir = (deliverer: string) => {
    if (!pedido) return;
    
    setIsPrinting(true);
    
    const itensFormatados = pedido.itens.map((item: any) => {
      let texto = `${item.qty}x ${item.name}`;
      if (item.alcohol) {
        texto += ` (${item.alcohol})`;
      }
      if (item.balyFlavor) {
        texto += ` (Baly: ${item.balyFlavor})`;
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
    
    // Calculate change amount if payment is in cash
    let trocoInfo = '';
    if (pedido.forma_pagamento === 'Dinheiro' && pedido.troco) {
      const trocoValue = Number(pedido.troco);
      const changeAmount = trocoValue - pedido.total;
      if (changeAmount > 0) {
        trocoInfo = `\nLEVAR TROCO: R$ ${changeAmount.toFixed(2)}`;
      }
    }
    
    const conteudoImpressao = `
${deliverer}

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
${trocoInfo}

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
              .deliverer {
                font-weight: bold;
                font-size: 16pt;
                text-align: center;
                margin-bottom: 10mm;
              }
              .change-amount {
                font-weight: bold;
                font-size: 14pt;
                margin-top: 5mm;
              }
            </style>
          </head>
          <body>
<div class="deliverer">${deliverer}</div>
${conteudoImpressao.replace(
  trocoInfo,
  trocoInfo ? `\n<div class="change-amount">${trocoInfo}</div>` : ''
)}
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
                <OrderHeader 
                  orderCode={pedido.codigo_pedido}
                  orderDate={pedido.data_criacao}
                  status={pedido.status}
                  formatDateTime={formatDateTime}
                />
                
                <CustomerInfo
                  name={pedido.cliente_nome}
                  address={pedido.cliente_endereco}
                  number={pedido.cliente_numero}
                  complement={pedido.cliente_complemento}
                  reference={pedido.cliente_referencia}
                  district={pedido.cliente_bairro}
                  whatsapp={pedido.cliente_whatsapp}
                  observation={pedido.observacao}
                />
                
                <OrderItems items={pedido.itens} />
                
                <OrderSummary
                  subtotal={calcularSubtotal()}
                  deliveryFee={pedido.taxa_entrega}
                  total={pedido.total}
                  paymentMethod={pedido.forma_pagamento}
                  change={pedido.troco}
                />
              </div>
              
              <div className="space-y-4 print-hidden">
                <OrderStatusControls 
                  currentStatus={pedido.status} 
                  onUpdateStatus={handleAtualizarStatus}
                />
                
                <OrderActions 
                  onPrint={handlePrintRequest}
                  onDelete={handleExcluirPedido}
                  isPrinting={isPrinting}
                  isDeleting={isDeleting}
                />
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
      
      <DelivererSelectModal 
        open={showDelivererModal}
        onOpenChange={setShowDelivererModal}
        onConfirm={handleDelivererSelect}
      />
    </Dialog>
  );
};

export default PedidoDetalhe;
