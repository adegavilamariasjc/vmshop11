
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-black/80 border border-white/20 rounded-lg p-5 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">
            Qual energético deseja adicionar?
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {energyDrinkOptions.map((option) => (
            <div key={option.name} className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-purple-light font-semibold mb-2 flex items-center gap-2">
                🔹 {option.name}
                {option.extraCost > 0 && (
                  <span className="text-sm text-gray-300">(+R${option.extraCost.toFixed(2)})</span>
                )}
              </h3>
              <div className="grid gap-2">
                {option.flavors.map((flavor) => (
                  <button
                    key={`${option.name}-${flavor}`}
                    onClick={() => onConfirm({
                      type: option.name,
                      flavor: flavor,
                      extraCost: option.extraCost
                    })}
                    className="text-left px-3 py-2 rounded bg-gray-700/50 hover:bg-purple-dark/50 text-white transition-colors"
                  >
                    • {flavor}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnergyDrinkSelectionModal;
