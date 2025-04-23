
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Loader2, AlertCircle } from 'lucide-react';
import { FormData, Product } from '../types';
import OrderSummary from './cart/OrderSummary';
import CartSummary from './CartSummary';
import CheckoutForm from './CheckoutForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CheckoutViewProps {
  cart: Product[];
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  bairros: { nome: string; taxa: number }[];
  onBackToProducts: () => void;
  onSubmit: () => void;
  isSending?: boolean;
  isStoreOpen: boolean;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  form,
  setForm,
  bairros,
  onBackToProducts,
  onSubmit,
  isSending = false,
  isStoreOpen
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
      
      {!isStoreOpen && (
        <Alert className="bg-red-900/30 border-red-700 mb-6">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <AlertTitle className="text-red-400">Loja Fechada</AlertTitle>
          <AlertDescription className="text-red-300">
            Não é possível enviar pedidos quando a loja está fechada. Por favor, retorne entre 18h e 5h.
          </AlertDescription>
        </Alert>
      )}
      
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
            disabled={!isStoreOpen || cart.length === 0 || form.nome === '' || form.endereco === '' || form.bairro.nome === 'Selecione Um Bairro' || form.pagamento === '' || isSending}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md py-3 px-4 flex justify-center items-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Enviando Pedido...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Enviar Pedido via WhatsApp</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutView;
