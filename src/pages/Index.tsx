
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag } from 'lucide-react';
import Logo from '../components/Logo';
import CategorySelector from '../components/CategorySelector';
import ProductList from '../components/ProductList';
import FlavorSelectionModal from '../components/FlavorSelectionModal';
import AlcoholSelectionModal from '../components/AlcoholSelectionModal';
import CartSummary from '../components/CartSummary';
import CheckoutForm from '../components/CheckoutForm';
import AdminLink from '../components/AdminLink';
import { Product, AlcoholOption, Bairro, FormData } from '../types';
import { 
  bairros, 
  iceFlavors, 
  alcoholOptions, 
  requiresFlavor, 
  requiresAlcoholChoice,
  gerarCodigoPedido,
  getMaxIce
} from '../data/products';
import { formatWhatsAppMessage } from '../utils/formatWhatsApp';

const Index = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [form, setForm] = useState<FormData>({
    nome: "",
    endereco: "",
    numero: "",
    complemento: "",
    referencia: "",
    observacao: "",
    whatsapp: "",
    bairro: bairros[0],
    pagamento: "",
    troco: ""
  });
  
  const [codigoPedido] = useState(gerarCodigoPedido());
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [isAlcoholModalOpen, setIsAlcoholModalOpen] = useState(false);
  const [selectedProductForFlavor, setSelectedProductForFlavor] = useState<Product | null>(null);
  const [selectedProductForAlcohol, setSelectedProductForAlcohol] = useState<Product | null>(null);
  const [selectedIce, setSelectedIce] = useState<Record<string, number>>({});
  const [selectedAlcohol, setSelectedAlcohol] = useState<AlcoholOption | null>(null);

  useEffect(() => {
    if (selectedProductForFlavor) {
      const initialIce: Record<string, number> = {};
      iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
      setSelectedIce(initialIce);
    }
  }, [selectedProductForFlavor]);

  const handleSelectCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const handleAddProduct = (item: Product) => {
    const productWithCategory = { ...item, category: activeCategory || '' };
    
    if (requiresFlavor(activeCategory || '')) {
      setSelectedProductForFlavor(productWithCategory);
      setIsFlavorModalOpen(true);
    } else if (requiresAlcoholChoice(activeCategory || '')) {
      setSelectedProductForAlcohol(productWithCategory);
      setSelectedAlcohol(null);
      setIsAlcoholModalOpen(true);
    } else {
      handleUpdateQuantity(productWithCategory, 1);
    }
  };

  const handleUpdateQuantity = (item: Product, delta: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        (p) =>
          p.name === item.name &&
          p.category === item.category &&
          ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
           (!p.ice && !item.ice)) &&
          p.alcohol === item.alcohol
      );
      
      if (existingItem) {
        return prevCart
          .map(p =>
            p.name === item.name &&
            p.category === item.category &&
            ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
             (!p.ice && !item.ice)) &&
            p.alcohol === item.alcohol
              ? { ...p, qty: Math.max(0, (p.qty || 1) + delta) }
              : p
          )
          .filter(p => (p.qty || 1) > 0);
      }
      
      return delta > 0 ? [...prevCart, { ...item, qty: 1 }] : prevCart;
    });
  };

  const updateIceQuantity = (flavor: string, delta: number) => {
    setSelectedIce(prev => {
      const currentTotal = Object.values(prev).reduce((sum, v) => sum + v, 0);
      const maxIce = getMaxIce(selectedProductForFlavor?.category || "");
      
      if (delta > 0 && currentTotal >= maxIce) return prev;
      
      return { 
        ...prev, 
        [flavor]: Math.max(0, (prev[flavor] || 0) + delta) 
      };
    });
  };

  const confirmFlavorSelection = () => {
    if (!selectedProductForFlavor) return;
    
    const totalIce = Object.values(selectedIce).reduce((sum, v) => sum + v, 0);
    
    if (totalIce === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, selecione ao menos 1 unidade de gelo.",
        variant: "destructive",
      });
      return;
    }
    
    const itemWithIce = { ...selectedProductForFlavor, ice: selectedIce };
    handleUpdateQuantity(itemWithIce, 1);
    setIsFlavorModalOpen(false);
    
    toast({
      title: "Item adicionado",
      description: `${selectedProductForFlavor.name} adicionado ao pedido.`,
    });
  };

  const confirmAlcoholSelection = () => {
    if (!selectedProductForAlcohol || !selectedAlcohol) return;
    
    const extraCost = selectedAlcohol.extraCost || 0;
    const itemWithAlcohol = {
      ...selectedProductForAlcohol,
      alcohol: selectedAlcohol.name,
      price: (selectedProductForAlcohol.price || 0) + extraCost,
    };
    
    handleUpdateQuantity(itemWithAlcohol, 1);
    setIsAlcoholModalOpen(false);
    
    toast({
      title: "Item adicionado",
      description: `${selectedProductForAlcohol.name} com ${selectedAlcohol.name} adicionado ao pedido.`,
    });
  };

  const checkMissingFlavorsAndProceed = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Por favor, adicione itens ao seu pedido antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    
    const missing = cart.filter(
      item =>
        (requiresFlavor(item.category || '') && (!item.ice || Object.values(item.ice).reduce((a, b) => a + b, 0) === 0)) ||
        (requiresAlcoholChoice(item.category || '') && !item.alcohol)
    );
    
    if (missing.length > 0) {
      const itemPend = missing[0];
      
      if (requiresFlavor(itemPend.category || '')) {
        setSelectedProductForFlavor(itemPend);
        setIsFlavorModalOpen(true);
      } else if (requiresAlcoholChoice(itemPend.category || '')) {
        setSelectedProductForAlcohol(itemPend);
        setSelectedAlcohol(null);
        setIsAlcoholModalOpen(true);
      }
    } else {
      setShowSummary(true);
      window.scrollTo(0, 0);
    }
  };

  const enviarPedidoWhatsApp = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Por favor, adicione itens ao seu pedido antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    
    const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0) + form.bairro.taxa;
    
    const itensPedido = cart
      .map(p => {
        const iceText = p.ice
          ? " \n   Gelo: " +
            Object.entries(p.ice)
              .filter(([flavor, qty]) => qty > 0)
              .map(([flavor, qty]) => `${flavor} x${qty}`)
              .join(", ")
          : "";
        const alcoholText = p.alcohol ? ` (Álcool: ${p.alcohol})` : "";
        return `${p.qty}x ${p.name}${alcoholText}${iceText} - R$${((p.price || 0) * (p.qty || 1)).toFixed(2)}`;
      })
      .join("\n");
    
    const mensagem = formatWhatsAppMessage(
      codigoPedido,
      form.nome,
      form.endereco,
      form.numero,
      form.complemento,
      form.referencia,
      form.bairro.nome,
      form.bairro.taxa,
      form.whatsapp,
      form.pagamento,
      form.troco,
      itensPedido,
      total
    );

    const mensagemEncoded = mensagem.replace(/\n/g, "%0A");
    const urlWhatsApp = `https://wa.me/5512982704573?text=${mensagemEncoded}`;
    window.open(urlWhatsApp, "_blank");
  };

  return (
    <div
      className="min-h-screen w-full bg-fixed"
      style={{ 
        backgroundImage: "url('https://adegavm.com/bgs.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-black/70 p-4">
        <Logo />
        
        <AnimatePresence mode="wait">
          {!showSummary ? (
            <motion.div
              key="product-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CategorySelector 
                activeCategory={activeCategory} 
                onSelectCategory={handleSelectCategory} 
              />
              
              {activeCategory && (
                <ProductList
                  category={activeCategory}
                  cart={cart}
                  onAddProduct={handleAddProduct}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              )}
              
              <motion.button
                onClick={checkMissingFlavorsAndProceed}
                className="fixed bottom-6 right-6 bg-purple-dark text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={cart.length > 0 ? { y: [0, -5, 0], transition: { repeat: 2, duration: 0.6 } } : {}}
              >
                <ShoppingBag size={20} />
                <span className="font-semibold">
                  {cart.length > 0 ? `${cart.reduce((sum, p) => sum + (p.qty || 1), 0)} itens` : "Carrinho"}
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Finalizar Pedido</h2>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="text-purple-light underline"
                >
                  Voltar
                </button>
              </div>
              
              <CartSummary cart={cart} selectedBairro={form.bairro} />
              <CheckoutForm 
                form={form} 
                setForm={setForm} 
                onSubmit={enviarPedidoWhatsApp} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <FlavorSelectionModal 
          isOpen={isFlavorModalOpen}
          onClose={() => setIsFlavorModalOpen(false)}
          product={selectedProductForFlavor}
          selectedIce={selectedIce}
          updateIceQuantity={updateIceQuantity}
          onConfirm={confirmFlavorSelection}
        />
        
        <AlcoholSelectionModal
          isOpen={isAlcoholModalOpen}
          onClose={() => setIsAlcoholModalOpen(false)}
          product={selectedProductForAlcohol}
          selectedAlcohol={selectedAlcohol}
          setSelectedAlcohol={setSelectedAlcohol}
          onConfirm={confirmAlcoholSelection}
        />

        <AdminLink />
      </div>
    </div>
  );
};

export default Index;
