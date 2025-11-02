
import React from 'react';
import { Product } from '../../types';
import { calculateBeerDiscount } from '../../utils/discountUtils';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface CartItemProps {
  item: Product;
  onUpdateQuantity?: (item: Product, delta: number) => void;
  onRemoveItem?: (item: Product) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  // Function to get the full product name for certain categories
  const getFullProductName = (product: Product) => {
    if (product.category?.toLowerCase() === 'batidas' && !product.name.toLowerCase().includes('batida de')) {
      return `Batida de ${product.name}`;
    }
    return product.name;
  };

  const discountInfo = calculateBeerDiscount(item);
  const isEditable = !!onUpdateQuantity && !!onRemoveItem;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <span className="text-white text-shadow-dark">
            {item.qty || 1}x {getFullProductName(item)} 
            {item.alcohol ? ` (${item.alcohol})` : ""}
            {item.balyFlavor ? ` (Baly: ${item.balyFlavor})` : ""}
            {discountInfo.hasDiscount ? ` (-${discountInfo.discountPercentage}%)` : ""}
          </span>
        </div>
        
        {isEditable && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item, -1)}
              disabled={(item.qty || 1) <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item, 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onRemoveItem(item)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <span className="text-white font-semibold text-shadow-dark whitespace-nowrap">
          R$ {discountInfo.hasDiscount 
            ? discountInfo.discountedPrice.toFixed(2) 
            : ((item.price || 0) * (item.qty || 1)).toFixed(2)}
        </span>
      </div>
      
      {discountInfo.hasDiscount && (
        <div className="text-sm text-green-400 text-shadow-light ml-3">
          Desconto aplicado: {discountInfo.discountedUnits} unidades com 10% off
        </div>
      )}
      
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
