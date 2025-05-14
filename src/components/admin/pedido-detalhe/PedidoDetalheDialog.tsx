
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import DelivererSelectModal from '../DelivererSelectModal';
import OrderHeader from './OrderHeader';
import CustomerInfo from './CustomerInfo';
import OrderItems from './OrderItems';
import OrderSummary from './OrderSummary';
import OrderStatusControls from './OrderStatusControls';
import OrderActions from './OrderActions';

const PedidoDetalheDialog = ({
  pedido,
  isLoading,
  isPrinting,
  isDeleting,
  showDelivererModal,
  setShowDelivererModal,
  onClose,
  calcularSubtotal,
  formatDateTime,
  handlePrintRequest,
  handleExcluirPedido,
  handleAtualizarStatus,
  handleDelivererSelect,
  selectedDeliverer,
  setSelectedDeliverer,
  DelivererSelectModalComponent
}: any) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Detalhes do Pedido {pedido?.codigo_pedido}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Carregando detalhes do pedido...</div>
        ) : pedido ? (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(90vh-170px)]">
              <div className="pr-4 pb-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
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
                      discountAmount={pedido.discount_amount}
                    />
                  </div>

                  <div className="space-y-4 print-hidden">
                    <OrderStatusControls 
                      currentStatus={pedido.status} 
                      onUpdateStatus={handleAtualizarStatus}
                    />

                    <OrderActions 
                      onPrint={() => {
                        // Call handlePrintRequest which will return true if we should show deliverer modal
                        if (handlePrintRequest()) {
                          setShowDelivererModal(true);
                        }
                      }}
                      onDelete={handleExcluirPedido}
                      isPrinting={isPrinting}
                      isDeleting={isDeleting}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-8 text-red-500">
            Erro ao carregar os detalhes do pedido.
          </div>
        )}

        <DialogFooter className="mt-4 border-t border-gray-800 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-600 text-white hover:bg-gray-800 font-medium"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
      {DelivererSelectModalComponent}
    </Dialog>
  );
};

export default PedidoDetalheDialog;
