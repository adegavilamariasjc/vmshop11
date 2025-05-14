
import { Product, AlcoholOption } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { containsBaly } from '../../data/products';

export const useAlcoholSelection = (
  selectedProductForAlcohol: Product | null,
  selectedAlcohol: AlcoholOption | null,
  setIsAlcoholModalOpen: (isOpen: boolean) => void,
  setSelectedProductForBaly: (product: Product | null) => void,
  setIsBalyModalOpen: (isOpen: boolean) => void,
  handleUpdateQuantity: (item: Product, delta: number) => void
) => {
  const { toast } = useToast();

  const confirmAlcoholSelection = () => {
    if (!selectedProductForAlcohol || !selectedAlcohol) return;
    
    const extraCost = selectedAlcohol.extraCost;
    const itemWithAlcohol = {
      ...selectedProductForAlcohol,
      alcohol: selectedAlcohol.name,
      price: (selectedProductForAlcohol.price || 0) + extraCost,
    };
    
    if (containsBaly(itemWithAlcohol.name)) {
      setSelectedProductForBaly(itemWithAlcohol);
      setIsAlcoholModalOpen(false);
      setIsBalyModalOpen(true);
    } else {
      handleUpdateQuantity(itemWithAlcohol, 1);
      setIsAlcoholModalOpen(false);
      
      toast({
        title: "Item adicionado",
        description: `${selectedProductForAlcohol.name} com ${selectedAlcohol.name} adicionado ao pedido.`,
      });
    }
  };

  return {
    confirmAlcoholSelection
  };
};
