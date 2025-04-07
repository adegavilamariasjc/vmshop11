
import React from 'react';
import { Bairro } from '../../types';

interface OrderSummaryProps {
  subtotal: number;
  bairro: Bairro;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ subtotal, bairro, total }) => {
  return (
    <div className="border-t border-gray-600 pt-3 mt-4">
      <div className="flex justify-between mb-2">
        <span className="text-white">Subtotal:</span>
        <span className="text-white">R$ {subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-white">Taxa de entrega ({bairro.nome}):</span>
        <span className="text-white">R$ {bairro.taxa.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg">
        <span className="text-white">Total:</span>
        <span className="text-purple-light">R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
