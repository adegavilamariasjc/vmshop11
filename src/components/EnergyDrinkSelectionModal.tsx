
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnergyDrinkOption {
  name: string;
  flavors: string[];
  extraCost: number;
  extraCostCopao?: number;
  maxQuantity?: number;
  isLargeDrink?: boolean;
}

interface EnergyDrinkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (energyDrink: { selections: Array<{ type: string; flavor: string }>, totalExtraCost: number }) => void;
  productType?: 'copao' | 'combo';
}

const EnergyDrinkSelectionModal: React.FC<EnergyDrinkSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productType = 'combo'
}) => {
  const { toast } = useToast();
  const [selections, setSelections] = useState<Record<string, Record<string, number>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isOpen) {
      setSubmitting(false);
    } else {
      setSelections({});
    }
  }, [isOpen]);
  
  const setSubmitting = (value: boolean) => {
    setIsSubmitting(value);
    if (value) {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 5000);
    }
  };
  
  const energyDrinkOptions: EnergyDrinkOption[] = [
    {
      name: "Energético Tradicional",
      flavors: ["Tradicional"],
      extraCost: 10,
      extraCostCopao: 0,
      maxQuantity: 1,
      isLargeDrink: true
    },
    {
      name: "Baly",
      flavors: ["Melancia", "Tropical", "Maçã Verde", "Pêssego com Morango"],
      extraCost: 15,
      extraCostCopao: 0,
      maxQuantity: 1,
      isLargeDrink: true
    },
    {
      name: "Red Bull",
      flavors: ["Tradicional", "Melancia com Melão", "Pomelo", "Tropical", "Frutas Tropicais", "Pêssego", "Pera com Canela"],
      extraCost: 12,
      extraCostCopao: 12,
      maxQuantity: productType === 'copao' ? 1 : 5
    },
    {
      name: "Monster",
      flavors: ["Tradicional", "Mango Loco", "Melancia"],
      extraCost: 12,
      extraCostCopao: 12,
      maxQuantity: productType === 'copao' ? 1 : 5
    },
    {
      name: "Fusion",
      flavors: ["Fusion (1 litro)"],
      extraCost: 15,
      extraCostCopao: 10,
      maxQuantity: 1,
      isLargeDrink: true
    }
  ];
  
  const getTotalCanCount = () => {
    if (productType === 'copao') return 0;
    
    const redBullCount = selections['Red Bull'] 
      ? Object.values(selections['Red Bull']).reduce((sum, qty) => sum + qty, 0) 
      : 0;
    
    const monsterCount = selections['Monster'] 
      ? Object.values(selections['Monster']).reduce((sum, qty) => sum + qty, 0) 
      : 0;
    
    return redBullCount + monsterCount;
  };
  
  const handleAddEnergyDrink = (type: string, flavor: string) => {
    if (isSubmitting) return;
    
    const option = energyDrinkOptions.find(opt => opt.name === type);
    if (!option) return;

    if (productType === 'copao') {
      const totalSelections = Object.values(selections).reduce((sum, typeSelections) => 
        sum + Object.values(typeSelections).reduce((a, b) => a + b, 0), 0);
        
      if (totalSelections >= 1) {
        toast({
          title: "Limite atingido",
          description: "Para copão, você pode selecionar apenas 1 energético.",
          variant: "destructive",
        });
        return;
      }
    } else {
      const hasLargeDrinks = Object.keys(selections).some(drinkType => 
        energyDrinkOptions.find(opt => opt.name === drinkType)?.isLargeDrink
      );
      const isLargeDrink = option.isLargeDrink;
      const hasCans = Object.keys(selections).some(drinkType => {
        const opt = energyDrinkOptions.find(opt => opt.name === drinkType);
        return !opt?.isLargeDrink && Object.values(selections[drinkType]).some(qty => qty > 0);
      });

      if (isLargeDrink && hasCans) {
        toast({
          title: "Seleção não permitida",
          description: "Não é possível misturar bebidas de 2L com latas no mesmo combo.",
          variant: "destructive",
        });
        return;
      }

      if (!isLargeDrink && hasLargeDrinks) {
        toast({
          title: "Seleção não permitida",
          description: "Você já selecionou uma bebida de 2L. Não é possível adicionar latas.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if total cans would exceed 5
      if (!isLargeDrink) {
        const totalCans = getTotalCanCount();
        if (totalCans >= 5) {
          toast({
            title: "Limite atingido",
            description: "Você pode selecionar no máximo 5 latas de energético no total.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    const currentTypeTotal = Object.values(selections[type] || {}).reduce((sum, qty) => sum + qty, 0);
    const maxForType = productType === 'copao' ? 1 : (option.maxQuantity || 5);

    if (currentTypeTotal >= maxForType) {
      toast({
        title: "Limite atingido",
        description: `Você pode selecionar no máximo ${maxForType} ${type}${maxForType > 1 ? 's' : ''}.`,
        variant: "destructive",
      });
      return;
    }

    setSelections(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [flavor]: (prev[type]?.[flavor] || 0) + 1
      }
    }));
  };
  
  const handleRemoveEnergyDrink = (type: string, flavor: string) => {
    if (isSubmitting) return;
    if (!selections[type]?.[flavor]) return;
    
    setSelections(prev => {
      const newSelections = {
        ...prev,
        [type]: {
          ...prev[type],
          [flavor]: Math.max(0, (prev[type]?.[flavor] || 0) - 1)
        }
      };
      
      if (newSelections[type][flavor] === 0) {
        delete newSelections[type][flavor];
      }
      if (Object.keys(newSelections[type]).length === 0) {
        delete newSelections[type];
      }
      
      return newSelections;
    });
  };
  
  const handleConfirm = () => {
    if (isSubmitting) return;
    
    const totalSelections = Object.values(selections).reduce((sum, typeSelections) => 
      sum + Object.values(typeSelections).reduce((a, b) => a + b, 0), 0);
      
    if (totalSelections === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, selecione pelo menos 1 energético.",
        variant: "destructive",
      });
      return;
    }

    if (productType === 'copao') {
      if (totalSelections !== 1) {
        toast({
          title: "Seleção incorreta",
          description: "Para copão, é necessário selecionar exatamente 1 energético.",
          variant: "destructive",
        });
        return;
      }
    } else {
      const hasLargeDrink = Object.keys(selections).some(drinkType => 
        energyDrinkOptions.find(opt => opt.name === drinkType)?.isLargeDrink
      );

      if (!hasLargeDrink && getTotalCanCount() !== 5) {
        toast({
          title: "Seleção incorreta",
          description: "Para combos com latas, é necessário selecionar exatamente 5 latas de energético.",
          variant: "destructive",
        });
        return;
      }

      if (hasLargeDrink && totalSelections !== 1) {
        toast({
          title: "Seleção incorreta",
          description: "Para combos com bebidas de 2L, é necessário selecionar exatamente 1 unidade.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setSubmitting(true);
    
    const energyDrinkSelections: Array<{ type: string; flavor: string }> = [];
    let totalExtraCost = 0;
    
    Object.entries(selections).forEach(([type, flavors]) => {
      const option = energyDrinkOptions.find(opt => opt.name === type);
      if (!option) return;
      
      Object.entries(flavors).forEach(([flavor, quantity]) => {
        for (let i = 0; i < quantity; i++) {
          energyDrinkSelections.push({ type, flavor });
          totalExtraCost += productType === 'copao' 
            ? (option.extraCostCopao !== undefined ? option.extraCostCopao : option.extraCost)
            : option.extraCost;
        }
      });
    });
    
    setTimeout(() => {
      onConfirm({ selections: energyDrinkSelections, totalExtraCost });
      setSelections({});
      setSubmitting(false);
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto z-[80] bg-gray-900 border-white/20">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-bold text-white">
            Qual energético acompanha?
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-xs">
            {productType === 'copao' 
              ? 'Selecione 1 energético'
              : 'Máx. 5 latas (Red Bull/Monster) ou 1 de 2L'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {energyDrinkOptions.map((option) => {
            const extraCost = productType === 'copao' 
              ? (option.extraCostCopao !== undefined ? option.extraCostCopao : option.extraCost)
              : option.extraCost;
              
            return (
              <div key={option.name} className="bg-gray-800 rounded-lg p-2 border border-gray-700">
                <h3 className="text-purple-light font-semibold mb-1.5 flex items-center gap-2 text-xs">
                  🔹 {option.name}
                  {extraCost > 0 && (
                    <span className="text-xs text-gray-300">(+R${extraCost.toFixed(2)})</span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {option.flavors.map((flavor) => {
                    const quantity = selections[option.name]?.[flavor] || 0;
                    return (
                      <div
                        key={`${option.name}-${flavor}`}
                        className="flex items-center justify-between px-1.5 py-1 rounded bg-gray-700/50 text-white text-xs"
                      >
                        <span className="truncate">• {flavor}</span>
                        <div className="flex items-center gap-1">
                          {quantity > 0 && (
                            <>
                              <button
                                onClick={() => handleRemoveEnergyDrink(option.name, flavor)}
                                className="p-0.5 hover:bg-purple-600 rounded"
                                disabled={isSubmitting}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="min-w-[16px] text-center font-semibold">{quantity}</span>
                            </>
                          )}
                          <button
                            onClick={() => handleAddEnergyDrink(option.name, flavor)}
                            className="p-0.5 hover:bg-purple-600 rounded bg-purple-700"
                            disabled={isSubmitting}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-3">
          <Button 
            onClick={handleConfirm}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processando...</span>
              </div>
            ) : (
              <span>Confirmar Seleção</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnergyDrinkSelectionModal;
