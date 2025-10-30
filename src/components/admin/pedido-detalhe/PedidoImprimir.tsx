
import React, { useEffect, useRef } from 'react';
import { usePrintWindow } from './print/usePrintWindow';
import { PrintablePedido } from './print/PrinterUtils';

export const PedidoImprimir = ({
  pedido,
  setIsPrinting,
}: {
  pedido: any;
  setIsPrinting: (v: boolean) => void;
}) => {
  const { openPrintWindow } = usePrintWindow();
  const hasExecuted = useRef(false);

  // Open print window directly
  useEffect(() => {
    if (!pedido || hasExecuted.current) return;
    hasExecuted.current = true;
    
    const processOrder = async () => {
      setIsPrinting(true);
      
      // Convert pedido to PrintablePedido type
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
      
      // Open print window
      openPrintWindow(printablePedido);
      setIsPrinting(false);
    };
    
    processOrder();
    // Only run once per mount
    // eslint-disable-next-line
  }, []);

  return null;
};
