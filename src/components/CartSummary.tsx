
import React from 'react';
import { Product, Bairro } from '../types';
import CartItem from './cart/CartItem';
import OrderSummary from './cart/OrderSummary';

interface CartSummaryProps {
  cart: Product[];
  selectedBairro: Bairro;
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart, selectedBairro }) => {
  const subtotal = cart.reduce((sum, p) => sum + p.price * (p.qty || 1), 0);
  const total = subtotal + selectedBairro.taxa;

  return (
    <div className="border border-gray-600 rounded-lg p-4 bg-black/50 mb-4">
      <h3 className="text-lg font-bold text-purple-light mb-3 border-b border-gray-600 pb-2">
        Resumo do Pedido
      </h3>
      
      {cart.map((item, index) => (
        <CartItem key={index} item={item} />
      ))}
      
      <OrderSummary 
        subtotal={subtotal}
        bairro={selectedBairro}
        total={total}
      />
    </div>
  );
};

export default CartSummary;
