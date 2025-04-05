
import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { AnimatePresence } from 'framer-motion';
import { loadBairros } from '../data/bairros';
import { gerarCodigoPedido, migrateStaticDataToSupabase } from '../data/products';
import { formatWhatsAppMessage } from '../utils/formatWhatsApp';
import { FormData, Bairro } from '../types';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '../components/PageLayout';
import ProductSelectionView from '../components/ProductSelectionView';
import CheckoutView from '../components/CheckoutView';
import FlavorSelectionModal from '../components/FlavorSelectionModal';
import AlcoholSelectionModal from '../components/AlcoholSelectionModal';

const Index = () => {
  const { toast } = useToast();
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
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<Bairro[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeData() {
      setIsLoading(true);
      try {
        // Check if we need to migrate data to Supabase
        const bairros = await loadBairros();
        if (bairros.length <= 1) {
          // If we only have the default bairro or no bairros at all, we need to migrate data
          toast({
            title: "Migrando dados",
            description: "Inicializando o banco de dados, por favor aguarde...",
          });
          
          await migrateStaticDataToSupabase();
          toast({
            title: "Dados migrados",
            description: "Os dados foram migrados com sucesso!",
          });
        }
        
        // Load bairros again after potential migration
        const updatedBairros = await loadBairros();
        setNeighborhoodOptions(updatedBairros);
        
        // Update the form with the default bairro
        if (updatedBairros.length > 0) {
          const defaultBairro = updatedBairros.find(b => b.nome === "Selecione Um Bairro") || updatedBairros[0];
          setForm(prev => ({
            ...prev,
            bairro: defaultBairro
          }));
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao inicializar os dados do aplicativo.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeData();
  }, [toast]);

  const enviarPedidoWhatsApp = () => {
    if (cart.length === 0) {
      return;
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
    const urlWhatsApp = `https://wa.me/5512982704573?text=${mensagemEncoded}`;
    window.open(urlWhatsApp, "_blank");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="w-16 h-16 border-4 border-t-purple-dark border-gray-300 rounded-full animate-spin"></div>
          <p className="mt-4 text-white">Carregando dados...</p>
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
            onBackToProducts={() => setShowSummary(false)}
            onSubmit={enviarPedidoWhatsApp}
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
    </PageLayout>
  );
};

export default Index;
