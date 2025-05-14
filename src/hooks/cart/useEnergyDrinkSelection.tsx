
import { Product } from '../../types';
import { useToast } from '@/hooks/use-toast';

export const useEnergyDrinkSelection = (
  pendingProductWithIce: Product | null,
  setIsEnergyDrinkModalOpen: (isOpen: boolean) => void,
  setPendingProductWithIce: (product: Product | null) => void,
  handleUpdateQuantity: (item: Product, delta: number) => void
) => {
  const { toast } = useToast();

  const handleEnergyDrinkSelection = (energyDrinks: { 
    selections: Array<{ type: string; flavor: string }>;
    totalExtraCost: number;
  }) => {
    if (!pendingProductWithIce) return;

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

    handleUpdateQuantity(finalProduct, 1);
    setIsEnergyDrinkModalOpen(false);
    setPendingProductWithIce(null);

    toast({
      title: "Energéticos selecionados",
      description: `${energyDrinks.selections.length} energético(s) adicionado(s) ao pedido.`,
    });
  };

  return {
    handleEnergyDrinkSelection
  };
};
