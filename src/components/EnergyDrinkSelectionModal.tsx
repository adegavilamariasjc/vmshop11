
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnergyDrinkOption {
  name: string;
  flavors: string[];
  extraCost: number;
  extraCostCopao?: number;
  maxQuantity?: number;
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
  
  const energyDrinkOptions: EnergyDrinkOption[] = [
    {
      name: "Energético Tradicional",
      flavors: ["Tradicional"],
      extraCost: 0,
      extraCostCopao: 0,
      maxQuantity: 1
    },
    {
      name: "Baly",
      flavors: ["Melancia", "Tropical", "Maçã Verde", "Pêssego com Morango"],
      extraCost: 15,
      extraCostCopao: 0,
      maxQuantity: 1
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
      maxQuantity: 1
    }
  ];
  
  const getTotalCanCount = () => {
    if (productType === 'copao') return 0; // Not needed for copao since individual limits are enforced
    
    const redBullCount = selections['Red Bull'] 
      ? Object.values(selections['Red Bull']).reduce((sum, qty) => sum + qty, 0) 
      : 0;
    
    const monsterCount = selections['Monster'] 
      ? Object.values(selections['Monster']).reduce((sum, qty) => sum + qty, 0) 
      : 0;
    
    return redBullCount + monsterCount;
  };
  
  const handleAddEnergyDrink = (type: string, flavor: string) => {
    const option = energyDrinkOptions.find(opt => opt.name === type);
    if (!option) return;

    // Check if trying to add Baly/Traditional while having Red Bull or vice versa
    const hasRedBull = selections['Red Bull'] && Object.values(selections['Red Bull']).some(qty => qty > 0);
    const hasMonster = selections['Monster'] && Object.values(selections['Monster']).some(qty => qty > 0);
    const hasTraditional = selections['Energético Tradicional'] && Object.values(selections['Energético Tradicional']).some(qty => qty > 0);
    const hasBaly = selections['Baly'] && Object.values(selections['Baly']).some(qty => qty > 0);

    const isAddingRedBullOrMonster = type === 'Red Bull' || type === 'Monster';
    const isAddingBalyOrTraditional = type === 'Baly' || type === 'Energético Tradicional';

    if (isAddingRedBullOrMonster && (hasTraditional || hasBaly)) {
      setSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections['Energético Tradicional'];
        delete newSelections['Baly'];
        return {
          ...newSelections,
          [type]: {
            ...prev[type],
            [flavor]: (prev[type]?.[flavor] || 0) + 1
          }
        };
      });
      
      toast({
        title: "Seleção atualizada",
        description: "Energético Tradicional e Baly foram removidos para permitir a seleção de Red Bull/Monster.",
        variant: "default",
      });
      return;
    }

    if (isAddingBalyOrTraditional && (hasRedBull || hasMonster)) {
      setSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections['Red Bull'];
        delete newSelections['Monster'];
        return {
          ...newSelections,
          [type]: {
            ...prev[type],
            [flavor]: (prev[type]?.[flavor] || 0) + 1
          }
        };
      });
      
      toast({
        title: "Seleção atualizada",
        description: "Red Bull e Monster foram removidos para permitir a seleção de Tradicional/Baly.",
        variant: "default",
      });
      return;
    }

    // Check total can limit only for combos
    if (productType === 'combo' && (type === 'Red Bull' || type === 'Monster') && getTotalCanCount() >= 5) {
      toast({
        title: "Limite atingido",
        description: "Você pode selecionar no máximo 5 latas no total (RedBull + Monster combinados).",
        variant: "destructive",
      });
      return;
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
    
    onConfirm({ selections: energyDrinkSelections, totalExtraCost });
    setSelections({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            Qual energético acompanha o {productType === 'copao' ? 'copão' : 'combo'}?
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Selecione os energéticos desejados (máx. 5 latas no total para Red Bull e Monster, 1 para os demais)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {energyDrinkOptions.map((option) => {
            const extraCost = productType === 'copao' 
              ? (option.extraCostCopao !== undefined ? option.extraCostCopao : option.extraCost)
              : option.extraCost;
              
            return (
              <div key={option.name} className="bg-gray-800/50 rounded-lg p-2">
                <h3 className="text-purple-light font-semibold mb-1 flex items-center gap-2 text-sm">
                  🔹 {option.name}
                  {extraCost > 0 && (
                    <span className="text-xs text-gray-300">(+R${extraCost.toFixed(2)})</span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {option.flavors.map((flavor) => {
                    const quantity = selections[option.name]?.[flavor] || 0;
                    return (
                      <div
                        key={`${option.name}-${flavor}`}
                        className="flex items-center justify-between px-2 py-1 rounded bg-gray-700/50 text-white"
                      >
                        <span>• {flavor}</span>
                        <div className="flex items-center gap-2">
                          {quantity > 0 && (
                            <>
                              <button
                                onClick={() => handleRemoveEnergyDrink(option.name, flavor)}
                                className="p-1 hover:bg-purple-dark/50 rounded"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="min-w-[20px] text-center">{quantity}</span>
                            </>
                          )}
                          <button
                            onClick={() => handleAddEnergyDrink(option.name, flavor)}
                            className="p-1 hover:bg-purple-dark/50 rounded"
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
        
        <div className="mt-4">
          <Button 
            onClick={handleConfirm}
            className="w-full bg-purple-dark hover:bg-purple-600"
          >
            Confirmar Seleção
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnergyDrinkSelectionModal;
