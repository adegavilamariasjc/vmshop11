
import { Product } from '../../types';
import { useToast } from '@/hooks/use-toast';

export const useBalySelection = (
  selectedProductForBaly: Product | null,
  setIsBalyModalOpen: (isOpen: boolean) => void,
  handleUpdateQuantity: (item: Product, delta: number) => void
) => {
  const { toast } = useToast();

  const confirmBalySelection = (flavor: string) => {
    if (!selectedProductForBaly || !flavor) return;
    
    const itemWithBaly = {
      ...selectedProductForBaly,
      balyFlavor: flavor
    };
    
    handleUpdateQuantity(itemWithBaly, 1);
    setIsBalyModalOpen(false);
    
    toast({
      title: "Item adicionado",
      description: `${selectedProductForBaly.name} com Baly ${flavor} adicionado ao pedido.`,
    });
  };

  return {
    confirmBalySelection
  };
};
