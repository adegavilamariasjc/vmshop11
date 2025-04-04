
import React from 'react';
import { motion } from 'framer-motion';
import CartSummary from './CartSummary';
import CheckoutForm from './CheckoutForm';
import { Product, FormData } from '../types';

interface CheckoutViewProps {
  cart: Product[];
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onBackToProducts: () => void;
  onSubmit: () => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  form,
  setForm,
  onBackToProducts,
  onSubmit
}) => {
  return (
    <motion.div
      key="checkout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-10"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white uppercase">FINALIZAR PEDIDO</h2>
        <button 
          onClick={onBackToProducts}
          className="text-purple-light underline"
        >
          Voltar
        </button>
      </div>
      
      <CartSummary cart={cart} selectedBairro={form.bairro} />
      <CheckoutForm 
        form={form} 
        setForm={setForm} 
        onSubmit={onSubmit} 
      />
    </motion.div>
  );
};

export default CheckoutView;
