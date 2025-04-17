
import React from 'react';

interface OrderItem {
  qty: number;
  name: string;
  price: number;
  alcohol?: string;
  balyFlavor?: string;
  ice?: Record<string, any>;
}

interface OrderItemsProps {
  items: OrderItem[];
}

const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  return (
    <div className="items">
      <h3><strong>ITENS DO PEDIDO</strong></h3>
      {items.map((item, index) => (
        <div key={index} className="item">
          <div>
            {item.qty}x {item.name} 
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
          <div style={{ textAlign: 'right' }}>
            R$ {(item.price * item.qty).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItems;
