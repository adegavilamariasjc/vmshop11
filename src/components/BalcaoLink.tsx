import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import BalcaoModal from './BalcaoModal';

const BalcaoLink: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-16 bg-green-600/70 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        title="Pedidos de Balcão"
      >
        <ShoppingBag size={16} />
      </button>
      
      <BalcaoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default BalcaoLink;
