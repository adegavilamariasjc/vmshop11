
import React from 'react';
import { Bairro, Product } from '../../types';
import CartItem from './CartItem';

interface OrderSummaryProps {
  cart: Product[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart }) => {
  // Filtrar itens com quantidade zero ou menor
  const filteredCart = cart.filter(item => (item.qty || 0) > 0);
  
  return (
    <div className="border border-gray-600 rounded-lg p-4 bg-black/50 mb-4">
      <h3 className="text-lg font-bold text-purple-light mb-3 border-b border-gray-600 pb-2">
        Resumo do Pedido
      </h3>
      
      {filteredCart.map((item, index) => (
        <CartItem key={index} item={item} />
      ))}
    </div>
  );
};

export default OrderSummary;
