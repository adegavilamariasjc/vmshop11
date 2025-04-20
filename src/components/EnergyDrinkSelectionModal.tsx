
import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EnergyDrinkOption {
  name: string;
  flavors: string[];
  extraCost: number;
  extraCostCopao?: number;
}

interface EnergyDrinkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (energyDrink: { type: string; flavor: string; extraCost: number }) => void;
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
  console.log("EnergyDrinkSelectionModal rendered, isOpen:", isOpen, "productType:", productType);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            Qual energético acompanha o {productType === 'copao' ? 'copão' : 'combo'}?
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Selecione o tipo e o sabor do energético
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {energyDrinkOptions.map((option) => {
            // Determine the correct extra cost based on product type
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
                  {option.flavors.map((flavor) => (
                    <button
                      key={`${option.name}-${flavor}`}
                      onClick={() => onConfirm({
                        type: option.name,
                        flavor: flavor,
                        extraCost: extraCost
                      })}
                      className="text-left px-2 py-1 rounded bg-gray-700/50 hover:bg-purple-dark/50 text-white transition-colors"
                    >
                      • {flavor}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnergyDrinkSelectionModal;
