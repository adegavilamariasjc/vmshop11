
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Truck, Check, X } from 'lucide-react';

interface OrderStatusControlsProps {
  currentStatus: string;
  onUpdateStatus: (status: string) => void;
}

const OrderStatusControls: React.FC<OrderStatusControlsProps> = ({ currentStatus, onUpdateStatus }) => {
  return (
    <div className="bg-black/40 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-3">Status do Pedido</h3>
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={currentStatus === 'pendente' ? 'default' : 'outline'}
          className={`font-medium ${currentStatus === 'pendente' ? 'bg-yellow-600 hover:bg-yellow-700 text-black' : 'text-white'}`}
          onClick={() => onUpdateStatus('pendente')}
        >
          Pendente
        </Button>
        <Button 
          variant={currentStatus === 'preparando' ? 'default' : 'outline'}
          className={`font-medium ${currentStatus === 'preparando' ? 'bg-blue-600 hover:bg-blue-700 text-black' : 'text-white'}`}
          onClick={() => onUpdateStatus('preparando')}
        >
          <ShoppingBag size={16} className="mr-1" />
          Em Produção
        </Button>
        <Button 
          variant={currentStatus === 'em_deslocamento' ? 'default' : 'outline'}
          className={`font-medium ${currentStatus === 'em_deslocamento' ? 'bg-orange-600 hover:bg-orange-700 text-black' : 'text-white'}`}
          onClick={() => onUpdateStatus('em_deslocamento')}
        >
          <Truck size={16} className="mr-1" />
          Em Deslocamento
        </Button>
        <Button 
          variant={currentStatus === 'entregue' ? 'default' : 'outline'}
          className={`font-medium ${currentStatus === 'entregue' ? 'bg-green-600 hover:bg-green-700 text-black' : 'text-white'}`}
          onClick={() => onUpdateStatus('entregue')}
        >
          <Check size={16} className="mr-1" />
          Entregue
        </Button>
        <Button 
          variant={currentStatus === 'cancelado' ? 'default' : 'outline'}
          className={`font-medium ${currentStatus === 'cancelado' ? 'bg-red-600 hover:bg-red-700 text-black' : 'text-white'}`}
          onClick={() => onUpdateStatus('cancelado')}
        >
          <X size={16} className="mr-1" />
          Cancelado
        </Button>
      </div>
    </div>
  );
};

export default OrderStatusControls;
