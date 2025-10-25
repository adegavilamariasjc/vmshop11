import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bike } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MotoboyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const MotoboyLoginModal: React.FC<MotoboyLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [password, setPassword] = useState('');
  const [motoboyName, setMotoboyName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motoboyName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite seu nome para continuar",
        variant: "destructive",
      });
      return;
    }
    
    if (password === 'motocas11') {
      // Armazena o nome do motoboy no localStorage
      localStorage.setItem('motoboy_name', motoboyName.trim());
      
      toast({
        title: "Login realizado!",
        description: `Bem-vindo, ${motoboyName}!`,
      });
      onLoginSuccess();
      setPassword('');
      setMotoboyName('');
    } else {
      toast({
        title: "Senha incorreta",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="bg-[hsl(291_64%_42%)] p-2 rounded-full">
              <Bike size={24} />
            </div>
            Login Motoboy
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nome do Motoboy</label>
            <Input
              type="text"
              placeholder="Digite seu nome"
              value={motoboyName}
              onChange={(e) => setMotoboyName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              autoFocus
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Senha</label>
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[hsl(291_64%_42%)] hover:bg-[hsl(291_68%_38%)] text-white"
            >
              Entrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MotoboyLoginModal;
