
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect } from 'react';
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { setupGlobalTracking, trackPageVisit } from "./utils/trackPageVisit";

// Create the QueryClient outside of the component
const queryClient = new QueryClient();

// Componente para rastrear mudanças de rota
const RouteTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Rastrear a mudança de página
    trackPageVisit(location.pathname, 'navigation');
  }, [location]);
  
  return null;
};

const App = () => {
  // Configurar rastreamento global quando o app é carregado
  useEffect(() => {
    setupGlobalTracking();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
