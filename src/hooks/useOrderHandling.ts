
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

const preparePedido = async (cart: Product[], form: FormData, isOpen: boolean, isBalcao: boolean, funcionario?: string) => {
  if (cart.length === 0) return false;
  
  // Calculate total with discounts applied
  const deliveryFee = isBalcao ? 0 : form.bairro.taxa;
  const total = cart.reduce((sum, p) => sum + getProductDisplayPrice(p), 0) + deliveryFee;
  
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
  
  const isDuplicate = isBalcao ? false : await checkDuplicateOrder(form.nome, form.whatsapp, total);
  setIsDuplicateOrder(isDuplicate);

  if (isDuplicate) {
    return true;
  }
  
  try {
    const pedido = await savePedido({
      codigo_pedido: codigoPedido,
      cliente_nome: isBalcao ? `BALCÃO - ${funcionario || 'Funcionário não informado'} - ${form.nome || 'Cliente'}` : (form.nome || 'Cliente'),
      cliente_endereco: isBalcao ? 'Retirada no balcão' : (form.endereco || 'Não informado'),
      cliente_numero: isBalcao ? 's/n' : (form.numero || null),
      cliente_complemento: isBalcao ? null : (form.complemento || null),
      cliente_referencia: isBalcao ? null : (form.referencia || null),
      cliente_bairro: isBalcao ? 'BALCAO' : (form.bairro.nome || 'Não informado'),
      taxa_entrega: isBalcao ? 0 : (typeof form.bairro.taxa === 'number' ? form.bairro.taxa : 0),
      cliente_whatsapp: isBalcao ? 'Não informado' : (form.whatsapp || 'Não informado'),
      forma_pagamento: form.pagamento || 'Não informado',
      troco: form.troco || null,
      observacao: isBalcao ? `[BALCÃO - ${funcionario || 'Funcionário não informado'}] ${form.observacao || ''}` : (form.observacao || null),
      itens: cart as any,
      total: typeof total === 'number' && !isNaN(total) ? total : 0,
      status: isOpen ? 'pendente' : 'fora_horario',
      discount_amount: typeof totalDiscountAmount === 'number' && !isNaN(totalDiscountAmount) ? totalDiscountAmount : 0,
      entregador: null
    });
    
    // Send to Telegram only for delivery orders (not balcão)
    if (pedido && !isBalcao) {
      try {
        await supabase.functions.invoke('send-telegram-order', {
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
            discountAmount: pedido.discount_amount,
            entregador: pedido.entregador
          }
        });
        console.log('Pedido delivery enviado para Telegram:', pedido.codigo_pedido);
      } catch (telegramError) {
        console.error('Erro ao enviar para Telegram:', telegramError);
        // Não bloqueia o pedido se falhar o envio para Telegram
      }
    }
    
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

const processOrder = async (cart: Product[], form: FormData, isOpen: boolean, options?: { balcao?: boolean; funcionario?: string }) => {
  if (cart.length === 0) {
    return;
  }

  const isBalcao = !!options?.balcao;

  // Validate minimum order value only for delivery orders
  if (!isBalcao) {
    const cartTotal = cart.reduce((sum, p) => sum + getProductDisplayPrice(p), 0);
    if (cartTotal < 20) {
      toast({
        title: 'Valor mínimo não atingido',
        description: 'O pedido mínimo para delivery é de R$ 20,00',
        variant: 'destructive'
      });
      return;
    }
  }

  // Validate WhatsApp number only for delivery orders
  if (!isBalcao) {
    const cleanWhatsApp = form.whatsapp.replace(/\D/g, '');
    if (cleanWhatsApp.length < 10) {
      toast({
        title: 'WhatsApp inválido',
        description: 'Digite um número de WhatsApp válido com DDD.',
        variant: 'destructive'
      });
      return;
    }
  }
  
  setIsSendingOrder(true);
  
  try {
    const success = await preparePedido(cart, form, isOpen, isBalcao, options?.funcionario);
    
    if (!success) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o pedido. Tente novamente.',
        variant: 'destructive'
      });
      setIsSendingOrder(false);
      return;
    }
    
    // Only create WhatsApp URL if store is open and not balcão
    if (!isDuplicateOrder && isOpen && !isBalcao) {
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
