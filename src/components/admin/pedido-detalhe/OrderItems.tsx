
import React from 'react';
import { calculateBeerDiscount } from '@/utils/discountUtils';

interface OrderItem {
  qty: number;
  name: string;
  price: number;
  category?: string;
  alcohol?: string;
  balyFlavor?: string;
  ice?: Record<string, any>;
  energyDrinks?: Array<{ type: string; flavor: string }>;
}

interface OrderItemsProps {
  items: OrderItem[];
}

const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  // Function to format number safely
  const formatNumber = (value: any): string => {
    if (value === null || value === undefined || value === 'null' || value === 'undefined' || isNaN(value)) {
      return '0.00';
    }
    return Number(value).toFixed(2);
  };

  // Function to get the full product name for certain categories
  const getFullProductName = (item: OrderItem) => {
    if (item.category?.toLowerCase() === 'batidas' && !item.name.toLowerCase().includes('batida de')) {
      return `Batida de ${item.name}`;
    }
    return item.name || 'Produto sem nome';
  };

  return (
    <div className="items">
      <h3><strong>ITENS DO PEDIDO</strong></h3>
      {items.map((item, index) => {
        const discountInfo = calculateBeerDiscount(item);
        return (
          <div key={index} className="item mb-4">
            <div>
              {item.qty}x {getFullProductName(item)} 
              {item.alcohol ? ` (${item.alcohol})` : ""}
              {item.balyFlavor ? ` (Baly: ${item.balyFlavor})` : ""}
              {discountInfo.hasDiscount ? ` (-${discountInfo.discountPercentage}%)` : ""}
            </div>
            
            {item.ice && Object.entries(item.ice).some(([_, qty]: [string, any]) => qty > 0) && (
              <div style={{ marginLeft: '20px', fontSize: '14px' }}>
                Gelo: {Object.entries(item.ice)
                  .filter(([_, qty]: [string, any]) => qty > 0)
                  .map(([flavor, qty]: [string, any]) => `${flavor} x${qty}`)
                  .join(", ")}
              </div>
            )}
            
            {item.energyDrinks && item.energyDrinks.length > 0 && (
              <div style={{ marginLeft: '20px', fontSize: '14px' }}>
                Energéticos: {item.energyDrinks.map(ed => 
                  `${ed.type}${ed.flavor !== 'Tradicional' ? ` - ${ed.flavor}` : ''}`
                ).join(", ")}
              </div>
            )}
            
            <div className="flex flex-col items-end">
              {discountInfo.hasDiscount ? (
                <>
                  <div className="line-through text-gray-400">
                    Valor normal: R$ {formatNumber(item.price * (item.qty || 0))}
                  </div>
                  <div className="font-semibold text-green-400">
                    Com desconto: R$ {formatNumber(discountInfo.discountedPrice)}
                  </div>
                </>
              ) : (
                <div>
                  R$ {formatNumber(item.price * (item.qty || 0))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderItems;
