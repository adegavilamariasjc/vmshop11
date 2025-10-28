import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Bike, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'motoboy'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingRedirect, setAwaitingRedirect] = useState(false);
  const { signIn, role } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aceita tanto usuário simples quanto email completo
      const raw = username.trim();
      const email = raw.includes('@') ? raw : `${raw}@sistema.local`;
      await signIn(email.toLowerCase(), password);
      
      onClose();
      setUsername('');
      setPassword('');
      
      setAwaitingRedirect(true);
    } catch (error) {
      // Erro já é tratado no contexto de Auth com toast
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'admin' | 'motoboy');
    setUsername('');
    setPassword('');
  };

  // Navegar quando o papel (role) estiver resolvido após o login
  useEffect(() => {
    if (awaitingRedirect && role !== null) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/entregas');
      }
      setAwaitingRedirect(false);
      onClose();
    }
  }, [awaitingRedirect, role, navigate, onClose]);

  // Fallback: se o papel não carregar a tempo, navega após timeout
  useEffect(() => {
    if (!awaitingRedirect) return;
    const t = setTimeout(() => {
      if (activeTab === 'admin') {
        navigate('/admin');
      } else {
        navigate('/entregas');
      }
      setAwaitingRedirect(false);
      onClose();
    }, 3000);
    return () => clearTimeout(t);
  }, [awaitingRedirect, activeTab, navigate, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Acessar Sistema
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin" className="gap-2">
              <Shield size={16} />
              Administrador
            </TabsTrigger>
            <TabsTrigger value="motoboy" className="gap-2">
              <Bike size={16} />
              Motoboys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Usuário</Label>
                <Input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admvm11"
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Senha</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Entrar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="motoboy" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motoboy-username">Usuário</Label>
                <Input
                  id="motoboy-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="motoboys"
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motoboy-password">Senha</Label>
                <Input
                  id="motoboy-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Bike size={16} />
                      Entrar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground text-center mt-4">
          {activeTab === 'admin' 
            ? 'Acesso restrito a administradores do sistema'
            : 'Acesso para equipe de entregadores'}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedLoginModal;
