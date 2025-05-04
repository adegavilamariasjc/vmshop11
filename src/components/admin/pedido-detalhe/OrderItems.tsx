
import React from 'react';

interface OrderItem {
  qty: number;
  name: string;
  price: number;
  category?: string;
  alcohol?: string;
  balyFlavor?: string;
  ice?: Record<string, number>;
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
  
  // Filter out any items with zero quantity
  const validItems = items.filter(item => item.qty > 0);
  
  return (
    <div className="items">
      <h3><strong>ITENS DO PEDIDO</strong></h3>
      {validItems.map((item, index) => (
        <div key={index} className="item">
          <div>
            {item.qty}x {getFullProductName(item)} 
            {item.alcohol ? ` (${item.alcohol})` : ""}
            {item.balyFlavor ? ` (Baly: ${item.balyFlavor})` : ""}
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
            R$ {(item.price * item.qty).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItems;
