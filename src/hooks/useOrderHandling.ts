
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { savePedido } from '@/lib/supabase';
import { formatWhatsAppMessage } from '../utils/formatWhatsApp';
import { FormData, Product } from '../types';
import { gerarCodigoPedido } from '../data/products';
import { getProductDisplayPrice, calculateBeerDiscount } from '../utils/discountUtils';

export const useOrderHandling = () => {
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

  const preparePedido = async (cart: Product[], form: FormData, isOpen: boolean) => {
    if (cart.length === 0) return false;
    
    // Calculate total with discounts applied
    const total = cart.reduce((sum, p) => sum + getProductDisplayPrice(p), 0) + form.bairro.taxa;
    
    // Calculate total discount amount for beer products
    const totalDiscountAmount = cart.reduce((sum, item) => {
      const discountInfo = calculateBeerDiscount(item);
      if (discountInfo.hasDiscount) {
        const regularPrice = item.price * (item.qty || 0);
        const discountAmount = regularPrice - discountInfo.discountedPrice;
        return sum + discountAmount;
      }
      return sum;
    }, 0);
    
    const isDuplicate = await checkDuplicateOrder(form.nome, form.whatsapp, total);
    setIsDuplicateOrder(isDuplicate);

    if (isDuplicate) {
      return true;
    }
    
    try {
      const pedido = await savePedido({
        codigo_pedido: codigoPedido,
        cliente_nome: form.nome || 'Cliente',
        cliente_endereco: form.endereco || 'Não informado',
        cliente_numero: form.numero || null,
        cliente_complemento: form.complemento || null,
        cliente_referencia: form.referencia || null,
        cliente_bairro: form.bairro.nome || 'Não informado',
        taxa_entrega: typeof form.bairro.taxa === 'number' ? form.bairro.taxa : 0,
        cliente_whatsapp: form.whatsapp || 'Não informado',
        forma_pagamento: form.pagamento || 'Não informado',
        troco: form.troco || null,
        observacao: form.observacao || null,
        itens: cart as any,
        total: typeof total === 'number' && !isNaN(total) ? total : 0,
        status: isOpen ? 'pendente' : 'fora_horario',
        discount_amount: typeof totalDiscountAmount === 'number' && !isNaN(totalDiscountAmount) ? totalDiscountAmount : 0,
        entregador: null
      });
      
      // Pedido saved successfully - Telegram will be sent when deliverer is selected
      
      return !!pedido;
    } catch (err) {
      console.error('Erro inesperado ao salvar pedido:', err);
      return false;
    }
  };

  const createWhatsAppMessage = (cart: Product[], form: FormData) => {
    if (cart.length === 0) {
      return "";
    }
    
    // Calculate subtotal without discounts
    const subtotalWithoutDiscount = cart.reduce((sum, p) => sum + p.price * (p.qty || 1), 0);
    
    // Calculate total discount amount
    const totalDiscountAmount = cart.reduce((sum, p) => {
      const discountInfo = calculateBeerDiscount(p);
      if (discountInfo.hasDiscount) {
        const regularPrice = p.price * (p.qty || 1);
        return sum + (regularPrice - discountInfo.discountedPrice);
      }
      return sum;
    }, 0);
    
    // Calculate total with discounts applied
    const total = cart.reduce((sum, p) => sum + getProductDisplayPrice(p), 0) + form.bairro.taxa;
    
    const itensPedido = cart
      .map(p => {
        const fullName = getFullProductName(p.name, p.category);
        const iceText = p.ice
          ? " \n   Gelo: " +
            Object.entries(p.ice)
              .filter(([flavor, qty]) => qty > 0)
              .map(([flavor, qty]) => `${flavor} x${qty}`)
              .join(", ")
          : "";
        const alcoholText = p.alcohol ? ` (Álcool: ${p.alcohol})` : "";
        const balyText = p.balyFlavor ? ` (Baly: ${p.balyFlavor})` : "";
        const energyDrinkText = p.energyDrink 
          ? ` (Energético: ${p.energyDrink}${p.energyDrinkFlavor !== 'Tradicional' ? ' - ' + p.energyDrinkFlavor : ''})`
          : "";
        
        // Check if this beer product has a discount
        const discountInfo = calculateBeerDiscount(p);
        const discountText = discountInfo.hasDiscount ? ` (-${discountInfo.discountPercentage}%)` : "";
        
        // Calculate the price with any discounts applied
        const displayPrice = getProductDisplayPrice(p);
          
        return `${p.qty}x ${fullName}${alcoholText}${balyText}${energyDrinkText}${discountText}${iceText} - R$${displayPrice.toFixed(2)}`;
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
      total,
      totalDiscountAmount
    );

    const mensagemEncoded = mensagem.replace(/\n/g, "%0A");
    return `https://wa.me/5512982704573?text=${mensagemEncoded}`;
  };

  const processOrder = async (cart: Product[], form: FormData, isOpen: boolean) => {
    if (cart.length === 0) {
      return;
    }

    // Validate WhatsApp number
    const cleanWhatsApp = form.whatsapp.replace(/\D/g, '');
    if (cleanWhatsApp.length < 10) {
      toast({
        title: 'WhatsApp inválido',
        description: 'Digite um número de WhatsApp válido com DDD.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSendingOrder(true);
    
    try {
      const success = await preparePedido(cart, form, isOpen);
      
      if (!success) {
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar o pedido. Tente novamente.',
          variant: 'destructive'
        });
        setIsSendingOrder(false);
        return;
      }
      
      // Only create WhatsApp URL if store is open
      if (!isDuplicateOrder && isOpen) {
        const url = createWhatsAppMessage(cart, form);
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
    codigoPedido,
    isSendingOrder,
    showSuccessModal,
    isDuplicateOrder,
    whatsAppUrl,
    setShowSuccessModal,
    processOrder,
    handleOrderConfirmation
  };
};
