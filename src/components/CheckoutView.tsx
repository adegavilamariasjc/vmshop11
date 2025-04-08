
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send } from 'lucide-react';
import { FormData, Product } from '../types';
import OrderSummary from './cart/OrderSummary';
import CartSummary from './CartSummary';
import CheckoutForm from './CheckoutForm';

interface CheckoutViewProps {
  cart: Product[];
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  bairros: { nome: string; taxa: number }[];
  onBackToProducts: () => void;
  onSubmit: () => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  form,
  setForm,
  bairros,
  onBackToProducts,
  onSubmit
}) => {
  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0),
    [cart]
  );
  
  const total = useMemo(() => 
    subtotal + form.bairro.taxa,
    [subtotal, form.bairro.taxa]
  );

  return (
    <motion.div
      key="checkout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      <button
        onClick={onBackToProducts}
        className="flex items-center text-white mb-4"
      >
        <ChevronLeft size={20} />
        <span>Voltar para produtos</span>
      </button>
      
      <h2 className="text-2xl font-bold text-white mb-6">Finalizar Pedido</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div>
          <OrderSummary cart={cart} />
          <CartSummary 
            subtotal={subtotal} 
            deliveryFee={form.bairro.taxa} 
            total={total} 
          />
        </div>
        
        {/* Checkout Form */}
        <div>
          <CheckoutForm 
            form={form}
            setForm={setForm}
            bairros={bairros}
          />
          
          <motion.button
            onClick={onSubmit}
            disabled={cart.length === 0 || form.nome === '' || form.endereco === '' || form.bairro.nome === 'Selecione Um Bairro' || form.pagamento === ''}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md py-3 px-4 flex justify-center items-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send size={18} />
            <span>Enviar Pedido via WhatsApp</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutView;
