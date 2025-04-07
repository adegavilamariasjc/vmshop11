
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, X } from 'lucide-react';
import { Product } from '../types';
import { iceFlavors, getMaxIce } from '../data/products';

interface FlavorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedIce: Record<string, number>;
  updateIceQuantity: (flavor: string, delta: number) => void;
  onConfirm: () => void;
}

const FlavorSelectionModal: React.FC<FlavorSelectionModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedIce,
  updateIceQuantity,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;
  
  const maxIce = getMaxIce(product.category || '');
  const totalIce = Object.values(selectedIce).reduce((sum, v) => sum + v, 0);
  
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
            Escolha o(s) sabor(es) de gelo para:
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <h3 className="text-purple-light font-semibold mb-4">{product.name}</h3>
        
        <div className="space-y-3 mb-5">
          {iceFlavors.map(flavor => (
            <div key={flavor} className="flex items-center justify-between bg-gray-800 rounded-md p-3">
              <span className="text-white">{flavor}</span>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateIceQuantity(flavor, -1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-700 text-white rounded-full"
                  disabled={!selectedIce[flavor]}
                >
                  <Minus size={16} />
                </button>
                
                <span className="text-white w-5 text-center">
                  {selectedIce[flavor] || 0}
                </span>
                
                <button
                  onClick={() => updateIceQuantity(flavor, 1)}
                  className="w-8 h-8 flex items-center justify-center bg-purple-dark text-white rounded-full"
                  disabled={totalIce >= maxIce}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-sm text-gray-300 mb-4">
          Total selecionado: {totalIce} de {maxIce} unidades
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
              totalIce === 0 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-purple-dark text-white'
            }`}
            disabled={totalIce === 0}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlavorSelectionModal;
