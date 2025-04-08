
import React from 'react';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, deliveryFee, total }) => {
  return (
    <div className="border border-gray-600 rounded-lg p-4 bg-black/50 mt-4">
      <div className="flex justify-between mb-2">
        <span className="text-white">Subtotal:</span>
        <span className="text-white">R$ {subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-white">Taxa de entrega:</span>
        <span className="text-white">R$ {deliveryFee.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg">
        <span className="text-white">Total:</span>
        <span className="text-purple-light">R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CartSummary;
