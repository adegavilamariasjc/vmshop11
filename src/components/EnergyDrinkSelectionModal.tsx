
import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EnergyDrinkOption {
  name: string;
  flavors: string[];
  extraCost: number;
}

interface EnergyDrinkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (energyDrink: { type: string; flavor: string; extraCost: number }) => void;
}

const energyDrinkOptions: EnergyDrinkOption[] = [
  {
    name: "Energético Tradicional",
    flavors: ["Tradicional"],
    extraCost: 0
  },
  {
    name: "Baly",
    flavors: ["Melancia", "Tropical", "Maçã Verde", "Pêssego com Morango"],
    extraCost: 15
  },
  {
    name: "Red Bull",
    flavors: ["Tradicional", "Melancia com Melão", "Pomelo", "Tropical", "Frutas Tropicais", "Pêssego", "Pera com Canela"],
    extraCost: 60
  },
  {
    name: "Monster",
    flavors: ["Tradicional", "Mango Loco", "Melancia"],
    extraCost: 60
  },
  {
    name: "Fusion",
    flavors: ["Fusion (1 litro)"],
    extraCost: 15
  }
];

const EnergyDrinkSelectionModal: React.FC<EnergyDrinkSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            Qual energético acompanha o combo?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {energyDrinkOptions.map((option) => (
            <div key={option.name} className="bg-gray-800/50 rounded-lg p-2">
              <h3 className="text-purple-light font-semibold mb-1 flex items-center gap-2 text-sm">
                🔹 {option.name}
                {option.extraCost > 0 && (
                  <span className="text-xs text-gray-300">(+R${option.extraCost.toFixed(2)})</span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {option.flavors.map((flavor) => (
                  <button
                    key={`${option.name}-${flavor}`}
                    onClick={() => onConfirm({
                      type: option.name,
                      flavor: flavor,
                      extraCost: option.extraCost
                    })}
                    className="text-left px-2 py-1 rounded bg-gray-700/50 hover:bg-purple-dark/50 text-white transition-colors"
                  >
                    • {flavor}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnergyDrinkSelectionModal;
