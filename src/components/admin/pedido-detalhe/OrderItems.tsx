
import React from 'react';
import { getFullProductName, groupCartItems } from '@/utils/formatWhatsApp';

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
  items: OrderItem[] | string;
}

const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  // Garantir que items é um array
  const itemsArray = React.useMemo(() => {
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try {
        return JSON.parse(items);
      } catch (e) {
        console.error("Error parsing items:", e);
        return [];
      }
    }
    return [];
  }, [items]);
  
  // Use the improved groupCartItems function
  const groupedItems = groupCartItems(itemsArray);
  
  return (
    <div className="items">
      <h3><strong>ITENS DO PEDIDO</strong></h3>
      {groupedItems.length > 0 ? (
        groupedItems.map((item, index) => (
          <div key={index} className="item">
            <div>
              {item.qty}x {getFullProductName(item.name, item.category)} 
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
              R$ {((item.price || 0) * (item.qty || 1)).toFixed(2)}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-2">
          Nenhum item no pedido
        </div>
      )}
    </div>
  );
};

export default OrderItems;
