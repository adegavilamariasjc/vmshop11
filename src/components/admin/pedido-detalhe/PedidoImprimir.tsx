
import React, { useEffect, useRef } from 'react';
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
  const hasExecuted = useRef(false);

  // Send to Telegram first, then print
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
      
      // Send to Telegram FIRST
      try {
        console.log('📤 Sending order to Telegram:', pedido.codigo_pedido);
        
        const { data, error } = await supabase.functions.invoke('send-telegram-order', {
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
          toast({
            title: "Aviso",
            description: "Não foi possível enviar para o Telegram. Verifique a configuração.",
            variant: "destructive",
          });
        } else {
          console.log('✅ Order sent to Telegram successfully:', data);
          toast({
            title: "Pedido enviado",
            description: "Pedido enviado para o Telegram com sucesso!",
          });
        }
      } catch (error) {
        console.error('Failed to send to Telegram:', error);
        toast({
          title: "Aviso",
          description: "Erro ao enviar para o Telegram.",
          variant: "destructive",
        });
      }
      
      // Then open print window (with small delay to ensure Telegram request completes)
      setTimeout(() => {
        openPrintWindow(printablePedido);
        setIsPrinting(false);
      }, 500);
    };
    
    processOrder();
    // Only run once per mount
    // eslint-disable-next-line
  }, []);

  return null;
};
