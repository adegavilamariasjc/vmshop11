
import React from 'react';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  change?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  subtotal, 
  deliveryFee, 
  total, 
  paymentMethod, 
  change 
}) => {
  // Calculate change amount if payment is cash
  let changeAmount = 0;
  if (paymentMethod === 'Dinheiro' && change) {
    const changeValue = Number(change);
    changeAmount = changeValue - total;
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>Subtotal:</div>
        <div>R$ {subtotal.toFixed(2)}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>Taxa de entrega:</div>
        <div>R$ {deliveryFee.toFixed(2)}</div>
      </div>
      <div className="total">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>TOTAL:</div>
          <div>R$ {total.toFixed(2)}</div>
        </div>
      </div>
      
      <div>
        <strong>Forma de pagamento:</strong> {paymentMethod}
        {paymentMethod === 'Dinheiro' && change && (
          <>
            <div>
              <strong>Troco para:</strong> R$ {change}
            </div>
            {changeAmount > 0 && (
              <div>
                <strong>Levar troco:</strong> R$ {changeAmount.toFixed(2)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
