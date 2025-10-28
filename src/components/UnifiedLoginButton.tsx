import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import UnifiedLoginModal from './UnifiedLoginModal';

const UnifiedLoginButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-16 left-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full shadow-lg border border-white/20 transition-all duration-200 z-50"
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
