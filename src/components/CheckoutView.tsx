
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Loader2, ShoppingBag, Lock } from 'lucide-react';
import { FormData, Product } from '../types';
import OrderSummary from './cart/OrderSummary';
import CartSummary from './CartSummary';
import CheckoutForm from './CheckoutForm';
import { calculateBeerDiscount } from '../utils/discountUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CheckoutViewProps {
  cart: Product[];
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  bairros: { nome: string; taxa: number }[];
  onBackToProducts: () => void;
  onSubmit: (isBalcao?: boolean) => void;
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
  // Filter cart items with zero quantity
  const filteredCart = useMemo(() => 
    cart.filter(item => (item.qty || 0) > 0),
    [cart]
  );
  
  // Calculate subtotal without discounts
  const subtotalWithoutDiscount = useMemo(() => 
    filteredCart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0),
    [filteredCart]
  );
  
  // Calculate total discount amount
  const totalDiscountAmount = useMemo(() => 
    filteredCart.reduce((sum, item) => {
      const discountInfo = calculateBeerDiscount(item);
      if (discountInfo.hasDiscount) {
        const regularPrice = (item.price || 0) * (item.qty || 1);
        return sum + (regularPrice - discountInfo.discountedPrice);
      }
      return sum;
    }, 0),
    [filteredCart]
  );
  
  // Calculate subtotal with discounts applied
  const subtotalWithDiscount = subtotalWithoutDiscount - totalDiscountAmount;
  
  const total = useMemo(() => 
    subtotalWithDiscount + form.bairro.taxa,
    [subtotalWithDiscount, form.bairro.taxa]
  );

// Check if the form is valid for submission
const isFormValid = filteredCart.length > 0 && 
  form.nome !== '' && 
  form.endereco !== '' && 
  form.numero !== '' && 
  form.bairro.nome !== 'Selecione Um Bairro' && 
  form.pagamento !== '';

const SENHA_BALCAO = 'vm11';
const [showPasswordDialog, setShowPasswordDialog] = useState(false);
const [senha, setSenha] = useState('');
const [senhaError, setSenhaError] = useState('');
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
          <OrderSummary cart={filteredCart} />
          <CartSummary 
            subtotal={subtotalWithDiscount} 
            deliveryFee={form.bairro.taxa} 
            total={total}
            cart={filteredCart}
            discountAmount={totalDiscountAmount}
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
            onClick={() => onSubmit(false)}
            disabled={!isFormValid || isSending}
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
                <span>{isStoreOpen ? 'Enviar Pedido via WhatsApp' : 'Registrar Pedido (Fora do Horário)'}</span>
              </>
            )}
          </motion.button>

          {/* Botão para pedido de balcão */}
          <button
            type="button"
            onClick={() => { setShowPasswordDialog(true); setSenha(''); setSenhaError(''); }}
            title="Pedido de Balcão"
            className="fixed bottom-4 left-28 bg-purple-dark/70 hover:bg-purple-dark text-white p-3 rounded-full shadow-lg transition-all duration-200"
          >
            <ShoppingBag size={16} />
          </button>

          {/* Dialog de senha para balcão */}
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogContent className="max-w-sm bg-black/95 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Lock size={18} /> Pedido de Balcão
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="senha-balcao" className="text-white">Senha de Acesso</Label>
                  <Input
                    id="senha-balcao"
                    type="password"
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setSenhaError(''); }}
                    placeholder="Digite a senha"
                    className="mt-2"
                    autoFocus
                  />
                  {senhaError && <p className="text-red-400 text-sm mt-1">{senhaError}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setShowPasswordDialog(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      if (senha === SENHA_BALCAO) {
                        setShowPasswordDialog(false);
                        onSubmit(true);
                      } else {
                        setSenhaError('Senha incorreta');
                      }
                    }}
                    disabled={!senha}
                  >
                    Acessar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutView;
