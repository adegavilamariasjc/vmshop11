
import React from 'react';
import { Button } from '@/components/ui/button';

const CheckoutButton: React.FC = () => {
  return (
    <Button
      type="submit"
      className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-bold"
    >
      Enviar Pedido via WhatsApp
    </Button>
  );
};

export default CheckoutButton;
