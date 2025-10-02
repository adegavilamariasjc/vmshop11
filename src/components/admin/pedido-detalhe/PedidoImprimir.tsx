
import React, { useEffect } from 'react';
import { usePrintWindow } from './print/usePrintWindow';
import { PrintablePedido } from './print/PrinterUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const PedidoImprimir = ({
  pedido,
  setIsPrinting,
}: {
  pedido: any;
  setIsPrinting: (v: boolean) => void;
}) => {
  const { openPrintWindow } = usePrintWindow();
  const { toast } = useToast();

  // Print function and send to Telegram
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
    
    // Open print window
    openPrintWindow(printablePedido);
    
    // Send to Telegram
    const sendToTelegram = async () => {
      try {
        console.log('📤 Sending order to Telegram:', pedido.codigo_pedido);
        
        const { error } = await supabase.functions.invoke('send-telegram-order', {
          body: {
            codigoPedido: pedido.codigo_pedido,
            clienteNome: pedido.cliente_nome,
            clienteEndereco: pedido.cliente_endereco,
            clienteNumero: pedido.cliente_numero,
            clienteComplemento: pedido.cliente_complemento,
            clienteReferencia: pedido.cliente_referencia,
            clienteBairro: pedido.cliente_bairro,
            taxaEntrega: pedido.taxa_entrega,
            clienteWhatsapp: pedido.cliente_whatsapp,
            formaPagamento: pedido.forma_pagamento,
            troco: pedido.troco,
            observacao: pedido.observacao,
            itens: pedido.itens,
            total: pedido.total,
            discountAmount: pedido.discount_amount || 0
          }
        });

        if (error) {
          console.error('Error sending to Telegram:', error);
          throw error;
        }

        console.log('✅ Order sent to Telegram successfully');
        
        toast({
          title: "Pedido enviado",
          description: "Pedido impresso e enviado para o Telegram com sucesso!",
        });
      } catch (error) {
        console.error('Failed to send to Telegram:', error);
        toast({
          title: "Aviso",
          description: "Pedido impresso, mas não foi possível enviar para o Telegram.",
          variant: "destructive",
        });
      }
    };

    sendToTelegram();
    
    setIsPrinting(false);
    // Only run once per mount
    // eslint-disable-next-line
  }, []);

  return null;
};
