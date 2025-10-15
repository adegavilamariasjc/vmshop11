import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { savePedido } from '@/lib/supabase';
import { Product, AlcoholOption } from '../types';
import { gerarCodigoPedido, requiresFlavor, requiresAlcoholChoice, containsBaly } from '../data/products';
import { getProductDisplayPrice, calculateBeerDiscount } from '../utils/discountUtils';
import { isCopao, isCombo } from './cart/useCartHelpers';
import { trackCartAddition } from '@/lib/supabase/productStats';

const SENHA_BALCAO = '141288';

export const useBalcaoOrder = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  // Modal states
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [isAlcoholModalOpen, setIsAlcoholModalOpen] = useState(false);
  const [isBalyModalOpen, setIsBalyModalOpen] = useState(false);
  const [isEnergyDrinkModalOpen, setIsEnergyDrinkModalOpen] = useState(false);
  
  // Selected products for modals
  const [selectedProductForFlavor, setSelectedProductForFlavor] = useState<Product | null>(null);
  const [selectedProductForAlcohol, setSelectedProductForAlcohol] = useState<Product | null>(null);
  const [selectedProductForBaly, setSelectedProductForBaly] = useState<Product | null>(null);
  const [pendingProductWithIce, setPendingProductWithIce] = useState<Product | null>(null);
  
  // Selections
  const [selectedIce, setSelectedIce] = useState<Record<string, number>>({});
  const [selectedAlcohol, setSelectedAlcohol] = useState<AlcoholOption | null>(null);
  const [currentProductType, setCurrentProductType] = useState<'copao' | 'combo'>('combo');
  
  const { toast } = useToast();

  // Initialize ice selections when a product is selected for flavor
  useEffect(() => {
    if (selectedProductForFlavor) {
      const initialIce: Record<string, number> = {};
      const iceFlavors = ["Coco", "Melancia", "Maracujá", "Maçã Verde", "Morango", "Gelo de Água"];
      iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
      setSelectedIce(initialIce);
    }
  }, [selectedProductForFlavor]);

  // Debug helpers
  useEffect(() => {
    console.log('🔍 Modal States Updated:', {
      isFlavorModalOpen,
      isAlcoholModalOpen,
      isBalyModalOpen,
      isEnergyDrinkModalOpen,
      hasPendingProduct: !!pendingProductWithIce,
      hasSelectedFlavor: !!selectedProductForFlavor,
      currentProductType
    });
  }, [isFlavorModalOpen, isAlcoholModalOpen, isBalyModalOpen, isEnergyDrinkModalOpen, pendingProductWithIce, selectedProductForFlavor, currentProductType]);

  // Play cash register sound for counter orders
  const playCashRegisterSound = () => {
    try {
      const audio = new Audio('/caixaregistradora.mp3');
      audio.volume = 1.0;
      audio.play()
        .then(() => console.log('Som de caixa registradora tocado com sucesso'))
        .catch(err => console.error('Erro ao tocar som de caixa:', err));
    } catch (error) {
      console.error('Erro ao criar áudio:', error);
    }
  };

  const addToCart = (product: Product) => {
    const productWithCategory = { ...product, category: product.category || '' };
    const categoryToCheck = product.category || '';
    
    console.log('🛒 Add to cart - Product:', product.name, 'Category:', categoryToCheck);
    
    // Check if product needs customization
    if (requiresFlavor(categoryToCheck)) {
      console.log('✅ Product requires flavor selection');
      setSelectedProductForFlavor(productWithCategory);
      setSelectedIce({}); // Reset ice selection
      setIsFlavorModalOpen(true);
    } else if (requiresAlcoholChoice(categoryToCheck)) {
      console.log('✅ Product requires alcohol selection');
      setSelectedProductForAlcohol(productWithCategory);
      setSelectedAlcohol(null);
      setIsAlcoholModalOpen(true);
    } else if (containsBaly(product.name)) {
      console.log('✅ Product contains Baly');
      setSelectedProductForBaly(productWithCategory);
      setIsBalyModalOpen(true);
    } else {
      console.log('✅ Direct add to cart');
      handleUpdateQuantity(productWithCategory, 1);
    }
  };
  
  const handleUpdateQuantity = (item: Product, delta: number) => {
    // Track cart addition when adding items
    if (delta > 0 && item.id) {
      trackCartAddition(item.id);
    }
    
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (p) =>
          p.name === item.name &&
          p.category === item.category &&
          ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
           (!p.ice && !item.ice)) &&
          p.alcohol === item.alcohol &&
          p.balyFlavor === item.balyFlavor &&
          p.energyDrink === item.energyDrink &&
          p.energyDrinkFlavor === item.energyDrinkFlavor &&
          JSON.stringify(p.energyDrinks) === JSON.stringify(item.energyDrinks)
      );
      
      if (existingItem) {
        const updatedCart = prevCart
          .map(p =>
            p.name === item.name &&
            p.category === item.category &&
            ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
             (!p.ice && !item.ice)) &&
            p.alcohol === item.alcohol &&
            p.balyFlavor === item.balyFlavor &&
            p.energyDrink === item.energyDrink &&
            p.energyDrinkFlavor === item.energyDrinkFlavor &&
            JSON.stringify(p.energyDrinks) === JSON.stringify(item.energyDrinks)
              ? { ...p, qty: Math.max(0, (p.qty || 0) + delta) }
              : p
          )
          .filter(p => (p.qty || 0) > 0);
        
        return updatedCart;
      }
      
      return delta > 0 ? [...prevCart, { ...item, qty: 1 }] : prevCart;
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
        cliente_nome: `BALCÃO - ${funcionarioNome || 'Funcionário'}`,
        cliente_endereco: '-',
        cliente_numero: null,
        cliente_complemento: null,
        cliente_referencia: null,
        cliente_bairro: 'BALCAO',
        taxa_entrega: 0,
        cliente_whatsapp: '-',
        forma_pagamento: formaPagamento || 'Não informado',
        troco: valorTroco || null,
        observacao: null,
        itens: cart as any,
        total: total || 0,
        status: 'pendente',
        discount_amount: totalDiscountAmount || 0,
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
  
  // Ice/flavor selection helpers
  const updateIceQuantity = (flavor: string, delta: number) => {
    setSelectedIce((prev) => {
      const currentTotal = Object.values(prev).reduce((sum, v) => sum + v, 0);
      const maxIce = 5; // Copão e Combo sempre têm 5 gelos
      
      if (delta > 0 && currentTotal >= maxIce) return prev;
      
      return { 
        ...prev, 
        [flavor]: Math.max(0, (prev[flavor] || 0) + delta) 
      };
    });
  };
  
  const confirmFlavorSelection = () => {
    if (!selectedProductForFlavor) return;
    
    const totalIce = Object.values(selectedIce).reduce((sum, qty) => sum + qty, 0);
    const isCopaoProduct = isCopao(selectedProductForFlavor);
    const isComboProduct = isCombo(selectedProductForFlavor);
    
    console.log('🎯 Confirm Flavor - Is Copão:', isCopaoProduct, 'Is Combo:', isComboProduct, 'Total Ice:', totalIce);
    console.log('🎯 Product:', selectedProductForFlavor.name, 'Category:', selectedProductForFlavor.category);
    
    if ((isCopaoProduct || isComboProduct) && totalIce !== 5) {
      toast({
        title: "Seleção incompleta",
        description: `Por favor, selecione exatamente 5 gelos para ${isCopaoProduct ? 'Copão' : 'Combo'}.`,
        variant: "destructive",
      });
      return;
    }
    
    const productWithIce = {
      ...selectedProductForFlavor,
      ice: { ...selectedIce }
    };
    
    console.log('🎯 Product with ice:', productWithIce);
    
    if (isCopaoProduct) {
      console.log('✅ Opening energy drink modal for Copão');
      setCurrentProductType('copao');
      setPendingProductWithIce(productWithIce);
      setIsFlavorModalOpen(false);
      setIsEnergyDrinkModalOpen(true);
    } else if (isComboProduct) {
      console.log('✅ Opening energy drink modal for Combo');
      setCurrentProductType('combo');
      setPendingProductWithIce(productWithIce);
      setIsFlavorModalOpen(false);
      setIsEnergyDrinkModalOpen(true);
    } else if (containsBaly(selectedProductForFlavor.name)) {
      console.log('✅ Opening Baly modal');
      setPendingProductWithIce(productWithIce);
      setIsFlavorModalOpen(false);
      setSelectedProductForBaly(productWithIce);
      setIsBalyModalOpen(true);
    } else {
      console.log('✅ Direct add to cart with ice');
      handleUpdateQuantity(productWithIce, 1);
      setIsFlavorModalOpen(false);
      setSelectedProductForFlavor(null);
      setSelectedIce({}); // Reset
    }
  };
  
  const confirmAlcoholSelection = () => {
    if (!selectedProductForAlcohol || !selectedAlcohol) return;
    
    const productWithAlcohol = {
      ...selectedProductForAlcohol,
      alcohol: selectedAlcohol.name,
      price: (selectedProductForAlcohol.price || 0) + selectedAlcohol.extraCost
    };
    
    if (containsBaly(selectedProductForAlcohol.name)) {
      setSelectedProductForBaly(productWithAlcohol);
      setIsAlcoholModalOpen(false);
      setIsBalyModalOpen(true);
    } else {
      handleUpdateQuantity(productWithAlcohol, 1);
      setIsAlcoholModalOpen(false);
      setSelectedProductForAlcohol(null);
    }
  };
  
  const confirmBalySelection = (flavor: string) => {
    if (!selectedProductForBaly) return;
    
    const productWithBaly = {
      ...selectedProductForBaly,
      balyFlavor: flavor
    };
    
    handleUpdateQuantity(productWithBaly, 1);
    setIsBalyModalOpen(false);
    setSelectedProductForBaly(null);
  };
  
  const handleEnergyDrinkSelection = (energyDrinks: { 
    selections: Array<{ type: string; flavor: string }>;
    totalExtraCost: number;
  }) => {
    if (!pendingProductWithIce) {
      console.log('❌ No pending product with ice');
      return;
    }

    console.log('⚡ Energy drink selection:', energyDrinks);
    console.log('⚡ Pending product:', pendingProductWithIce.name);

    const firstEnergyDrink = energyDrinks.selections.length > 0 ? 
      energyDrinks.selections[0].type : '';
    const firstEnergyDrinkFlavor = energyDrinks.selections.length > 0 ? 
      energyDrinks.selections[0].flavor : '';

    const finalProduct = {
      ...pendingProductWithIce,
      energyDrink: firstEnergyDrink,
      energyDrinkFlavor: firstEnergyDrinkFlavor,
      energyDrinks: energyDrinks.selections,
      price: (pendingProductWithIce.price || 0) + energyDrinks.totalExtraCost
    };

    console.log('✅ Final product with energy drinks:', finalProduct);

    handleUpdateQuantity(finalProduct, 1);
    setIsEnergyDrinkModalOpen(false);
    setPendingProductWithIce(null);
    setSelectedProductForFlavor(null);
    setSelectedIce({}); // Reset

    toast({
      title: "Energéticos selecionados",
      description: `${energyDrinks.selections.length} energético(s) adicionado(s) ao pedido.`,
    });
  };

  return {
    cart,
    isProcessing,
    showPasswordDialog,
    isFlavorModalOpen,
    isAlcoholModalOpen,
    isBalyModalOpen,
    isEnergyDrinkModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForBaly,
    selectedIce,
    selectedAlcohol,
    pendingProductWithIce,
    currentProductType,
    setShowPasswordDialog,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setIsBalyModalOpen,
    setIsEnergyDrinkModalOpen,
    setSelectedAlcohol,
    setPendingProductWithIce,
    addToCart,
    updateQuantity,
    getTotal,
    processOrder,
    clearCart,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmBalySelection,
    handleEnergyDrinkSelection
  };
};
