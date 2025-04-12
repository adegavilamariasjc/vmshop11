
import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { AnimatePresence } from 'framer-motion';
import { gerarCodigoPedido } from '../data/products';
import { formatWhatsAppMessage } from '../utils/formatWhatsApp';
import { FormData } from '../types';
import PageLayout from '../components/PageLayout';
import ProductSelectionView from '../components/ProductSelectionView';
import CheckoutView from '../components/CheckoutView';
import FlavorSelectionModal from '../components/FlavorSelectionModal';
import AlcoholSelectionModal from '../components/AlcoholSelectionModal';
import OrderSuccessModal from '../components/OrderSuccessModal';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLink from '../components/AdminLink';
import { savePedido, fetchPedidos } from '@/lib/supabase';

const Index = () => {
  const {
    cart,
    activeCategory,
    showSummary,
    isFlavorModalOpen,
    isAlcoholModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedIce,
    selectedAlcohol,
    setShowSummary,
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    checkMissingFlavorsAndProceed,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setSelectedAlcohol
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

  const checkDuplicateOrder = async (clienteNome: string, clienteWhatsapp: string, total: number) => {
    try {
      // Fetch recent orders (last 30 minutes)
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
      
      // If there are recent orders with the same name and whatsapp,
      // check if total is within 10% variation
      if (data && data.length > 0) {
        for (const prevOrder of data) {
          const totalDifference = Math.abs(prevOrder.total - total);
          const percentDifference = (totalDifference / total) * 100;
          
          // If order total is within 10% of a previous order, consider it a duplicate
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
    if (cart.length === 0) return false;
    
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0) + form.bairro.taxa;
    
    // Check for duplicate order
    const isDuplicate = await checkDuplicateOrder(form.nome, form.whatsapp, total);
    setIsDuplicateOrder(isDuplicate);

    // If it's a duplicate, we still show the modal but don't save the order
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
    
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0) + form.bairro.taxa;
    
    const itensPedido = cart
      .map(p => {
        const iceText = p.ice
          ? " \n   Gelo: " +
            Object.entries(p.ice)
              .filter(([flavor, qty]) => qty > 0)
              .map(([flavor, qty]) => `${flavor} x${qty}`)
              .join(", ")
          : "";
        const alcoholText = p.alcohol ? ` (Álcool: ${p.alcohol})` : "";
        return `${p.qty}x ${p.name}${alcoholText}${iceText} - R$${((p.price || 0) * (p.qty || 1)).toFixed(2)}`;
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
    // Only open WhatsApp if it's not a duplicate order
    if (!isDuplicateOrder && whatsAppUrl) {
      window.open(whatsAppUrl, "_blank");
    }
    
    // Force reload to reset the form state
    window.location.reload();
  };

  const processOrder = async () => {
    if (cart.length === 0) {
      return;
    }
    
    setIsSendingOrder(true);
    
    try {
      // Prepare the order data and check for duplicates
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
      
      // Create WhatsApp message but don't open it yet
      if (!isDuplicateOrder) {
        const url = createWhatsAppMessage();
        setWhatsAppUrl(url);
      }
      
      // Show the success/duplicate modal
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
