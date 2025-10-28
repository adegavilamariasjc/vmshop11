import React, { useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import TrafficIndicator from '../components/admin/TrafficIndicator';
import Logo from '../components/Logo';
import LoadingIndicator from '../components/LoadingIndicator';
import BackgroundVideoPlayer from '../components/BackgroundVideoPlayer';
import { getVideoUrls } from '@/utils/videoUrls';

// Import components directly to avoid lazy loading issues in production
import SimplifiedAdminPedidos from '../components/admin/SimplifiedAdminPedidos';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import BairroManager from '../components/admin/BairroManager';
import { AppCounterManager } from '../components/admin/AppCounterManager';
import { PredictiveAnalysisExport } from '../components/admin/PredictiveAnalysisExport';
import { AuthDiagnostics } from '../components/admin/AuthDiagnostics';

const Admin = () => {
  const { user, role, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("pedidos");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showDebug = searchParams.get('debug') === '1';
  
  const videoUrls = useMemo(() => getVideoUrls(), []);

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/');
    }
  }, [loading, user, role, navigate]);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      <BackgroundVideoPlayer 
        videoUrls={videoUrls}
        transitionDuration={2000}
        playDuration={30000}
      />
      
      <div className="relative z-10 w-full lg:max-w-6xl mx-auto min-h-screen bg-black/70 p-2 sm:p-4 content-overlay">
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-32 sm:w-40">
              <Logo />
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <LogOut size={16} />
              Sair
            </Button>
          </div>
            
            {/* Monitor de tráfego compacto no topo + Diagnóstico (debug=1) */}
            <div className="mt-3 space-y-3">
              <TrafficIndicator />
              {showDebug && <AuthDiagnostics />}
            </div>
            
            <div className="mt-4 sm:mt-6">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Painel Administrativo</h1>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-7 mb-4 sm:mb-8 w-full">
                  <TabsTrigger value="pedidos" className="text-black font-medium text-xs sm:text-sm">Delivery</TabsTrigger>
                  <TabsTrigger value="balcao" className="text-black font-medium text-xs sm:text-sm">Balcão</TabsTrigger>
                  <TabsTrigger value="contador" className="text-black font-medium text-xs sm:text-sm">Contador</TabsTrigger>
                  <TabsTrigger value="produtos" className="text-black font-medium text-xs sm:text-sm">Produtos</TabsTrigger>
                  <TabsTrigger value="categorias" className="text-black font-medium text-xs sm:text-sm">Categorias</TabsTrigger>
                  <TabsTrigger value="bairros" className="text-black font-medium text-xs sm:text-sm">Bairros</TabsTrigger>
                  <TabsTrigger value="analise" className="text-black font-medium text-xs sm:text-sm">Análise IA</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pedidos" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "pedidos" && <SimplifiedAdminPedidos filterType="delivery" title="Pedidos Delivery" />}
                </TabsContent>
                
                <TabsContent value="balcao" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "balcao" && <SimplifiedAdminPedidos filterType="balcao" title="Pedidos Balcão" />}
                </TabsContent>
                
                <TabsContent value="contador" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "contador" && <AppCounterManager />}
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
                
                <TabsContent value="analise" className="bg-black/50 p-4 rounded-md">
                  {activeTab === "analise" && <PredictiveAnalysisExport />}
                </TabsContent>
              </Tabs>
            </div>
        </>
      </div>
    </div>
  );
};

export default Admin;
