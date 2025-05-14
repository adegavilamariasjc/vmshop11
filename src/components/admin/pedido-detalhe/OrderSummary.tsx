
import React from 'react';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  change?: string;
  discountAmount?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  subtotal, 
  deliveryFee, 
  total, 
  paymentMethod, 
  change,
  discountAmount = 0
}) => {
  // Ensure values are valid numbers
  const safeSubtotal = isNaN(subtotal) ? 0 : subtotal;
  const safeDeliveryFee = isNaN(deliveryFee) ? 0 : deliveryFee;
  const safeDiscountAmount = isNaN(discountAmount) ? 0 : discountAmount;
  
  // Use the provided total if it's correct, otherwise calculate
  const calculatedTotal = safeSubtotal + safeDeliveryFee;
  const displayTotal = Math.abs(calculatedTotal - total) < 0.01 ? total : calculatedTotal;

  return (
    <div className="mt-4 border-t border-gray-700 pt-3">
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-300">Subtotal:</div>
        <div className="font-medium">R$ {safeSubtotal.toFixed(2)}</div>
      </div>
      
      {safeDiscountAmount > 0 && (
        <div className="flex justify-between items-center mb-2">
          <div className="text-green-400">Descontos:</div>
          <div className="font-medium text-green-400">- R$ {safeDiscountAmount.toFixed(2)}</div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-300">Taxa de entrega:</div>
        <div className="font-medium">R$ {safeDeliveryFee.toFixed(2)}</div>
      </div>
      <div className="total border-t border-gray-700 pt-2 mt-2">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg">TOTAL:</div>
          <div className="font-bold text-lg text-purple-400">R$ {displayTotal.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="mt-4 border-t border-gray-700 pt-3">
        <div className="mb-1"><strong>Forma de pagamento:</strong> {paymentMethod}</div>
        {paymentMethod === 'Dinheiro' && change && (
          <div className="flex justify-between items-center">
            <strong>Troco para:</strong> 
            <div>R$ {change}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
