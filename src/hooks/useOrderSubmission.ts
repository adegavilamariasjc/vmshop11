
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product, FormData } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { gerarCodigoPedido } from '../data/products';
import { formatWhatsAppMessage } from '../utils/formatWhatsApp';

interface UseOrderSubmissionProps {
  cart: Product[];
  form: FormData;
  isStoreOpen: boolean;
}

export const useOrderSubmission = ({ 
  cart, 
  form, 
  isStoreOpen 
}: UseOrderSubmissionProps) => {
  const [codigoPedido] = useState(gerarCodigoPedido());
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDuplicateOrder, setIsDuplicateOrder] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const { toast } = useToast();

  const getFullProductName = (name: string, category?: string): string => {
    if (category?.toLowerCase() === 'batidas' && !name.toLowerCase().includes('batida de')) {
      return `Batida de ${name}`;
    }
    return name;
  };

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
    if (cart.length === 0 || !isStoreOpen) return false;
    
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0) + form.bairro.taxa;
    
    const isDuplicate = await checkDuplicateOrder(form.nome, form.whatsapp, total);
    setIsDuplicateOrder(isDuplicate);

    if (isDuplicate) {
      return true;
    }
    
    try {
      // Convert troco to number before storing in database
      const trocoValue = form.troco ? parseFloat(form.troco) : 0;
      
      // FIX: Pass a single object, not an array of objects with a single element
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
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
          troco: form.troco, // Keep as string to maintain compatibility
          observacao: form.observacao,
          itens: cart,
          total: total,
          status: 'pendente'
        })
        .select();
      
      if (error) {
        console.error('Error saving order:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error saving order:', err);
      return false;
    }
  };

  const createWhatsAppMessage = () => {
    if (cart.length === 0) {
      return "";
    }
    
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0) + form.bairro.taxa;
    
    // Fix the TypeScript errors by properly parsing troco to a number
    const trocoValue = form.troco ? parseFloat(form.troco) : 0;
    const trocoFinal = trocoValue - total;
    
    const itensPedido = cart
      .map(p => {
        const fullName = getFullProductName(p.name, p.category);
        const iceText = p.ice
          ? " \n   Gelo: " +
            Object.entries(p.ice)
              .filter(([_, qty]) => typeof qty === 'number' && qty > 0)
              .map(([flavor, qty]) => `${flavor} x${qty}`)
              .join(", ")
          : "";
        const alcoholText = p.alcohol ? ` (Álcool: ${p.alcohol})` : "";
        const balyText = p.balyFlavor ? ` (Baly: ${p.balyFlavor})` : "";
        const energyDrinkText = p.energyDrink 
          ? ` (Energético: ${p.energyDrink}${p.energyDrinkFlavor !== 'Tradicional' ? ' - ' + p.energyDrinkFlavor : ''})`
          : "";
          
        return `${p.qty}x ${fullName}${alcoholText}${balyText}${energyDrinkText}${iceText} - R$${((p.price || 0) * (p.qty || 1)).toFixed(2)}`;
      })
      .join("\n");
    
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
      form.troco,
      itensPedido,
      total
    );

    const mensagemEncoded = mensagem.replace(/\n/g, "%0A");
    return `https://wa.me/5512982704573?text=${mensagemEncoded}`;
  };

  const handleOrderConfirmation = () => {
    if (!isDuplicateOrder && whatsAppUrl) {
      window.open(whatsAppUrl, "_blank");
    }
    
    window.location.reload();
  };

  const processOrder = async () => {
    if (cart.length === 0 || !isStoreOpen) {
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

  return {
    codigoPedido,
    isSendingOrder,
    showSuccessModal,
    setShowSuccessModal,
    isDuplicateOrder,
    whatsAppUrl,
    processOrder,
    handleOrderConfirmation
  };
};
