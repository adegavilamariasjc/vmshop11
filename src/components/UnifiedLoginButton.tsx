import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import UnifiedLoginModal from './UnifiedLoginModal';

const UnifiedLoginButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-16 left-4 bg-purple-dark/70 hover:bg-purple-dark text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
        title="Acessar Sistema"
      >
        <Settings size={16} />
      </button>

      <UnifiedLoginModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default UnifiedLoginButton;
