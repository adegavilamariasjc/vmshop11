
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FormData, Product } from '../types';
import { formatWhatsAppMessage, groupCartItems } from '../utils/formatWhatsApp';
import { supabase } from '@/lib/supabase/client';
import { savePedido } from '@/lib/supabase';

export const useOrderSubmission = (
  codigoPedido: string,
  cart: Product[],
  form: FormData,
  isOpen: boolean
) => {
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDuplicateOrder, setIsDuplicateOrder] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const { toast } = useToast();

  const checkDuplicateOrder = async (clienteNome: string, clienteWhatsapp: string, total: number) => {
    try {
      const thirtyMinutesAgo = new Date();
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
      
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('cliente_nome', clienteNome)
        .eq('cliente_whatsapp', clienteWhatsapp)
        .gte('data_criacao', thirtyMinutesAgo.toISOString())
        .order('data_criacao', { ascending: false });
        
      if (error) {
        console.error('Error checking for duplicate orders:', error);
        return false;
      }
      
      if (data && data.length > 0) {
        for (const prevOrder of data) {
          const totalDifference = Math.abs(prevOrder.total - total);
          const percentDifference = (totalDifference / total) * 100;
          
          if (percentDifference < 10) {
            return true;
          }
        }
      }
      
      return false;
    } catch (err) {
      console.error('Error checking for duplicate orders:', err);
      return false;
    }
  };

  const preparePedido = async () => {
    if (cart.length === 0 || !isOpen) return false;
    
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0) + form.bairro.taxa;
    
    const isDuplicate = await checkDuplicateOrder(form.nome, form.whatsapp, total);
    setIsDuplicateOrder(isDuplicate);

    if (isDuplicate) {
      return true;
    }
    
    try {
      // Ensure troco is parsed as a number for safe storage and comparison
      const trocoValue = parseFloat(form.troco) || 0;
      
      const pedido = await savePedido({
        codigo_pedido: codigoPedido,
        cliente_nome: form.nome,
        cliente_endereco: form.endereco,
        cliente_numero: form.numero,
        cliente_complemento: form.complemento,
        cliente_referencia: form.referencia,
        cliente_bairro: form.bairro.nome,
        taxa_entrega: form.bairro.taxa,
        cliente_whatsapp: form.whatsapp,
        forma_pagamento: form.pagamento,
        troco: trocoValue.toString(), // Convert back to string for consistent storage
        observacao: form.observacao,
        itens: cart,
        total: total,
        status: 'pendente'
      });
      
      return !!pedido;
    } catch (err) {
      console.error('Erro inesperado ao salvar pedido:', err);
      return false;
    }
  };

  const createWhatsAppMessage = () => {
    if (cart.length === 0) {
      return "";
    }
    
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0) + form.bairro.taxa;
    
    // Use the improved groupCartItems function for consistent grouping
    const groupedItems = groupCartItems(cart);
    
    const itensPedido = groupedItems
      .map(p => {
        const fullName = p.name;
        const iceText = p.ice
          ? " \n   Gelo: " +
            Object.entries(p.ice)
              .filter(([flavor, qty]) => qty > 0)
              .map(([flavor, qty]) => `${flavor} x${qty}`)
              .join(", ")
          : "";
        const alcoholText = p.alcohol ? ` (Álcool: ${p.alcohol})` : "";
        const balyText = p.balyFlavor ? ` (Baly: ${p.balyFlavor})` : "";
        
        let energyDrinkText = "";
        if (p.energyDrinks && p.energyDrinks.length > 0) {
          energyDrinkText = ` \n   Energéticos: ${p.energyDrinks.map(ed => 
            `${ed.type}${ed.flavor !== 'Tradicional' ? ' - ' + ed.flavor : ''}`
          ).join(", ")}`;
        } else if (p.energyDrink) {
          energyDrinkText = ` \n   Energético: ${p.energyDrink}${p.energyDrinkFlavor !== 'Tradicional' ? ' - ' + p.energyDrinkFlavor : ''}`;
        }
          
        return `${p.qty}x ${fullName}${alcoholText}${balyText}${energyDrinkText}${iceText} - R$${((p.price || 0) * (p.qty || 1)).toFixed(2)}`;
      })
      .join("\n");
    
    // Parse troco as number to ensure proper comparison
    const trocoValue = parseFloat(form.troco) || 0;

    const mensagem = formatWhatsAppMessage(
      codigoPedido,
      form.nome,
      form.endereco,
      form.numero,
      form.complemento,
      form.referencia,
      form.bairro.nome,
      form.bairro.taxa,
      form.whatsapp,
      form.pagamento,
      trocoValue.toString(), // Pass as string after parsing to ensure consistent type
      itensPedido,
      total
    );

    const mensagemEncoded = mensagem.replace(/\n/g, "%0A");
    return `https://wa.me/5512982704573?text=${mensagemEncoded}`;
  };

  const processOrder = async () => {
    if (cart.length === 0 || !isOpen) {
      return;
    }
    
    setIsSendingOrder(true);
    
    try {
      const success = await preparePedido();
      
      if (!success) {
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar o pedido. Tente novamente.',
          variant: 'destructive'
        });
        setIsSendingOrder(false);
        return;
      }
      
      if (!isDuplicateOrder) {
        const url = createWhatsAppMessage();
        setWhatsAppUrl(url);
      }
      
      setShowSuccessModal(true);
      
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar o pedido. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSendingOrder(false);
    }
  };

  const handleOrderConfirmation = () => {
    if (!isDuplicateOrder && whatsAppUrl) {
      window.open(whatsAppUrl, "_blank");
    }
    
    window.location.reload();
  };

  return {
    isSendingOrder,
    showSuccessModal,
    isDuplicateOrder,
    whatsAppUrl,
    setShowSuccessModal,
    processOrder,
    handleOrderConfirmation
  };
};
