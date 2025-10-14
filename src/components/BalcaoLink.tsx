import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BalcaoModal from './BalcaoModal';

const SENHA_BALCAO = '141288';

const BalcaoLink: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [senha, setSenha] = useState('');
  const [senhaError, setSenhaError] = useState('');

  const handleButtonClick = () => {
    setShowPasswordDialog(true);
    setSenha('');
    setSenhaError('');
  };

  const handlePasswordSubmit = () => {
    if (senha === SENHA_BALCAO) {
      setShowPasswordDialog(false);
      setIsOpen(true);
      setSenha('');
      setSenhaError('');
    } else {
      setSenhaError('Senha incorreta');
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="fixed bottom-4 left-16 bg-green-600/70 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        title="Pedidos de Balcão"
      >
        <ShoppingBag size={16} />
      </button>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-sm bg-black/95 border-purple-dark">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-light">
              Acesso de Funcionário
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="senha-balcao" className="text-white">Senha de Acesso</Label>
              <Input
                id="senha-balcao"
                type="password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setSenhaError('');
                }}
                onKeyPress={handlePasswordKeyPress}
                placeholder="Digite a senha"
                className="mt-2"
                autoFocus
              />
              {senhaError && (
                <p className="text-red-400 text-sm mt-1">{senhaError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-purple-dark hover:bg-purple-600"
                onClick={handlePasswordSubmit}
                disabled={!senha}
              >
                Acessar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <BalcaoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default BalcaoLink;
