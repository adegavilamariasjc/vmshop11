
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
  
  // Create a separate display for each individual item rather than grouping them
  const expandItemsIndividually = () => {
    const expandedItems: OrderItem[] = [];
    
    items.forEach(item => {
      // For items with quantity > 1, create individual items
      for (let i = 0; i < item.qty; i++) {
        expandedItems.push({
          ...item,
          qty: 1 // Each individual item has qty of 1
        });
      }
    });
    
    return expandedItems;
  };
  
  // Get the expanded list of individual items
  const individualItems = expandItemsIndividually();

  return (
    <div className="items">
      <h3><strong>ITENS DO PEDIDO</strong></h3>
      {individualItems.map((item, index) => (
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
            R$ {(item.price).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItems;
