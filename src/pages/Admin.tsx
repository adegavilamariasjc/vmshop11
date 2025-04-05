
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AdminLogin from '../components/admin/AdminLogin';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import BairroManager from '../components/admin/BairroManager';
import Logo from '../components/Logo';
import { migrateStaticDataToSupabase, categories, products, bairros } from '../data/products';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDataMigrated, setIsDataMigrated] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if data migration has been done before
    const migrationDone = localStorage.getItem('dataMigrationComplete');
    setIsDataMigrated(migrationDone === 'true');
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

  const handleMigrateData = async () => {
    setIsMigrating(true);
    try {
      await migrateStaticDataToSupabase();
      setIsDataMigrated(true);
      localStorage.setItem('dataMigrationComplete', 'true');
      toast({
        title: "Migração realizada com sucesso",
        description: "Os dados foram migrados para o Supabase",
      });
    } catch (error) {
      console.error("Error migrating data:", error);
      toast({
        title: "Erro na migração",
        description: "Não foi possível migrar os dados. Por favor, tente novamente.",
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
                {!isDataMigrated && (
                  <Button 
                    variant="outline" 
                    onClick={handleMigrateData} 
                    disabled={isMigrating}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                  >
                    {isMigrating ? "Migrando dados..." : "Migrar dados estáticos"}
                  </Button>
                )}
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
              
              {!isDataMigrated && (
                <div className="bg-yellow-600/20 border border-yellow-600 p-4 rounded-md mb-6">
                  <h2 className="text-yellow-500 font-bold mb-2">Migração necessária</h2>
                  <p className="text-white mb-4">
                    Para começar a usar o painel administrativo com o banco de dados real, 
                    primeiro é necessário migrar os dados estáticos para o Supabase.
                  </p>
                  <Button 
                    onClick={handleMigrateData} 
                    disabled={isMigrating}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {isMigrating ? "Migrando dados..." : "Migrar dados agora"}
                  </Button>
                </div>
              )}
              
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
