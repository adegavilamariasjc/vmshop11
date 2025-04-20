
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogClose 
} from "@/components/ui/dialog";

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
    extraCost: 0
  },
  {
    name: "Red Bull",
    flavors: ["Tradicional", "Melancia com Melão", "Pomelo", "Tropical", "Frutas Tropicais", "Pêssego", "Pera com Canela"],
    extraCost: 10
  },
  {
    name: "Monster",
    flavors: ["Tradicional", "Mango Loco", "Melancia"],
    extraCost: 10
  },
  {
    name: "Fusion",
    flavors: ["Fusion"],
    extraCost: 10
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
            Qual energético deseja adicionar?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {energyDrinkOptions.map((option) => (
            <div key={option.name} className="bg-gray-800/50 rounded-lg p-3">
              <h3 className="text-purple-light font-semibold mb-2 flex items-center gap-2">
                🔹 {option.name}
                {option.extraCost > 0 && (
                  <span className="text-sm text-gray-300">(+R${option.extraCost.toFixed(2)})</span>
                )}
              </h3>
              <div className="grid gap-1">
                {option.flavors.map((flavor) => (
                  <button
                    key={`${option.name}-${flavor}`}
                    onClick={() => onConfirm({
                      type: option.name,
                      flavor: flavor,
                      extraCost: option.extraCost
                    })}
                    className="text-left px-3 py-1.5 rounded bg-gray-700/50 hover:bg-purple-dark/50 text-white transition-colors text-sm"
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
