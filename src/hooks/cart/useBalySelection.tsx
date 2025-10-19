
import { Product } from '../../types';
import { useToast } from '@/hooks/use-toast';

export const useBalySelection = (
  selectedProductForBaly: Product | null,
  setIsBalyModalOpen: (isOpen: boolean) => void,
  setIsQuantityModalOpen: (isOpen: boolean) => void,
  setPendingProductForQuantity: (product: Product | null) => void,
  handleUpdateQuantity: (item: Product, delta: number) => void
) => {
  const { toast } = useToast();

  const confirmBalySelection = (flavor: string) => {
    if (!selectedProductForBaly || !flavor) return;
    
    const itemWithBaly = {
      ...selectedProductForBaly,
      balyFlavor: flavor
    };
    
    setIsBalyModalOpen(false);
    setPendingProductForQuantity(itemWithBaly);
    setIsQuantityModalOpen(true);
    
    toast({
      title: "Baly selecionado",
      description: "Agora selecione a quantidade.",
    });
  };

  return {
    confirmBalySelection
  };
};
