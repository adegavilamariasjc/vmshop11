
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product, FormData } from '../types';
import { formatWhatsApp, formatWhatsAppMessage, groupCartItems } from '../utils/formatWhatsApp';
import { supabase } from '@/lib/supabase/client';

export const useOrderSubmission = (codigoPedido: string, cart: Product[], form: FormData, isStoreOpen: boolean) => {
  const { toast } = useToast();
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDuplicateOrder, setIsDuplicateOrder] = useState(false);

  const processOrder = async () => {
    if (!isStoreOpen) {
      toast({
        title: "Loja Fechada",
        description: "A loja está fechada no momento. Não é possível enviar pedidos.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao seu carrinho antes de finalizar o pedido.",
        variant: "destructive",
      });
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
    const total = subtotal + form.bairro.taxa;

    if (subtotal < 20) {
      toast({
        title: "Valor mínimo não atingido",
        description: "O pedido mínimo é de R$ 20,00",
        variant: "destructive",
      });
      return;
    }

    if (form.nome === '') {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu nome.",
        variant: "destructive",
      });
      return;
    }

    if (form.endereco === '') {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu endereço.",
        variant: "destructive",
      });
      return;
    }

    if (form.bairro.nome === 'Selecione Um Bairro') {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione seu bairro.",
        variant: "destructive",
      });
      return;
    }

    if (form.pagamento === '') {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe a forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOrder(true);

    try {
      // Group identical items for display
      const groupedItems = groupCartItems(cart);
      
      // Create the items text for WhatsApp
      const itemsText = groupedItems.map(item => {
        const itemName = item.name;
        const itemQty = item.qty || 1;
        const itemPrice = item.price || 0;
        const totalPrice = itemPrice * itemQty;
        
        let itemDesc = `${itemQty}x ${itemName} - R$${totalPrice.toFixed(2).replace('.', ',')}`;
        
        if (item.alcohol) {
          itemDesc += `\n   ↳ Álcool: ${item.alcohol}`;
        }
        
        if (item.balyFlavor) {
          itemDesc += `\n   ↳ Sabor Baly: ${item.balyFlavor}`;
        }
        
        if (item.ice && Object.values(item.ice).some(qty => qty > 0)) {
          const iceDesc = Object.entries(item.ice)
            .filter(([_, qty]) => qty > 0)
            .map(([flavor, qty]) => `${flavor} x${qty}`)
            .join(", ");
          itemDesc += `\n   ↳ Gelo: ${iceDesc}`;
        }
        
        if (item.energyDrinks && item.energyDrinks.length > 0) {
          const energyDesc = item.energyDrinks.map(
            ed => `${ed.type}${ed.flavor !== 'Tradicional' ? ` - ${ed.flavor}` : ''}`
          ).join(", ");
          itemDesc += `\n   ↳ Energéticos: ${energyDesc}`;
        } else if (item.energyDrink) {
          itemDesc += `\n   ↳ Energético: ${item.energyDrink}${item.energyDrinkFlavor !== 'Tradicional' ? ` - ${item.energyDrinkFlavor}` : ''}`;
        }
        
        return itemDesc;
      }).join('\n');
      
      // Create the WhatsApp message
      const message = formatWhatsAppMessage(
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
        itemsText,
        total
      );
      
      // Parse troco as a number to fix the type error
      const trocoValue = parseFloat(form.troco) || 0;
      
      // Save order to database
      const { error: orderError } = await supabase
        .from('pedidos')
        .insert({
          codigo_pedido: codigoPedido,
          cliente_nome: form.nome,
          cliente_endereco: form.endereco,
          cliente_numero: form.numero,
          cliente_complemento: form.complemento,
          cliente_referencia: form.referencia,
          cliente_bairro: form.bairro.nome,
          cliente_whatsapp: form.whatsapp,
          forma_pagamento: form.pagamento,
          troco: form.troco,
          observacao: form.observacao,
          itens: cart,
          total: total,
          taxa_entrega: form.bairro.taxa,
          status: 'pendente'
        });
      
      if (orderError) {
        console.error('Error saving order:', orderError);
        toast({
          title: "Erro ao salvar pedido",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
        setIsSendingOrder(false);
        return;
      }
      
      // Check for duplicate orders
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const { data: recentOrders } = await supabase
        .from('pedidos')
        .select('*')
        .eq('cliente_whatsapp', form.whatsapp)
        .gte('data_criacao', thirtyMinutesAgo.toISOString())
        .order('data_criacao', { ascending: false });
      
      const isDuplicate = recentOrders && recentOrders.length > 1;
      setIsDuplicateOrder(isDuplicate);
      
      // Generate WhatsApp URL with the formatted message
      const whatsappNumber = "5521970271541"; // CODERS Delivery number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in a new window
      window.open(whatsappUrl, '_blank');
      
      // Show success modal
      setShowSuccessModal(true);
      setIsSendingOrder(false);
      
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsSendingOrder(false);
    }
  };

  const handleOrderConfirmation = () => {
    // Reset form and cart after confirming order
    window.location.reload();
  };

  return {
    isSendingOrder,
    showSuccessModal,
    isDuplicateOrder,
    setShowSuccessModal,
    processOrder,
    handleOrderConfirmation
  };
};
