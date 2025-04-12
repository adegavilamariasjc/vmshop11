
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AdminLogin from '../components/admin/AdminLogin';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import BairroManager from '../components/admin/BairroManager';
import PedidosManager from '../components/admin/PedidosManager';
import Logo from '../components/Logo';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Ensure video stays fixed during all component lifecycles
  useEffect(() => {
    // Force video to maintain its position
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      videoContainer.setAttribute('style', 'position: fixed !important; top: 0 !important; left: 0 !important;');
    }
    
    return () => {
      // Cleanup - although not strictly necessary since styles are in global CSS
    };
  }, []);

  const handleLogin = (password: string) => {
    // Simple password authentication
    if (password === "adega123") {  // You should change this to your own password
      setIsAuthenticated(true);
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
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Logout realizado",
      description: "Você saiu do painel administrativo",
    });
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Video Background */}
      <div className="video-container">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="video-background"
        >
          <source src="https://adegavm.shop/bgs.mp4" type="video/mp4" />
          {/* Fallback background if video fails to load */}
          <div className="absolute inset-0 bg-black"></div>
        </video>
      </div>
      
      {/* Content overlay */}
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
              
              <Tabs defaultValue="pedidos" className="w-full">
                <TabsList className="grid grid-cols-4 mb-8 max-w-full overflow-x-auto">
                  <TabsTrigger value="pedidos" className="text-black font-medium">Pedidos</TabsTrigger>
                  <TabsTrigger value="produtos" className="text-black font-medium">Produtos</TabsTrigger>
                  <TabsTrigger value="categorias" className="text-black font-medium">Categorias</TabsTrigger>
                  <TabsTrigger value="bairros" className="text-black font-medium">Bairros</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pedidos" className="bg-black/50 p-4 rounded-md">
                  <PedidosManager />
                </TabsContent>
                
                <TabsContent value="produtos" className="bg-black/50 p-4 rounded-md">
                  <ProductManager />
                </TabsContent>
                
                <TabsContent value="categorias" className="bg-black/50 p-4 rounded-md">
                  <CategoryManager />
                </TabsContent>
                
                <TabsContent value="bairros" className="bg-black/50 p-4 rounded-md">
                  <BairroManager />
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
