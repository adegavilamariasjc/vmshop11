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
import PedidosManager from '../components/admin/PedidosManager';
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
      setActiveTab("pedidos"); // Reset to default tab
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
    setActiveTab("pedidos"); // Reset tab state
    toast({
      title: "Logout realizado",
      description: "Você saiu do painel administrativo",
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
      
      <div className="relative z-10 w-full lg:max-w-6xl mx-auto min-h-screen bg-black/70 p-4 content-overlay">
        {isAuthenticated ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="w-40">
                <Logo />
              </div>
              <div>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="text-black font-medium"
                >
                  Sair
                </Button>
              </div>
            </div>
            
            <div className="mt-8">
              <h1 className="text-2xl font-bold text-white mb-6">Painel Administrativo</h1>
              
              <div className="mb-8">
                <TrafficIndicator />
              </div>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-4 mb-8 max-w-full overflow-x-auto">
                  <TabsTrigger value="pedidos" className="text-black font-medium">Pedidos</TabsTrigger>
                  <TabsTrigger value="produtos" className="text-black font-medium">Produtos</TabsTrigger>
                  <TabsTrigger value="categorias" className="text-black font-medium">Categorias</TabsTrigger>
                  <TabsTrigger value="bairros" className="text-black font-medium">Bairros</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pedidos" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "pedidos" && <PedidosManager key="pedidos" />}
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
