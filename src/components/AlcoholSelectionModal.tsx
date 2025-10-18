
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Product, AlcoholOption } from '../types';
import { alcoholOptions } from '../data/products';

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
            Escolha o tipo de álcool
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={18} />
          </button>
        </div>
        
        <h3 className="text-purple-light font-semibold mb-3 text-sm">{product.name}</h3>
        
        <div className="space-y-2 mb-3">
          {alcoholOptions.map((option) => (
            <div 
              key={option.name} 
              className={`flex items-center justify-between rounded-md p-2 cursor-pointer transition-colors ${
                selectedAlcohol?.name === option.name 
                  ? 'bg-purple-600 shadow-md' 
                  : 'bg-gray-800/90 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedAlcohol(option)}
            >
              <span className="text-white text-sm">
                {option.name}
              </span>
              {option.extraCost > 0 && (
                <span className="text-xs text-gray-300 font-semibold">
                  +R$ {option.extraCost.toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium"
          >
            Cancelar
          </button>
          
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-sm font-bold ${
              !selectedAlcohol 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
            }`}
            disabled={!selectedAlcohol}
          >
            Confirmar Seleção
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AlcoholSelectionModal;
