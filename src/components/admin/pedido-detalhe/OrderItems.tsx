
import React from 'react';

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
  // Function to get the full product name for certain categories
  const getFullProductName = (item: OrderItem) => {
    if (item.category?.toLowerCase() === 'batidas' && !item.name.toLowerCase().includes('batida de')) {
      return `Batida de ${item.name}`;
    }
    return item.name;
  };

  // Function to calculate beer discount
  const calculateBeerDiscount = (item: OrderItem) => {
    if (!item.category?.toLowerCase().includes('cerveja') || !item.qty) {
      return {
        hasDiscount: false,
        discountedPrice: item.price * item.qty,
        discountPercentage: 0,
      };
    }

    const qty = item.qty;
    const discountedUnits = Math.floor(qty / 12) * 12;
    
    if (discountedUnits === 0) {
      return {
        hasDiscount: false,
        discountedPrice: item.price * qty,
        discountPercentage: 0,
      };
    }
    
    const regularUnits = qty % 12;
    const discountPercentage = 10;
    const discountedUnitPrice = item.price * (1 - discountPercentage / 100);
    
    const discountedPrice = 
      (discountedUnits * discountedUnitPrice) + 
      (regularUnits * item.price);
    
    return {
      hasDiscount: true,
      discountedPrice,
      discountPercentage,
    };
  };

  return (
    <div className="items">
      <h3><strong>ITENS DO PEDIDO</strong></h3>
      {items.map((item, index) => {
        const discountInfo = calculateBeerDiscount(item);
        return (
          <div key={index} className="item">
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
            
            <div style={{ textAlign: 'right' }}>
              R$ {discountInfo.hasDiscount
                ? discountInfo.discountedPrice.toFixed(2)
                : (item.price * item.qty).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderItems;
