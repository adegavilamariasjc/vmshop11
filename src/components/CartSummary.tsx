
import React from 'react';
import { Product, Bairro } from '../types';

interface CartSummaryProps {
  cart: Product[];
  selectedBairro: Bairro;
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart, selectedBairro }) => {
  const subtotal = cart.reduce((sum, p) => sum + p.price * (p.qty || 1), 0);
  const total = subtotal + selectedBairro.taxa;

  return (
    <div className="border border-gray-600 rounded-lg p-4 bg-black/50 mb-4">
      <h3 className="text-lg font-bold text-purple-light mb-3 border-b border-gray-600 pb-2">
        Resumo do Pedido
      </h3>
      
      {cart.map((item, index) => (
        <div key={index} className="mb-3">
          <div className="flex justify-between">
            <span className="text-white">
              {item.qty || 1}x {item.name} 
              {item.alcohol ? ` (${item.alcohol})` : ""}
            </span>
            <span className="text-white font-semibold">
              R$ {((item.price || 0) * (item.qty || 1)).toFixed(2)}
            </span>
          </div>
          
          {item.ice && Object.entries(item.ice).some(([_, qty]) => qty > 0) && (
            <div className="text-sm text-gray-300 ml-3">
              Gelo: {Object.entries(item.ice)
                .filter(([_, qty]) => qty > 0)
                .map(([flavor, qty]) => `${flavor} x${qty}`)
                .join(", ")}
            </div>
          )}
          
          {item.fruits && item.fruits.length > 0 && (
            <div className="text-sm text-gray-300 ml-3">
              Frutas: {item.fruits.join(", ")}
            </div>
          )}
        </div>
      ))}
      
      <div className="border-t border-gray-600 pt-3 mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-white">Subtotal:</span>
          <span className="text-white">R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-white">Taxa de entrega ({selectedBairro.nome}):</span>
          <span className="text-white">R$ {selectedBairro.taxa.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span className="text-white">Total:</span>
          <span className="text-purple-light">R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
