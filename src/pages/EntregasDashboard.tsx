import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '@/components/LoadingIndicator';
import MotoboyPedidosListModal from '@/components/MotoboyPedidosListModal';
import { Button } from '@/components/ui/button';
import { LogOut, Bike } from 'lucide-react';
import BackgroundVideoPlayer from '@/components/BackgroundVideoPlayer';
import Logo from '@/components/Logo';
import { getVideoUrls } from '@/utils/videoUrls';

const EntregasDashboard = () => {
  const { user, role, loading, roleLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're done loading AND done loading role
    if (!loading && !roleLoading && (!user || role !== 'motoboy')) {
      console.log('Motoboy redirect triggered:', { user: !!user, role, loading, roleLoading });
      navigate('/');
    }
  }, [loading, roleLoading, user, role, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!user || role !== 'motoboy') {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const videoUrls = getVideoUrls();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <BackgroundVideoPlayer videoUrls={videoUrls} />
      
      <div className="relative z-10 w-full min-h-screen bg-black/50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Bike size={24} />
                  Painel de Entregas
                </h1>
                <p className="text-sm text-white/70">
                  Pedidos atribuídos para entrega
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2"
            >
              <LogOut size={16} />
              Sair
            </Button>
          </div>

          {/* Lista de Pedidos */}
          <MotoboyPedidosListModal 
            isOpen={true}
            onClose={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default EntregasDashboard;
