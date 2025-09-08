import React from 'react';
import { Button } from '@/components/ui/button';
import Logo from '../Logo';
import MotoboyPedidosManager from './MotoboyPedidosManager';

interface MotoboyDashboardProps {
  onLogout: () => void;
}

const MotoboyDashboard: React.FC<MotoboyDashboardProps> = ({ onLogout }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="w-40">
          <Logo />
        </div>
        <div>
          <Button 
            variant="destructive" 
            onClick={onLogout}
            className="text-black font-medium"
          >
            Sair
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <h1 className="text-2xl font-bold text-white mb-6">Painel de Entregas</h1>
        <div className="bg-black/50 p-4 rounded-md">
          <MotoboyPedidosManager />
        </div>
      </div>
    </>
  );
};

export default MotoboyDashboard;