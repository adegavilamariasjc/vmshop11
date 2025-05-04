
import React from 'react';
import { Product } from '../../types';
import CartItem from './CartItem';
import { groupCartItems } from '@/utils/formatWhatsApp';

interface OrderSummaryProps {
  cart: Product[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart }) => {
  // Group identical items for display using our improved grouping function
  const groupedItems = groupCartItems(cart);
  
  return (
    <div className="border border-gray-600 rounded-lg p-4 bg-black/50 mb-4">
      <h3 className="text-lg font-bold text-purple-light mb-3 border-b border-gray-600 pb-2">
        Resumo do Pedido
      </h3>
      
      {groupedItems.length > 0 ? (
        groupedItems.map((item, index) => (
          <CartItem key={index} item={item} />
        ))
      ) : (
        <div className="text-center text-gray-400 py-2">
          Nenhum item no carrinho
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
