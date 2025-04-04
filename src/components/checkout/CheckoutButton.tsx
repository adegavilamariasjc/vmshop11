
import React from 'react';

const CheckoutButton: React.FC = () => {
  return (
    <button
      type="submit"
      className="w-full p-3 bg-purple-dark hover:bg-purple text-white rounded-md font-bold"
    >
      Enviar Pedido via WhatsApp
    </button>
  );
};

export default CheckoutButton;
