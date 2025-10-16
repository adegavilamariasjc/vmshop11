
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Product } from '../types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface BalyFlavorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (flavor: string) => void;
}

const BALY_FLAVORS = [
  'Tropical',
  'Melancia',
  'Maçã Verde',
  'Morango com Pêssego'
];

const BalyFlavorSelectionModal: React.FC<BalyFlavorSelectionModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  
  if (!isOpen || !product) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[80]"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-gray-900 border border-purple-dark/50 rounded-lg p-5 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">
            Escolha o sabor do Baly 2L:
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <h3 className="text-purple-light font-semibold mb-4">{product.name}</h3>
        
        <RadioGroup
          className="space-y-3 mb-5"
          value={selectedFlavor}
          onValueChange={setSelectedFlavor}
        >
          {BALY_FLAVORS.map(flavor => (
            <div key={flavor} className="flex items-center space-x-2 bg-gray-800/90 rounded-md p-3">
              <RadioGroupItem value={flavor} id={`baly-${flavor}`} className="text-purple-light" />
              <label htmlFor={`baly-${flavor}`} className="text-white cursor-pointer flex-1">
                {flavor}
              </label>
            </div>
          ))}
        </RadioGroup>
        
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded"
          >
            Cancelar
          </button>
          
          <button 
            onClick={() => onConfirm(selectedFlavor)}
            className={`px-4 py-2 rounded ${
              !selectedFlavor 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-purple-dark text-white'
            }`}
            disabled={!selectedFlavor}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BalyFlavorSelectionModal;
