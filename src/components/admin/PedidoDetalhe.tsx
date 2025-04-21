
import React, { useRef, useState } from 'react';
import { usePedidoDetalhe } from './pedido-detalhe/usePedidoDetalhe';
import PedidoDetalheDialog from './pedido-detalhe/PedidoDetalheDialog';
import DelivererSelectModal from './DelivererSelectModal';
import { PedidoImprimir } from './pedido-detalhe/PedidoImprimir';

interface PedidoDetalheProps {
  pedidoId: string;
  onClose: () => void;
  onDelete?: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

const PedidoDetalhe: React.FC<PedidoDetalheProps> = ({ 
  pedidoId, 
  onClose, 
  onDelete, 
  onStatusChange 
}) => {
  const printDeliverer = useRef<string | null>(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  const {
    pedido,
    isLoading,
    isPrinting,
    isDeleting,
    showDelivererModal,
    setShowDelivererModal,
    selectedDeliverer,
    setSelectedDeliverer,
    fetchPedido,
    handlePrintRequest,
    handleDelivererSelect,
    handleExcluirPedido,
    handleAtualizarStatus,
    formatDateTime,
    calcularSubtotal,
    setIsPrinting,
  } = usePedidoDetalhe(pedidoId, onClose, onDelete, onStatusChange);

  const handleDelivererSelection = (deliverer: string) => {
    printDeliverer.current = deliverer;
    setShouldPrint(true);
    setShowDelivererModal(false);
  };

  // After setting shouldPrint, run the print logic
  React.useEffect(() => {
    if (shouldPrint && printDeliverer.current && pedido) {
      // print component will print on mount
      setShouldPrint(false);
    }
    // eslint-disable-next-line
  }, [shouldPrint, pedido]);

  return (
    <>
      <PedidoDetalheDialog
        pedido={pedido}
        isLoading={isLoading}
        isPrinting={isPrinting}
        isDeleting={isDeleting}
        showDelivererModal={showDelivererModal}
        setShowDelivererModal={setShowDelivererModal}
        onClose={onClose}
        calcularSubtotal={calcularSubtotal}
        formatDateTime={formatDateTime}
        handlePrintRequest={handlePrintRequest}
        handleExcluirPedido={handleExcluirPedido}
        handleAtualizarStatus={handleAtualizarStatus}
        handleDelivererSelect={handleDelivererSelection}
        selectedDeliverer={selectedDeliverer}
        setSelectedDeliverer={setSelectedDeliverer}
        DelivererSelectModalComponent={
          <DelivererSelectModal 
            open={showDelivererModal}
            onOpenChange={setShowDelivererModal}
            onConfirm={handleDelivererSelection}
          />
        }
      />
      {shouldPrint && pedido && printDeliverer.current && (
        <PedidoImprimir
          pedido={pedido}
          deliverer={printDeliverer.current}
          setIsPrinting={setIsPrinting}
        />
      )}
    </>
  );
};

export default PedidoDetalhe;
