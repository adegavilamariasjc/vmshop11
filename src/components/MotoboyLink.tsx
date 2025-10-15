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
      <Button
        onClick={() => setShowLoginModal(true)}
        className="fixed top-4 right-20 bg-purple-600 hover:bg-purple-700 text-white font-bold z-50 shadow-lg rounded-full p-3 h-12 w-12"
        size="icon"
      >
        <Bike className="h-5 w-5" />
      </Button>

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
