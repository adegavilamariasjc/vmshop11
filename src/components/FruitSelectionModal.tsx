
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Product } from '../types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface FruitOption {
  name: string;
  selected: boolean;
}

interface FruitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isCombo: boolean; // Se é combo (múltiplas frutas) ou copão (uma fruta)
  onConfirm: (selectedFruits: string[], extraCost: number) => void;
}

const FruitSelectionModal: React.FC<FruitSelectionModalProps> = ({
  isOpen,
  onClose,
  product,
  isCombo,
  onConfirm,
}) => {
  const [selectedFruits, setSelectedFruits] = useState<FruitOption[]>([
    { name: "Morango", selected: false },
    { name: "Laranja", selected: false },
    { name: "Limão", selected: false }
  ]);
  const [singleFruit, setSingleFruit] = useState<string | null>(null);
  const [addFruits, setAddFruits] = useState(true); // Default to true to show the fruit options

  if (!isOpen || !product) return null;

  const handleFruitToggle = (index: number) => {
    const newFruits = [...selectedFruits];
    newFruits[index].selected = !newFruits[index].selected;
    setSelectedFruits(newFruits);
  };

  const handleConfirm = () => {
    if (isCombo) {
      // Para combos: porções de frutas por R$15
      const selectedFruitNames = selectedFruits
        .filter(fruit => fruit.selected)
        .map(fruit => fruit.name);
      
      if (selectedFruitNames.length > 0) {
        onConfirm(selectedFruitNames, 15.00);
      } else {
        onConfirm([], 0);
      }
    } else {
      // Para copão: frutas por R$5 (independentemente de quantas)
      const selectedFruitNames = selectedFruits
        .filter(fruit => fruit.selected)
        .map(fruit => fruit.name);
      
      if (selectedFruitNames.length > 0) {
        onConfirm(selectedFruitNames, 5.00);
      } else {
        onConfirm([], 0);
      }
    }
    
    // Resetar estado
    setSelectedFruits(selectedFruits.map(fruit => ({ ...fruit, selected: false })));
    setSingleFruit(null);
    onClose();
  };

  const selectedCount = selectedFruits.filter(fruit => fruit.selected).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-gray-900 rounded-lg p-5 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">
            {isCombo ? "Adicionar porção de frutas" : "Adicionar frutas"}
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <h3 className="text-purple-light font-semibold mb-4">{product.name}</h3>
        
        {isCombo ? (
          <div className="space-y-4 mb-5">
            <p className="text-white">
              Deseja adicionar uma porção de frutas picadas por R$ 15,00?
            </p>
            
            <div className="space-y-3">
              {selectedFruits.map((fruit, index) => (
                <div key={fruit.name} className="flex items-center space-x-2 bg-gray-800 rounded-md p-3">
                  <Checkbox 
                    id={`fruit-${index}`} 
                    checked={fruit.selected}
                    onCheckedChange={() => handleFruitToggle(index)}
                  />
                  <Label htmlFor={`fruit-${index}`} className="text-white cursor-pointer flex-grow">
                    {fruit.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-5">
            <p className="text-white">
              Deseja adicionar frutas por R$ 5,00?
            </p>
            
            <div className="space-y-3">
              {selectedFruits.map((fruit, index) => (
                <div key={fruit.name} className="flex items-center space-x-2 bg-gray-800 rounded-md p-3">
                  <Checkbox 
                    id={`copao-fruit-${index}`} 
                    checked={fruit.selected}
                    onCheckedChange={() => handleFruitToggle(index)}
                  />
                  <Label htmlFor={`copao-fruit-${index}`} className="text-white cursor-pointer flex-grow">
                    {fruit.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => onConfirm([], 0)} // Skip fruit selection
            className="px-4 py-2 bg-gray-700 text-white rounded"
          >
            Sem Frutas
          </button>
          
          <button 
            onClick={handleConfirm}
            className={`px-4 py-2 rounded bg-purple-dark text-white ${
              selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={selectedCount === 0}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FruitSelectionModal;
