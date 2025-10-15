
import React from 'react';
import { Product } from '../types';
import { calculateBeerDiscount, getProductDisplayPrice } from '../utils/discountUtils';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  cart?: Product[];
  discountAmount?: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ 
  subtotal, 
  deliveryFee, 
  total, 
  cart = [],
  discountAmount
}) => {
  // If cart is provided, recalculate the total with discounts applied
  const calculatedSubtotal = cart.length > 0
    ? cart.reduce((sum, item) => sum + getProductDisplayPrice(item), 0)
    : subtotal;
  
  const calculatedTotal = calculatedSubtotal + deliveryFee;

  // Calculate total discount amount for beer products if not provided
  const totalDiscountAmount = discountAmount !== undefined ? discountAmount : cart.reduce((sum, item) => {
    const discountInfo = calculateBeerDiscount(item);
    if (discountInfo.hasDiscount) {
      const regularPrice = item.price * (item.qty || 0);
      const discountAmount = regularPrice - discountInfo.discountedPrice;
      return sum + discountAmount;
    }
    return sum;
  }, 0);

  // Check if there are any discounts to show
  const hasDiscounts = totalDiscountAmount > 0;

  return (
    <div className="border border-gray-600 rounded-lg p-4 bg-black/50 mt-4">
      <div className="flex justify-between mb-2">
        <span className="text-white">Subtotal:</span>
        <span className="text-white">R$ {(calculatedSubtotal + totalDiscountAmount).toFixed(2)}</span>
      </div>
      
      {hasDiscounts && (
        <div className="flex justify-between mb-2 text-green-400">
          <span>Descontos aplicados:</span>
          <span>- R$ {totalDiscountAmount.toFixed(2)}</span>
        </div>
      )}
      
      <div className="flex justify-between mb-2">
        <span className="text-white">Taxa de entrega:</span>
        <span className="text-white">R$ {deliveryFee.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between font-bold text-lg">
        <span className="text-white">Total:</span>
        <span className="text-[hsl(291_46%_82%)]">R$ {calculatedTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CartSummary;
