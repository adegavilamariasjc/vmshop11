
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CheckoutViewProps {
  cart: Product[];
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  bairros: { nome: string; taxa: number }[];
  onBackToProducts: () => void;
  onSubmit: (isBalcao?: boolean, funcionario?: string) => void;
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
const FUNCIONARIOS = ['ANDRE', 'LUCAS', 'RAMON', 'VINICIUS', 'GABRIEL'];
const [showPasswordDialog, setShowPasswordDialog] = useState(false);
const [senha, setSenha] = useState('');
const [funcionario, setFuncionario] = useState('');
const [senhaError, setSenhaError] = useState('');
  return (
    <motion.div
      key="checkout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative pb-24 sm:pb-8"
    >
      <button
        onClick={onBackToProducts}
        className="flex items-center text-white mb-3 sm:mb-4 hover:text-white/80 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base">Voltar para produtos</span>
      </button>
      
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">Finalizar Pedido</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
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
          
          <Button
            onClick={() => onSubmit(false)}
            disabled={!isFormValid || isSending}
            className="w-full py-4 sm:py-6 mt-4 sm:mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base sm:text-lg shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                <span className="text-sm sm:text-base">{isStoreOpen ? 'Enviando...' : 'Registrando...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base leading-tight">
                  {isStoreOpen ? 'Enviar Pedido via WhatsApp' : 'Registrar Pedido (Fora do Horário)'}
                </span>
              </>
            )}
          </Button>

          {/* Botão para pedido de balcão */}
          <button
            type="button"
            onClick={() => { setShowPasswordDialog(true); setSenha(''); setFuncionario(''); setSenhaError(''); }}
            title="Pedido de Balcão"
            className="fixed bottom-20 sm:bottom-24 left-3 sm:left-4 bg-accent-purple/70 hover:bg-accent-purple text-accent-purple-foreground p-2.5 sm:p-3 rounded-full shadow-lg transition-all duration-200 z-40"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dialog de senha para balcão */}
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogContent className="max-w-[90vw] sm:max-w-sm bg-black/95 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> Pedido de Balcão
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="funcionario" className="text-white">Funcionário</Label>
                  <Select value={funcionario} onValueChange={setFuncionario}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 z-50">
                      {FUNCIONARIOS.map((func) => (
                        <SelectItem 
                          key={func} 
                          value={func}
                          className="text-white hover:bg-white/10 focus:bg-white/20 cursor-pointer"
                        >
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="senha-balcao" className="text-white">Senha de Acesso</Label>
                  <Input
                    id="senha-balcao"
                    type="password"
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setSenhaError(''); }}
                    placeholder="Digite a senha"
                    className="mt-2"
                  />
                  {senhaError && <p className="text-red-400 text-sm mt-1">{senhaError}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setShowPasswordDialog(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="purple"
                    className="flex-1"
                    onClick={() => {
                      if (!funcionario) {
                        setSenhaError('Selecione um funcionário');
                        return;
                      }
                      if (senha === SENHA_BALCAO) {
                        setShowPasswordDialog(false);
                        onSubmit(true, funcionario);
                      } else {
                        setSenhaError('Senha incorreta');
                      }
                    }}
                    disabled={!senha || !funcionario}
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
