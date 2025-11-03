
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutButton: React.FC = () => {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 0 0 rgba(168, 85, 247, 0)',
          '0 0 0 10px rgba(168, 85, 247, 0.1)',
          '0 0 0 0 rgba(168, 85, 247, 0)'
        ]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-full"
    >
      <Button
        type="submit"
        variant="purple"
        className="w-full h-14 text-lg font-bold shadow-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 relative overflow-hidden group"
      >
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        <span className="relative flex items-center gap-2 justify-center">
          <Send className="w-5 h-5" />
          Enviar Pedido via WhatsApp
        </span>
      </Button>
    </motion.div>
  );
};

export default CheckoutButton;
