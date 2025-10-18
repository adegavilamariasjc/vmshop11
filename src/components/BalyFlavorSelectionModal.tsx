
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
        className="bg-gray-900 border border-purple-dark/50 rounded-lg p-4 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white">
            Escolha o sabor do Baly 2L
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={18} />
          </button>
        </div>
        
        <h3 className="text-purple-light font-semibold mb-3 text-sm">{product.name}</h3>
        
        <RadioGroup
          className="space-y-2 mb-3"
          value={selectedFlavor}
          onValueChange={setSelectedFlavor}
        >
          {BALY_FLAVORS.map(flavor => (
            <div key={flavor} className="flex items-center space-x-2 bg-gray-800/90 hover:bg-gray-700 rounded-md p-2">
              <RadioGroupItem value={flavor} id={`baly-${flavor}`} className="text-purple-light" />
              <label htmlFor={`baly-${flavor}`} className="text-white text-sm cursor-pointer flex-1">
                {flavor}
              </label>
            </div>
          ))}
        </RadioGroup>
        
        <div className="flex gap-2 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium"
          >
            Cancelar
          </button>
          
          <button 
            onClick={() => onConfirm(selectedFlavor)}
            className={`px-4 py-2 rounded text-sm font-bold ${
              !selectedFlavor 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
            }`}
            disabled={!selectedFlavor}
          >
            Confirmar Seleção
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BalyFlavorSelectionModal;
