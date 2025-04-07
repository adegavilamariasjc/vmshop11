
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
import { FormData, Bairro } from '../types';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>({
    nome: '',
    endereco: '',
    numero: '',
    complemento: '',
    referencia: '',
    observacao: '',
    whatsapp: '',
    bairro: { nome: 'Selecione Um Bairro', taxa: 0 },
    pagamento: '',
    troco: ''
  });
  
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
        .select('id, name')
        .limit(5);
      
      if (categoriesError) {
        console.error("Erro ao verificar categorias:", categoriesError);
        toast({
          title: "Erro ao verificar dados",
          description: "Houve um problema ao verificar os dados no banco. Tente migrar os dados manualmente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Se não existem dados, sugerir migração manual
      if (!categories || categories.length === 0) {
        toast({
          title: "Dados não encontrados",
          description: "Nenhum dado encontrado no banco. Use o botão 'Migrar Dados' para inicializar o sistema.",
          variant: "warning",
        });
      } else {
        console.log("Categorias encontradas:", categories);
        toast({
          title: "Dados encontrados",
          description: `${categories.length} categorias encontradas no banco.`,
        });
      }
    } catch (error) {
      console.error("Erro ao verificar dados:", error);
      toast({
        title: "Erro ao verificar dados",
        description: "Houve um problema ao verificar os dados. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setInitialDataLoaded(true);
    }
  };

  const handleForceMigration = async () => {
    if (migrationInProgress) return;
    
    setMigrationInProgress(true);
    toast({
      title: "Iniciando migração",
      description: "Estamos migrando os dados para o banco. Isso pode levar alguns segundos...",
    });
    
    try {
      await migrateStaticDataToSupabase();
      localStorage.setItem('dataMigrationComplete', 'true');
      
      toast({
        title: "Migração concluída",
        description: "Os dados foram migrados com sucesso. Atualizando a página...",
      });
      
      // Recarregar a página após 2 segundos para garantir que os dados sejam carregados corretamente
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Erro na migração:", error);
      toast({
        title: "Erro na migração",
        description: "Não foi possível migrar os dados. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setMigrationInProgress(false);
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

  const handleCheckoutSubmit = () => {
    // Add checkout submission logic here
    console.log("Submitting order:", { cart, form });
    toast({
      title: "Pedido enviado",
      description: "Seu pedido foi enviado com sucesso!",
    });
    setShowSummary(false);
  };

  if (showSummary) {
    return (
      <PageLayout>
        <CheckoutView 
          cart={cart}
          form={form}
          setForm={setForm}
          onBackToProducts={() => setShowSummary(false)}
          onSubmit={handleCheckoutSubmit}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {initialDataLoaded && (
        <div className="mb-4 flex flex-col">
          <Button 
            onClick={handleForceMigration}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg mb-4"
            disabled={migrationInProgress}
          >
            {migrationInProgress ? 'Migrando Dados...' : 'Migrar Dados para o Banco'}
          </Button>
          <p className="text-white text-sm mb-4 text-center">
            Se os produtos e categorias não estão aparecendo, clique no botão acima para migrar os dados para o banco.
          </p>
        </div>
      )}
      
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
          isOpen={isFlavorModalOpen}
          product={selectedProductForFlavor}
          selectedIce={selectedIce}
          updateIceQuantity={updateIceQuantity}
          onClose={() => setIsFlavorModalOpen(false)}
          onConfirm={confirmFlavorSelection}
        />
      )}
      
      {isAlcoholModalOpen && selectedProductForAlcohol && (
        <AlcoholSelectionModal
          isOpen={isAlcoholModalOpen}
          product={selectedProductForAlcohol}
          selectedAlcohol={selectedAlcohol}
          setSelectedAlcohol={setSelectedAlcohol}
          onClose={() => setIsAlcoholModalOpen(false)}
          onConfirm={confirmAlcoholSelection}
        />
      )}
      
      <AdminLink />
    </PageLayout>
  );
};

export default Index;
