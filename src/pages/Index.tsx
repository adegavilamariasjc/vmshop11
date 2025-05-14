import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/cart';
import { AnimatePresence } from 'framer-motion';
import { gerarCodigoPedido } from '../data/products';
import { formatWhatsAppMessage } from '../utils/formatWhatsApp';
import { FormData, Product } from '../types';
import PageLayout from '../components/PageLayout';
import ProductSelectionView from '../components/ProductSelectionView';
import CheckoutView from '../components/CheckoutView';
import FlavorSelectionModal from '../components/FlavorSelectionModal';
import AlcoholSelectionModal from '../components/AlcoholSelectionModal';
import BalyFlavorSelectionModal from '../components/BalyFlavorSelectionModal';
import EnergyDrinkSelectionModal from '../components/EnergyDrinkSelectionModal';
import OrderSuccessModal from '../components/OrderSuccessModal';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLink from '../components/AdminLink';
import { savePedido, fetchPedidos } from '@/lib/supabase';
import { useStoreStatus } from '@/hooks/useStoreStatus';
import { getProductDisplayPrice } from '../utils/discountUtils';

const Index = () => {
  const { isOpen } = useStoreStatus();
  const {
    cart,
    activeCategory,
    showSummary,
    isFlavorModalOpen,
    isAlcoholModalOpen,
    isBalyModalOpen,
    isEnergyDrinkModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForBaly,
    selectedIce,
    selectedAlcohol,
    currentProductType,
    setShowSummary,
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmBalySelection,
    checkMissingFlavorsAndProceed,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setIsBalyModalOpen,
    setSelectedAlcohol,
    setSelectedProductForBaly,
    setIsEnergyDrinkModalOpen,
    setPendingProductWithIce,
    handleEnergyDrinkSelection
  } = useCart();

  const [codigoPedido] = useState(gerarCodigoPedido());
  const [form, setForm] = useState<FormData>({
    nome: "",
    endereco: "",
    numero: "",
    complemento: "",
    referencia: "",
    observacao: "",
    whatsapp: "",
    bairro: { nome: "Selecione Um Bairro", taxa: 0 },
    pagamento: "",
    troco: ""
  });
  const [bairros, setBairros] = useState<{nome: string; taxa: number}[]>([
    { nome: "Selecione Um Bairro", taxa: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchBairros = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bairros')
          .select('*')
          .order('nome');
        
        if (error) {
          console.error('Error fetching bairros:', error);
          setIsLoading(false);
          return;
        }
        
        const formattedBairros = data.map(b => ({
          nome: b.nome,
          taxa: b.taxa
        }));
        
        setBairros(formattedBairros);
      } catch (err) {
        console.error('Unexpected error fetching bairros:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBairros();
  }, []);

  useEffect(() => {
    console.log("Index component, isEnergyDrinkModalOpen:", isEnergyDrinkModalOpen, "productType:", currentProductType);
  }, [isEnergyDrinkModalOpen, currentProductType]);

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
    
    // Calculate total with discounts applied
    const total = cart.reduce((sum, p) => sum + getProductDisplayPrice(p), 0) + form.bairro.taxa;
    
    const isDuplicate = await checkDuplicateOrder(form.nome, form.whatsapp, total);
    setIsDuplicateOrder(isDuplicate);

    if (isDuplicate) {
      return true;
    }
    
    try {
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
        troco: form.troco,
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
        const isBeer = p.category?.toLowerCase().includes('cerveja');
        const hasDiscount = isBeer && (p.qty || 0) >= 12;
        const discountText = hasDiscount ? " (-10%)" : "";
        
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

  const handleIceConfirmation = (productWithIce: Product) => {
    if (productWithIce.name.toLowerCase().includes('copão')) {
      setPendingProductWithIce(productWithIce);
      setIsEnergyDrinkModalOpen(true);
    } else {
      handleAddProduct(productWithIce);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Carregando dados...</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <AnimatePresence mode="wait">
        {!showSummary ? (
          <ProductSelectionView
            activeCategory={activeCategory}
            cart={cart}
            onSelectCategory={handleSelectCategory}
            onAddProduct={handleAddProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onProceedToCheckout={checkMissingFlavorsAndProceed}
            isStoreOpen={isOpen}
          />
        ) : (
          <CheckoutView
            cart={cart}
            form={form}
            setForm={setForm}
            bairros={bairros}
            onBackToProducts={() => setShowSummary(false)}
            onSubmit={processOrder}
            isSending={isSendingOrder}
            isStoreOpen={isOpen}
          />
        )}
      </AnimatePresence>
      
      <FlavorSelectionModal 
        isOpen={isFlavorModalOpen}
        onClose={() => setIsFlavorModalOpen(false)}
        product={selectedProductForFlavor}
        selectedIce={selectedIce}
        updateIceQuantity={updateIceQuantity}
        onConfirm={confirmFlavorSelection}
      />
      
      <AlcoholSelectionModal
        isOpen={isAlcoholModalOpen}
        onClose={() => setIsAlcoholModalOpen(false)}
        product={selectedProductForAlcohol}
        selectedAlcohol={selectedAlcohol}
        setSelectedAlcohol={setSelectedAlcohol}
        onConfirm={confirmAlcoholSelection}
      />
      
      <BalyFlavorSelectionModal
        isOpen={isBalyModalOpen}
        onClose={() => setIsBalyModalOpen(false)}
        product={selectedProductForBaly}
        onConfirm={confirmBalySelection}
      />
      
      <EnergyDrinkSelectionModal
        isOpen={isEnergyDrinkModalOpen}
        onClose={() => {
          setIsEnergyDrinkModalOpen(false);
          setPendingProductWithIce(null);
        }}
        onConfirm={handleEnergyDrinkSelection}
        productType={currentProductType}
      />
      
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        codigoPedido={codigoPedido}
        isDuplicate={isDuplicateOrder}
        onConfirm={handleOrderConfirmation}
      />
      
      <AdminLink />
    </PageLayout>
  );
};

export default Index;
