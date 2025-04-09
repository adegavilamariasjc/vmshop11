
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
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLink from '../components/AdminLink';

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchBairros = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bairros')
          .select('nome, taxa')
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

  const salvarPedidoNoBanco = async () => {
    if (cart.length === 0) return false;
    
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0) + form.bairro.taxa;
    
    try {
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
          troco: form.troco,
          observacao: form.observacao,
          itens: cart,
          total: total
        })
        .select();
      
      if (error) {
        console.error('Erro ao salvar pedido:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Erro inesperado ao salvar pedido:', err);
      return false;
    }
  };

  const enviarPedidoWhatsApp = async () => {
    if (cart.length === 0) {
      return;
    }
    
    setIsSendingOrder(true);
    
    try {
      // Primeiro, salvar o pedido no banco de dados
      const pedidoSalvo = await salvarPedidoNoBanco();
      
      if (!pedidoSalvo) {
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar o pedido. Tente novamente.',
          variant: 'destructive'
        });
        setIsSendingOrder(false);
        return;
      }
      
      // Depois, prepara a mensagem para WhatsApp
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
      const urlWhatsApp = `https://wa.me/5512982704573?text=${mensagemEncoded}`;
      window.open(urlWhatsApp, "_blank");
      
      toast({
        title: 'Pedido enviado',
        description: 'Seu pedido foi registrado com sucesso e enviado para o WhatsApp.'
      });
      
      // Limpar o carrinho e retornar para a seleção de produtos
      setShowSummary(false);
      
      setTimeout(() => {
        // Atualizar a página para reiniciar o pedido
        window.location.reload();
      }, 1000);
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
            onSubmit={enviarPedidoWhatsApp}
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
      
      <AdminLink />
    </PageLayout>
  );
};

export default Index;
