
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import PageLayout from '../components/PageLayout';
import CategorySelector from '../components/CategorySelector';
import ProductList from '../components/ProductList';
import CartSummary from '../components/CartSummary';
import AlcoholSelectionModal from '../components/AlcoholSelectionModal';
import FlavorSelectionModal from '../components/FlavorSelectionModal';
import CheckoutView from '../components/CheckoutView';
import AdminLink from '../components/AdminLink';
import { useCart } from '../hooks/useCart';
import { migrateStaticDataToSupabase } from '../data/products';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
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

  useEffect(() => {
    checkAndMigrateData();
  }, []);

  const checkAndMigrateData = async () => {
    setIsLoading(true);
    try {
      // Verificar se já existem categorias no banco
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id')
        .limit(1);
      
      if (categoriesError) {
        console.error("Erro ao verificar categorias:", categoriesError);
        return;
      }
      
      // Se não existem dados, e a migração nunca foi feita, fazemos a migração
      if (!categories || categories.length === 0) {
        const migrationDone = localStorage.getItem('dataMigrationComplete');
        
        if (migrationDone !== 'true') {
          toast({
            title: "Preparando os dados...",
            description: "Estamos configurando o sistema pela primeira vez",
          });
          
          try {
            await migrateStaticDataToSupabase();
            localStorage.setItem('dataMigrationComplete', 'true');
          } catch (error) {
            console.error("Erro na migração inicial:", error);
            toast({
              title: "Erro ao preparar os dados",
              description: "Tente acessar a área administrativa para configurar o sistema",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar dados:", error);
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center p-8 h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-dark mb-4"></div>
          <p className="text-white text-xl font-semibold">Carregando dados...</p>
        </div>
      </PageLayout>
    );
  }

  if (showSummary) {
    return (
      <PageLayout>
        <CheckoutView cart={cart} onBack={() => setShowSummary(false)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-col mb-20">
        <CategorySelector 
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
        
        {activeCategory && (
          <ProductList
            category={activeCategory}
            cart={cart}
            onAddProduct={handleAddProduct}
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}
        
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 bg-black">
            <Button 
              onClick={checkMissingFlavorsAndProceed}
              className="w-full py-6 bg-purple-dark hover:bg-purple-900 text-white font-bold rounded-lg shadow-lg"
            >
              Ver resumo do pedido
            </Button>
          </div>
        )}
      </div>
      
      {isFlavorModalOpen && selectedProductForFlavor && (
        <FlavorSelectionModal
          product={selectedProductForFlavor}
          iceSelection={selectedIce}
          onUpdateIce={updateIceQuantity}
          onClose={() => setIsFlavorModalOpen(false)}
          onConfirm={confirmFlavorSelection}
        />
      )}
      
      {isAlcoholModalOpen && selectedProductForAlcohol && (
        <AlcoholSelectionModal
          product={selectedProductForAlcohol}
          selectedAlcohol={selectedAlcohol}
          onSelectAlcohol={setSelectedAlcohol}
          onClose={() => setIsAlcoholModalOpen(false)}
          onConfirm={confirmAlcoholSelection}
        />
      )}
      
      <AdminLink />
    </PageLayout>
  );
};

export default Index;
