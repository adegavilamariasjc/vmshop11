
import React from 'react';
import { MapPin, Phone, CreditCard, Banknote } from 'lucide-react';

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
    <div className="mt-4 p-4 rounded-md bg-gray-800 border border-gray-700">
      <div className="space-y-2 text-white">
        <div className="flex justify-between">
          <div>Subtotal:</div>
          <div>R$ {subtotal.toFixed(2)}</div>
        </div>
        <div className="flex justify-between">
          <div>Taxa de entrega:</div>
          <div>R$ {deliveryFee.toFixed(2)}</div>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2 mt-2">
          <div>TOTAL:</div>
          <div>R$ {total.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2 text-white">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Forma de pagamento:</span> {paymentMethod}
        </div>
        
        {paymentMethod === 'Dinheiro' && change && (
          <>
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Troco para:</span> R$ {change}
            </div>
            {changeAmount > 0 && (
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <Banknote className="h-4 w-4" />
                <span>Levar troco:</span> R$ {changeAmount.toFixed(2)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
