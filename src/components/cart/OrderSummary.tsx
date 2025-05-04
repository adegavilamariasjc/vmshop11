import React from 'react';
import { Bairro, Product } from '../../types';
import CartItem from './CartItem';

interface OrderSummaryProps {
  cart: Product[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart }) => {
  // Filter out any items with zero quantity
  const validItems = cart.filter(item => item.qty && item.qty > 0);
  
  // Group identical items for display
  const groupedItems = validItems.reduce((acc: Product[], item: Product) => {
    // For customizable products (with ice/energy drinks/specific configurations),
    // keep them as individual items
    if (item.ice || item.energyDrinks || item.energyDrink || 
        (item.name && item.name.toLowerCase().includes('copão')) || 
        (item.category && item.category.toLowerCase().includes('combo'))) {
      acc.push(item);
      return acc;
    }
    
    // For simple products, combine quantities if they are identical
    const existingItem = acc.find(i => 
      i.name === item.name && 
      i.category === item.category && 
      i.alcohol === item.alcohol && 
      i.balyFlavor === item.balyFlavor
    );
    
    if (existingItem) {
      existingItem.qty = (existingItem.qty || 1) + (item.qty || 1);
    } else {
      acc.push({...item});
    }
    
    return acc;
  }, []);
  
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
