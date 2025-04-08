
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Bell, BellRing } from "lucide-react";
import AdminLogin from '../components/admin/AdminLogin';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import BairroManager from '../components/admin/BairroManager';
import Logo from '../components/Logo';
import { bairros, categories, products } from '../data/products';
import { migrateDataToSupabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Add a new dedicated component for order alerts
const OrderAlert = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    
    // We would normally set up a real-time subscription to orders table
    // For now, simulate incoming orders for demonstration
    const simulateOrderCheck = setInterval(() => {
      // This is where you would check for new orders from your database
      const randomChance = Math.random() * 100;
      
      // 5% chance of new order for demonstration (remove in production)
      if (randomChance < 5) {
        playAlertSound();
        setOrderCount(prev => prev + 1);
        setHasNewOrder(true);
        
        toast({
          title: "Novo Pedido Recebido!",
          description: "Um cliente finalizou um pedido no sistema.",
          variant: "default",
        });
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(simulateOrderCheck);
    };
  }, [toast]);
  
  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };
  
  const handleAcknowledge = () => {
    setHasNewOrder(false);
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {hasNewOrder ? (
        <Alert className="bg-yellow-600 border-yellow-700 text-white animate-pulse w-72">
          <BellRing className="h-4 w-4 text-white" />
          <AlertTitle>Atenção! Novo Pedido</AlertTitle>
          <AlertDescription>
            Você tem {orderCount} {orderCount === 1 ? 'novo pedido' : 'novos pedidos'} para processar!
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-2 bg-yellow-700 hover:bg-yellow-800 border-white text-white w-full"
            onClick={handleAcknowledge}
          >
            Entendido
          </Button>
        </Alert>
      ) : (
        <Button
          className="bg-yellow-600 hover:bg-yellow-700 rounded-full h-12 w-12 flex items-center justify-center shadow-lg"
          onClick={playAlertSound}
          title="Testar alerta sonoro"
        >
          <Bell size={24} />
          {orderCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {orderCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleMigrateData = async () => {
    if (!confirm("Esta operação irá migrar todos os dados locais para o Supabase. Os dados existentes no Supabase serão apagados. Deseja continuar?")) {
      return;
    }

    setIsMigrating(true);
    
    try {
      const success = await migrateDataToSupabase(
        categories,
        products,
        bairros.map(b => ({ nome: b.nome, taxa: b.taxa }))
      );

      if (success) {
        toast({
          title: "Migração concluída",
          description: "Todos os dados foram migrados com sucesso para o Supabase.",
        });
      } else {
        toast({
          title: "Erro na migração",
          description: "Ocorreu um erro durante a migração dos dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao migrar dados:", error);
      toast({
        title: "Erro na migração",
        description: "Ocorreu um erro durante a migração dos dados.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-fixed"
      style={{ 
        backgroundImage: "url('https://adegavm.com/bgs.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-4xl mx-auto min-h-screen bg-black/70 p-4">
        {isAuthenticated ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="w-40">
                <Logo />
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleMigrateData}
                  disabled={isMigrating}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrando...
                    </>
                  ) : (
                    "Migrar Dados para Supabase"
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </div>
            </div>
            
            <div className="mt-8">
              <h1 className="text-2xl font-bold text-white mb-6">Painel Administrativo</h1>
              
              <Tabs defaultValue="produtos" className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="produtos">Produtos</TabsTrigger>
                  <TabsTrigger value="categorias">Categorias</TabsTrigger>
                  <TabsTrigger value="bairros">Bairros</TabsTrigger>
                </TabsList>
                
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
            
            {/* Add the order alert component */}
            <OrderAlert />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
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
