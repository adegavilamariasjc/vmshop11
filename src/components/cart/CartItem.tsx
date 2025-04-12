
import React from 'react';
import { Product } from '../../types';

interface CartItemProps {
  item: Product;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  return (
    <div className="mb-3">
      <div className="flex justify-between">
        <span className="text-white">
          {item.qty || 1}x {item.name} 
          {item.alcohol ? ` (${item.alcohol})` : ""}
          {item.balyFlavor ? ` (Baly: ${item.balyFlavor})` : ""}
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
    </div>
  );
};

export default CartItem;
