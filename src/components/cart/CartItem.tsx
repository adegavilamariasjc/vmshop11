
import React from 'react';
import { Product } from '../../types';

interface CartItemProps {
  item: Product;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  // Return null if the quantity is zero
  if (!item.qty || item.qty <= 0) {
    return null;
  }

  // Function to get the full product name for certain categories
  const getFullProductName = (product: Product) => {
    if (product.category?.toLowerCase() === 'batidas' && !product.name.toLowerCase().includes('batida de')) {
      return `Batida de ${product.name}`;
    }
    return product.name;
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between">
        <span className="text-white text-shadow-dark">
          {item.qty}x {getFullProductName(item)} 
          {item.alcohol ? ` (${item.alcohol})` : ""}
          {item.balyFlavor ? ` (Baly: ${item.balyFlavor})` : ""}
        </span>
        <span className="text-white font-semibold text-shadow-dark">
          R$ {((item.price || 0) * (item.qty || 0)).toFixed(2)}
        </span>
      </div>
      
      {item.ice && Object.entries(item.ice).some(([_, qty]) => qty > 0) && (
        <div className="text-sm text-gray-300 text-shadow-light ml-3">
          Gelo: {Object.entries(item.ice)
            .filter(([_, qty]) => qty > 0)
            .map(([flavor, qty]) => `${flavor} x${qty}`)
            .join(", ")}
        </div>
      )}
      
      {item.energyDrinks && item.energyDrinks.length > 0 && (
        <div className="text-sm text-gray-300 text-shadow-light ml-3">
          Energéticos: {item.energyDrinks.map(ed => 
            `${ed.type}${ed.flavor !== 'Tradicional' ? ` - ${ed.flavor}` : ''}`
          ).join(", ")}
        </div>
      )}
    </div>
  );
};

export default CartItem;
