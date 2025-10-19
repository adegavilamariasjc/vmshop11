
import React from 'react';
import { useCart } from '../hooks/cart';
import { AnimatePresence } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import ProductSelectionView from '../components/ProductSelectionView';
import CheckoutView from '../components/CheckoutView';
import AdminLink from '../components/AdminLink';
import MotoboyLink from '../components/MotoboyLink';
import { useStoreStatus } from '@/hooks/useStoreStatus';
import LoadingIndicator from '../components/LoadingIndicator';
import IndexModals from '../components/IndexModals';
import { useFormData } from '../hooks/useFormData';
import { useOrderHandling } from '../hooks/useOrderHandling';
import { AlcoholOption } from '@/types';
import { normalizeText } from '@/lib/utils';

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
    isQuantityModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForBaly,
    pendingProductForQuantity,
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
    setIsQuantityModalOpen,
    setPendingProductWithIce,
    handleEnergyDrinkSelection,
    handleQuantitySelection
  } = useCart(isOpen);

  const {
    form,
    setForm,
    bairros,
    isLoading
  } = useFormData();

  const {
    codigoPedido,
    isSendingOrder,
    showSuccessModal,
    isDuplicateOrder,
    setShowSuccessModal,
    processOrder,
    handleOrderConfirmation
  } = useOrderHandling();

  const handleIceConfirmation = (productWithIce) => {
    if (normalizeText(productWithIce.name).includes('copao')) {
      setPendingProductWithIce(productWithIce);
      setIsEnergyDrinkModalOpen(true);
    } else {
      handleAddProduct(productWithIce);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingIndicator />
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
            onSubmit={(isBalcao?: boolean, funcionario?: string) => processOrder(cart, form, isOpen, { balcao: !!isBalcao, funcionario })}
            isSending={isSendingOrder}
            isStoreOpen={isOpen}
          />
        )}
      </AnimatePresence>
      
      <IndexModals
        isFlavorModalOpen={isFlavorModalOpen}
        isAlcoholModalOpen={isAlcoholModalOpen}
        isBalyModalOpen={isBalyModalOpen}
        isEnergyDrinkModalOpen={isEnergyDrinkModalOpen}
        isQuantityModalOpen={isQuantityModalOpen}
        showSuccessModal={showSuccessModal}
        selectedProductForFlavor={selectedProductForFlavor}
        selectedProductForAlcohol={selectedProductForAlcohol}
        selectedProductForBaly={selectedProductForBaly}
        pendingProductForQuantity={pendingProductForQuantity}
        selectedIce={selectedIce}
        selectedAlcohol={selectedAlcohol}
        currentProductType={currentProductType}
        codigoPedido={codigoPedido}
        isDuplicateOrder={isDuplicateOrder}
        isStoreOpen={isOpen}
        setIsFlavorModalOpen={setIsFlavorModalOpen}
        setIsAlcoholModalOpen={setIsAlcoholModalOpen}
        setIsBalyModalOpen={setIsBalyModalOpen}
        setIsEnergyDrinkModalOpen={setIsEnergyDrinkModalOpen}
        setIsQuantityModalOpen={setIsQuantityModalOpen}
        setShowSuccessModal={setShowSuccessModal}
        setSelectedAlcohol={setSelectedAlcohol}
        updateIceQuantity={updateIceQuantity}
        confirmFlavorSelection={confirmFlavorSelection}
        confirmAlcoholSelection={confirmAlcoholSelection}
        confirmBalySelection={confirmBalySelection}
        handleEnergyDrinkSelection={handleEnergyDrinkSelection}
        handleQuantitySelection={handleQuantitySelection}
        handleOrderConfirmation={handleOrderConfirmation}
        setPendingProductWithIce={setPendingProductWithIce}
      />
      
      <MotoboyLink />
      <AdminLink />
    </PageLayout>
  );
};

export default Index;
