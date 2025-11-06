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
import AnalyticsManager from '../components/admin/AnalyticsManager';
import { StockInventoryManager } from '../components/admin/stock/StockInventoryManager';
import { ChatAdm } from '../components/admin/ChatAdm';

const Admin = () => {
  const { user, role, loading, roleLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("pedidos");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showDebug = searchParams.get('debug') === '1';
  
  const videoUrls = useMemo(() => getVideoUrls(), []);

  useEffect(() => {
    // Only redirect if we're done loading AND done loading role
    if (!loading && !roleLoading && (!user || role !== 'admin')) {
      console.log('Admin redirect triggered:', { user: !!user, role, loading, roleLoading });
      navigate('/');
    }
  }, [loading, roleLoading, user, role, navigate]);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  if (loading || roleLoading) {
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
    <div className="min-h-screen w-full relative overflow-x-hidden overflow-y-auto">
      <BackgroundVideoPlayer 
        videoUrls={videoUrls}
        transitionDuration={2000}
        playDuration={30000}
      />
      
      <div className="relative z-10 w-full mx-auto min-h-screen bg-black/70 p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 content-overlay">
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div className="w-28 sm:w-36 md:w-40">
              <Logo />
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
              size="sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              Sair
            </Button>
          </div>
            
            {/* Monitor de tráfego compacto no topo + Diagnóstico (debug=1) */}
            <div className="space-y-2 sm:space-y-3">
              <TrafficIndicator />
              {showDebug && <AuthDiagnostics />}
            </div>
            
            <div className="mt-3 sm:mt-4 md:mt-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Painel Administrativo</h1>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                  <TabsList className="inline-flex sm:grid sm:grid-cols-10 mb-3 sm:mb-6 md:mb-8 w-max sm:w-full min-w-full">
                    <TabsTrigger value="pedidos" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Delivery</TabsTrigger>
                    <TabsTrigger value="balcao" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Balcão</TabsTrigger>
                    <TabsTrigger value="contador" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Contador</TabsTrigger>
                    <TabsTrigger value="produtos" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Produtos</TabsTrigger>
                    <TabsTrigger value="estoque" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Estoque</TabsTrigger>
                    <TabsTrigger value="categorias" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Categorias</TabsTrigger>
                    <TabsTrigger value="bairros" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Bairros</TabsTrigger>
                    <TabsTrigger value="analytics" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Analytics</TabsTrigger>
                    <TabsTrigger value="analise" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Análise IA</TabsTrigger>
                    <TabsTrigger value="chatadm" className="text-black font-medium text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap">Chat IA</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="pedidos" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "pedidos" && <SimplifiedAdminPedidos filterType="delivery" title="Pedidos Delivery" />}
                </TabsContent>
                
                <TabsContent value="balcao" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "balcao" && <SimplifiedAdminPedidos filterType="balcao" title="Pedidos Balcão" />}
                </TabsContent>
                
                <TabsContent value="contador" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "contador" && <AppCounterManager />}
                </TabsContent>
                
                <TabsContent value="produtos" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "produtos" && <ProductManager key="produtos" />}
                </TabsContent>
                
                <TabsContent value="estoque" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "estoque" && <StockInventoryManager />}
                </TabsContent>
                
                <TabsContent value="categorias" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "categorias" && <CategoryManager key="categorias" />}
                </TabsContent>
                
                <TabsContent value="bairros" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "bairros" && <BairroManager key="bairros" />}
                </TabsContent>
                
                <TabsContent value="analytics" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "analytics" && <AnalyticsManager />}
                </TabsContent>
                
                <TabsContent value="analise" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "analise" && <PredictiveAnalysisExport />}
                </TabsContent>
                
                <TabsContent value="chatadm" className="bg-black/50 p-2 sm:p-3 md:p-4 rounded-md overflow-hidden">
                  {activeTab === "chatadm" && <ChatAdm />}
                </TabsContent>
              </Tabs>
            </div>
        </>
      </div>
    </div>
  );
};

export default Admin;
