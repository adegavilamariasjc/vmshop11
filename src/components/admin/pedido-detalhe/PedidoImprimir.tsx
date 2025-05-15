
import React, { useEffect } from 'react';
import { usePrintWindow } from './print/usePrintWindow';
import { PrintablePedido } from './print/PrinterUtils';

export const PedidoImprimir = ({
  pedido,
  deliverer,
  setIsPrinting,
}: {
  pedido: any;
  deliverer: string;
  setIsPrinting: (v: boolean) => void;
}) => {
  const { openPrintWindow } = usePrintWindow();

  // Print function from original code
  useEffect(() => {
    if (!pedido) return;
    
    setIsPrinting(true);
    
    // Convert pedido to PrintablePedido type for more type safety
    const printablePedido: PrintablePedido = {
      codigo_pedido: pedido.codigo_pedido,
      cliente_nome: pedido.cliente_nome,
      cliente_endereco: pedido.cliente_endereco,
      cliente_numero: pedido.cliente_numero,
      cliente_complemento: pedido.cliente_complemento,
      cliente_referencia: pedido.cliente_referencia,
      cliente_bairro: pedido.cliente_bairro,
      cliente_whatsapp: pedido.cliente_whatsapp,
      taxa_entrega: pedido.taxa_entrega,
      forma_pagamento: pedido.forma_pagamento,
      troco: pedido.troco,
      itens: pedido.itens,
      total: pedido.total,
      data_criacao: pedido.data_criacao,
      observacao: pedido.observacao,
      discount_amount: pedido.discount_amount
    };
    
    openPrintWindow(printablePedido, deliverer);
    
    setIsPrinting(false);
    // Only run once per mount
    // eslint-disable-next-line
  }, []);

  return null;
};
