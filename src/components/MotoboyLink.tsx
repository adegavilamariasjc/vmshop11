import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bike } from 'lucide-react';
import MotoboyLoginModal from './MotoboyLoginModal';
import MotoboyPedidosListModal from './MotoboyPedidosListModal';

const MotoboyLink = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPedidosModal, setShowPedidosModal] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setShowPedidosModal(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowPedidosModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowLoginModal(true)}
        className="fixed bottom-4 left-16 bg-purple-dark/70 hover:bg-purple-dark text-white p-3 rounded-full shadow-lg transition-all duration-200"
        title="Área de Entregas"
      >
        <Bike size={16} />
      </button>

      <MotoboyLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <MotoboyPedidosListModal
        isOpen={showPedidosModal}
        onClose={handleLogout}
      />
    </>
  );
};

export default MotoboyLink;
