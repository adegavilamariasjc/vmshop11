import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingIndicator from '@/components/LoadingIndicator';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Index from './Index';

const Balcao = () => {
  const navigate = useNavigate();
  const { user, role, loading, roleLoading, signOut } = useAuth();

  useEffect(() => {
    // Redirect to homepage if not logged in or not balcao role
    if (!loading && !roleLoading && (!user || role !== 'balcao')) {
      navigate('/');
    }
  }, [user, role, loading, roleLoading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while checking authentication
  if (loading || roleLoading) {
    return <LoadingIndicator />;
  }

  // If not authenticated or not balcao role, show nothing (will redirect)
  if (!user || role !== 'balcao') {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Header com logo e botão de logout */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-white font-bold text-lg">Modo Balcão</h1>
              <p className="text-white/70 text-sm">
                {user.user_metadata?.nome_completo || user.email}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main content - Index page with balcao mode */}
      <div className="pt-20">
        <Index balcaoMode={true} />
      </div>
    </div>
  );
};

export default Balcao;
