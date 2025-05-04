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
  energyDrink?: string;
  energyDrinkFlavor?: string;
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
  
  // Group identical items
  const groupedItems = items.reduce((acc: OrderItem[], item: OrderItem) => {
    // Skip items with zero quantity
    if (!item.qty || item.qty <= 0) return acc;
    
    // For customizable products (with ice/energy drinks/specific configurations),
    // keep them as individual items
    if (item.ice || 
        item.energyDrinks || 
        item.energyDrink || 
        item.name.toLowerCase().includes('copão') || 
        (item.category && item.category.toLowerCase().includes('combo'))) {
      acc.push({...item});
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
      existingItem.qty += item.qty;
    } else {
      acc.push({...item});
    }
    
    return acc;
  }, []);
  
  return (
    <div className="items">
      <h3><strong>ITENS DO PEDIDO</strong></h3>
      {groupedItems.map((item, index) => (
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
          
          {item.energyDrinks && item.energyDrinks.length > 0 ? (
            <div style={{ marginLeft: '20px', fontSize: '14px' }}>
              Energéticos: {item.energyDrinks.map(ed => 
                `${ed.type}${ed.flavor !== 'Tradicional' ? ` - ${ed.flavor}` : ''}`
              ).join(", ")}
            </div>
          ) : item.energyDrink ? (
            <div style={{ marginLeft: '20px', fontSize: '14px' }}>
              Energético: {item.energyDrink}{item.energyDrinkFlavor !== 'Tradicional' ? ` - ${item.energyDrinkFlavor}` : ''}
            </div>
          ) : null}
          
          <div style={{ textAlign: 'right' }}>
            R$ {(item.price * item.qty).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItems;
