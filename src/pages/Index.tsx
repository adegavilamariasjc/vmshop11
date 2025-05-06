
import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { AnimatePresence } from 'framer-motion';
import { gerarCodigoPedido } from '../data/products';
import { FormData, Product } from '../types';
import PageLayout from '../components/PageLayout';
import ProductSelectionView from '../components/ProductSelectionView';
import CheckoutView from '../components/CheckoutView';
import FlavorSelectionModal from '../components/FlavorSelectionModal';
import AlcoholSelectionModal from '../components/AlcoholSelectionModal';
import BalyFlavorSelectionModal from '../components/BalyFlavorSelectionModal';
import EnergyDrinkSelectionModal from '../components/EnergyDrinkSelectionModal';
import OrderSuccessModal from '../components/OrderSuccessModal';
import AdminLink from '../components/AdminLink';
import { useStoreStatus } from '@/hooks/useStoreStatus';
import { useBairros } from '@/hooks/useBairros';
import { useOrderSubmission } from '@/hooks/useOrderSubmission';
import LoadingIndicator from '@/components/LoadingIndicator';

const Index = () => {
  const { isOpen } = useStoreStatus();
  const { bairros, isLoading } = useBairros();
  
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

  const {
    isSendingOrder,
    showSuccessModal,
    isDuplicateOrder,
    setShowSuccessModal,
    processOrder,
    handleOrderConfirmation
  } = useOrderSubmission(codigoPedido, cart, form, isOpen);

  const handleIceConfirmation = (productWithIce: Product) => {
    if (productWithIce.name.toLowerCase().includes('copão')) {
      setPendingProductWithIce(productWithIce);
      setIsEnergyDrinkModalOpen(true);
    } else {
      handleAddProduct(productWithIce);
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
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
