
import React from 'react';
import { Product } from '../types';
import FlavorSelectionModal from './FlavorSelectionModal';
import AlcoholSelectionModal from './AlcoholSelectionModal';
import BalyFlavorSelectionModal from './BalyFlavorSelectionModal';
import EnergyDrinkSelectionModal from './EnergyDrinkSelectionModal';
import OrderSuccessModal from './OrderSuccessModal';

interface IndexModalsProps {
  isFlavorModalOpen: boolean;
  isAlcoholModalOpen: boolean;
  isBalyModalOpen: boolean;
  isEnergyDrinkModalOpen: boolean;
  showSuccessModal: boolean;
  selectedProductForFlavor: Product | null;
  selectedProductForAlcohol: Product | null;
  selectedProductForBaly: Product | null;
  selectedIce: Record<string, number>;
  selectedAlcohol: string;
  currentProductType: string;
  codigoPedido: string;
  isDuplicateOrder: boolean;
  setIsFlavorModalOpen: (isOpen: boolean) => void;
  setIsAlcoholModalOpen: (isOpen: boolean) => void;
  setIsBalyModalOpen: (isOpen: boolean) => void;
  setIsEnergyDrinkModalOpen: (isOpen: boolean) => void;
  setShowSuccessModal: (show: boolean) => void;
  setSelectedAlcohol: (alcohol: string) => void;
  updateIceQuantity: (flavor: string, quantity: number) => void;
  confirmFlavorSelection: () => void;
  confirmAlcoholSelection: () => void;
  confirmBalySelection: () => void;
  handleEnergyDrinkSelection: (energyDrink: string, flavor: string) => void;
  handleOrderConfirmation: () => void;
  setPendingProductWithIce: (product: Product | null) => void;
}

const IndexModals: React.FC<IndexModalsProps> = ({
  isFlavorModalOpen,
  isAlcoholModalOpen,
  isBalyModalOpen,
  isEnergyDrinkModalOpen,
  showSuccessModal,
  selectedProductForFlavor,
  selectedProductForAlcohol,
  selectedProductForBaly,
  selectedIce,
  selectedAlcohol,
  currentProductType,
  codigoPedido,
  isDuplicateOrder,
  setIsFlavorModalOpen,
  setIsAlcoholModalOpen,
  setIsBalyModalOpen,
  setIsEnergyDrinkModalOpen,
  setShowSuccessModal,
  setSelectedAlcohol,
  updateIceQuantity,
  confirmFlavorSelection,
  confirmAlcoholSelection,
  confirmBalySelection,
  handleEnergyDrinkSelection,
  handleOrderConfirmation,
  setPendingProductWithIce
}) => {
  return (
    <>
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
    </>
  );
};

export default IndexModals;
