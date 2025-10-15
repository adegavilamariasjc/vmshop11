import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AdminLogin from '../components/admin/AdminLogin';
import TrafficIndicator from '../components/admin/TrafficIndicator';
import Logo from '../components/Logo';
import BackgroundVideoPlayer from '../components/BackgroundVideoPlayer';
import { getVideoUrls } from '@/utils/videoUrls';

// Import components directly to avoid lazy loading issues in production
import SimplifiedAdminPedidos from '../components/admin/SimplifiedAdminPedidos';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import BairroManager from '../components/admin/BairroManager';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("pedidos");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const videoUrls = useMemo(() => getVideoUrls(), []);

  const handleLogin = useCallback((password: string) => {
    if (password === "adega123") {
      setIsAuthenticated(true);
      setActiveTab("pedidos");
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao painel administrativo",
      });
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Senha incorreta",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setActiveTab("pedidos");
    toast({
      title: "Logout realizado",
      description: "Você saiu do painel",
    });
  }, [toast]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      <BackgroundVideoPlayer 
        videoUrls={videoUrls}
        transitionDuration={2000}
        playDuration={30000}
      />
      
      <div className="relative z-10 w-full lg:max-w-6xl mx-auto min-h-screen bg-black/70 p-2 sm:p-4 content-overlay">
        {isAuthenticated ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="w-32 sm:w-40">
                <Logo />
              </div>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="text-black font-medium w-full sm:w-auto"
                size="sm"
              >
                Sair
              </Button>
            </div>
            
            {/* Monitor de tráfego compacto no topo */}
            <div className="mt-3">
              <TrafficIndicator />
            </div>
            
            <div className="mt-4 sm:mt-6">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Painel Administrativo</h1>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4 sm:mb-8 w-full">
                  <TabsTrigger value="pedidos" className="text-black font-medium text-xs sm:text-sm">Pedidos</TabsTrigger>
                  <TabsTrigger value="produtos" className="text-black font-medium text-xs sm:text-sm">Produtos</TabsTrigger>
                  <TabsTrigger value="categorias" className="text-black font-medium text-xs sm:text-sm">Categorias</TabsTrigger>
                  <TabsTrigger value="bairros" className="text-black font-medium text-xs sm:text-sm">Bairros</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pedidos" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "pedidos" && <SimplifiedAdminPedidos key="pedidos" />}
                </TabsContent>
                
                <TabsContent value="produtos" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "produtos" && <ProductManager key="produtos" />}
                </TabsContent>
                
                <TabsContent value="categorias" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "categorias" && <CategoryManager key="categorias" />}
                </TabsContent>
                
                <TabsContent value="bairros" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "bairros" && <BairroManager key="bairros" />}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-[200px] mb-6">
              <Logo />
            </div>
            <AdminLogin onLogin={handleLogin} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
