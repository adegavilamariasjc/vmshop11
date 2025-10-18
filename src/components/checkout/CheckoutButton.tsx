
import React from 'react';
import { Button } from '@/components/ui/button';

const CheckoutButton: React.FC = () => {
  return (
    <Button
      type="submit"
      variant="purple"
      className="w-full h-12"
    >
      Enviar Pedido via WhatsApp
    </Button>
  );
};

export default CheckoutButton;
