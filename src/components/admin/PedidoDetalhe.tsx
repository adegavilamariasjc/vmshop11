import React, { useState } from 'react';
import { usePedidoDetalhe } from './pedido-detalhe/usePedidoDetalhe';
import PedidoDetalheDialog from './pedido-detalhe/PedidoDetalheDialog';
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
  const [shouldPrint, setShouldPrint] = useState(false);

  const {
    pedido,
    isLoading,
    isPrinting,
    isDeleting,
    fetchPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
    formatDateTime,
    calcularSubtotal,
    setIsPrinting,
  } = usePedidoDetalhe(pedidoId, onClose, onDelete, onStatusChange);

  const handlePrintRequest = () => {
    setShouldPrint(true);
  };

  // After setting shouldPrint, run the print logic
  React.useEffect(() => {
    if (shouldPrint && pedido) {
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
        onClose={onClose}
        calcularSubtotal={calcularSubtotal}
        formatDateTime={formatDateTime}
        handlePrintRequest={handlePrintRequest}
        handleExcluirPedido={handleExcluirPedido}
        handleAtualizarStatus={handleAtualizarStatus}
      />
      {shouldPrint && pedido && (
        <PedidoImprimir
          pedido={pedido}
          setIsPrinting={setIsPrinting}
        />
      )}
    </>
  );
};

export default PedidoDetalhe;
