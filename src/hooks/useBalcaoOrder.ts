import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { savePedido } from '@/lib/supabase';
import { Product } from '../types';
import { gerarCodigoPedido } from '../data/products';
import { getProductDisplayPrice, calculateBeerDiscount } from '../utils/discountUtils';

const SENHA_BALCAO = '141288';

export const useBalcaoOrder = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { toast } = useToast();

  // Play cash register sound for counter orders
  const playCashRegisterSound = () => {
    const audio = new Audio('/caixaregistradora.mp3');
    audio.volume = 0.8;
    audio.play().catch(err => console.error('Erro ao tocar som de caixa:', err));
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.name === product.name && 
                item.category === product.category
      );

      if (existingIndex >= 0) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: (updated[existingIndex].qty || 0) + 1
        };
        return updated;
      }

      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const updateQuantity = (product: Product, newQty: number) => {
    setCart(prevCart => {
      if (newQty <= 0) {
        return prevCart.filter(
          item => !(item.name === product.name && item.category === product.category)
        );
      }

      const existingIndex = prevCart.findIndex(
        item => item.name === product.name && 
                item.category === product.category
      );

      if (existingIndex >= 0) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty
        };
        return updated;
      }

      return prevCart;
    });
  };

  const getTotal = () => {
    return cart.reduce((sum, p) => sum + getProductDisplayPrice(p), 0);
  };

  const processOrder = async (funcionarioNome: string, formaPagamento: string, valorTroco: string | null) => {
    if (cart.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione produtos ao carrinho antes de finalizar.',
        variant: 'destructive'
      });
      return false;
    }

    setIsProcessing(true);

    try {
      const codigoPedido = gerarCodigoPedido();
      const total = getTotal();
      
      // Calculate total discount amount
      const totalDiscountAmount = cart.reduce((sum, item) => {
        const discountInfo = calculateBeerDiscount(item);
        if (discountInfo.hasDiscount) {
          const regularPrice = item.price * (item.qty || 0);
          const discountAmount = regularPrice - discountInfo.discountedPrice;
          return sum + discountAmount;
        }
        return sum;
      }, 0);

      const pedido = await savePedido({
        codigo_pedido: codigoPedido,
        cliente_nome: funcionarioNome,
        cliente_endereco: '-',
        cliente_numero: null,
        cliente_complemento: null,
        cliente_referencia: null,
        cliente_bairro: 'BALCAO',
        taxa_entrega: 0,
        cliente_whatsapp: '-',
        forma_pagamento: formaPagamento,
        troco: valorTroco,
        observacao: null,
        itens: cart as any,
        total: total,
        status: 'pendente',
        discount_amount: totalDiscountAmount,
        entregador: null
      });

      if (pedido) {
        playCashRegisterSound();
        
        toast({
          title: 'Pedido registrado!',
          description: `Pedido #${codigoPedido} registrado com sucesso.`,
        });
        
        setCart([]);
        setShowPasswordDialog(false);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Erro ao salvar pedido de balcão:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o pedido. Tente novamente.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return {
    cart,
    isProcessing,
    showPasswordDialog,
    setShowPasswordDialog,
    addToCart,
    updateQuantity,
    getTotal,
    processOrder,
    clearCart
  };
};
