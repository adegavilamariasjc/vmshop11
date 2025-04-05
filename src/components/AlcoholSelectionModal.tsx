
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Product, AlcoholOption } from '../types';
import { alcoholOptions } from '../data/ice-and-alcohol';

interface AlcoholSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedAlcohol: AlcoholOption | null;
  setSelectedAlcohol: (alcohol: AlcoholOption) => void;
  onConfirm: () => void;
}

const AlcoholSelectionModal: React.FC<AlcoholSelectionModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedAlcohol,
  setSelectedAlcohol,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;
  
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
            Escolha o tipo de álcool para:
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <h3 className="text-purple-light font-semibold mb-4">{product.name}</h3>
        
        <div className="space-y-3 mb-5">
          {alcoholOptions.map((option) => (
            <div 
              key={option.name} 
              className={`flex items-center justify-between rounded-md p-3 cursor-pointer ${
                selectedAlcohol?.name === option.name 
                  ? 'bg-purple-dark' 
                  : 'bg-gray-800'
              }`}
              onClick={() => setSelectedAlcohol(option)}
            >
              <span className="text-white">
                {option.name}
              </span>
              {option.extraCost > 0 && (
                <span className="text-sm text-gray-300">
                  +R$ {option.extraCost.toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded"
          >
            Cancelar
          </button>
          
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${
              !selectedAlcohol 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-purple-dark text-white'
            }`}
            disabled={!selectedAlcohol}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AlcoholSelectionModal;
