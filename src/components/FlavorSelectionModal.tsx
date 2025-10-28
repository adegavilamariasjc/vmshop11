
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, X } from 'lucide-react';
import { Product } from '../types';
import { iceFlavors, getMaxIce } from '../data/products';
import { useToast } from '@/hooks/use-toast';
import { normalizeText } from '@/lib/utils';

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Reset submitting state when modal opens/closes
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  if (!isOpen || !product) return null;
  
  const maxIce = getMaxIce(product.category || '');
  const totalIce = Object.values(selectedIce).reduce((sum, v) => sum + v, 0);
  const waterIceQuantity = selectedIce['Gelo de Água'] || 0;
  const hasOtherIceSelected = Object.entries(selectedIce)
    .some(([flavor, qty]) => flavor !== 'Gelo de Água' && qty > 0);

  const isCopao = normalizeText(product.category || '').includes('copao');
  const isCombo = normalizeText(product.category || '').includes('combo');
  
  const handleIceUpdate = (flavor: string, delta: number) => {
    // COPÃO: só pode escolher 1 gelo no total
    if (isCopao && delta > 0 && totalIce >= 1) {
      toast({
        title: "Limite atingido",
        description: "Para copão, você pode selecionar apenas 1 gelo.",
        variant: "destructive",
      });
      return;
    }
    
    // Se está tentando adicionar gelo de água e já tem outros gelos
    if (flavor === 'Gelo de Água' && delta > 0 && hasOtherIceSelected) {
      toast({
        title: "Seleção não permitida",
        description: "Não é possível selecionar gelo de água quando outros tipos já foram selecionados.",
        variant: "destructive",
      });
      return;
    }
    
    // Se está tentando adicionar outro tipo de gelo e já tem 5 gelos de água
    if (flavor !== 'Gelo de Água' && delta > 0 && waterIceQuantity === 5) {
      toast({
        title: "Seleção não permitida",
        description: "Você já selecionou 5 gelos de água (1 saco grande). Não é possível adicionar outros tipos.",
        variant: "destructive",
      });
      return;
    }
    
    // Se está tentando adicionar gelo de água além do limite de 5
    if (flavor === 'Gelo de Água' && waterIceQuantity + delta > 5) {
      toast({
        title: "Limite atingido",
        description: "O máximo permitido é 5 gelos de água (1 saco grande).",
        variant: "destructive",
      });
      return;
    }
    
    updateIceQuantity(flavor, delta);
  };
  
  const handleConfirm = () => {
    if (totalIce === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, selecione ao menos 1 unidade de gelo.",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Call onConfirm with a slight delay to prevent race conditions
    setTimeout(() => {
      onConfirm();
    }, 100);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[80]"
      onClick={() => !isSubmitting && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-gray-900 border border-white/20 rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white">
            Escolha o(s) sabor(es) de gelo
          </h2>
          <button 
            onClick={() => !isSubmitting && onClose()} 
            className="text-gray-300 hover:text-white"
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>
        
        <h3 className="text-purple-light font-semibold mb-3 text-sm">{product.name}</h3>
        
        <div className="space-y-2 mb-3">
          {iceFlavors.map(flavor => (
            <div key={flavor} className="flex items-center justify-between bg-gray-800/90 rounded-md p-2">
              <span className="text-white text-sm">{flavor}</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => !isSubmitting && handleIceUpdate(flavor, -1)}
                  className="w-7 h-7 flex items-center justify-center bg-gray-700 text-white rounded-full hover:bg-gray-600"
                  disabled={!selectedIce[flavor] || isSubmitting}
                >
                  <Minus size={14} />
                </button>
                
                <span className="text-white w-4 text-center text-sm font-semibold">
                  {selectedIce[flavor] || 0}
                </span>
                
                <button
                  onClick={() => !isSubmitting && handleIceUpdate(flavor, 1)}
                  className="w-7 h-7 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-500"
                  disabled={
                    isSubmitting ||
                    (flavor === 'Gelo de Água' && waterIceQuantity >= 5) ||
                    (flavor !== 'Gelo de Água' && waterIceQuantity === 5) ||
                    (flavor === 'Gelo de Água' && hasOtherIceSelected) ||
                    totalIce >= maxIce
                  }
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-300 mb-3 bg-gray-800/50 p-2 rounded">
          <div className="font-semibold">Total: {totalIce} de {maxIce} unidades</div>
          {normalizeText(product?.category).includes('copao') && (
            <div className="mt-1 text-purple-light">
              ⚠️ Copão: apenas 1 gelo
            </div>
          )}
          {normalizeText(product?.category).includes('combo') && (
            <div className="mt-1 text-purple-light">
              ⚠️ Combo: exatamente 5 gelos
            </div>
          )}
          {waterIceQuantity === 5 && (
            <div className="mt-1 text-green-400">
              ✓ 5 gelos de água = 1 saco grande
            </div>
          )}
        </div>
        
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => !isSubmitting && onClose()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleConfirm}
            className={`px-4 py-2 rounded text-sm font-bold ${
              totalIce === 0 || isSubmitting || 
              (normalizeText(product?.category).includes('copao') && totalIce !== 1) ||
              (normalizeText(product?.category).includes('combo') && totalIce !== 5)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
            }`}
            disabled={
              totalIce === 0 || 
              isSubmitting || 
              (normalizeText(product?.category).includes('copao') && totalIce !== 1) ||
              (normalizeText(product?.category).includes('combo') && totalIce !== 5)
            }
          >
            {isSubmitting ? 'Processando...' : 'Confirmar Seleção'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlavorSelectionModal;
