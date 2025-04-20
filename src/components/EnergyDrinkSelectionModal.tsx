
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
}

interface EnergyDrinkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (energyDrink: { selections: Array<{ type: string; flavor: string }>, totalExtraCost: number }) => void;
  productType?: 'copao' | 'combo';
}

const energyDrinkOptions: EnergyDrinkOption[] = [
  {
    name: "Energético Tradicional",
    flavors: ["Tradicional"],
    extraCost: 0,
    extraCostCopao: 0
  },
  {
    name: "Baly",
    flavors: ["Melancia", "Tropical", "Maçã Verde", "Pêssego com Morango"],
    extraCost: 15,
    extraCostCopao: 0
  },
  {
    name: "Red Bull",
    flavors: ["Tradicional", "Melancia com Melão", "Pomelo", "Tropical", "Frutas Tropicais", "Pêssego", "Pera com Canela"],
    extraCost: 60,
    extraCostCopao: 12
  },
  {
    name: "Monster",
    flavors: ["Tradicional", "Mango Loco", "Melancia"],
    extraCost: 60,
    extraCostCopao: 12
  },
  {
    name: "Fusion",
    flavors: ["Fusion (1 litro)"],
    extraCost: 15,
    extraCostCopao: 10
  }
];

const EnergyDrinkSelectionModal: React.FC<EnergyDrinkSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productType = 'combo'
}) => {
  const { toast } = useToast();
  const [selections, setSelections] = useState<Record<string, Record<string, number>>>({});
  
  const handleAddEnergyDrink = (type: string, flavor: string) => {
    const currentTotal = Object.values(selections).reduce((sum, typeSelections) => 
      sum + Object.values(typeSelections).reduce((a, b) => a + b, 0), 0);
      
    if (currentTotal >= 5) {
      toast({
        title: "Limite atingido",
        description: "Você pode selecionar no máximo 5 energéticos.",
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
      
      // Remove empty entries
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
            Selecione até 5 energéticos
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
