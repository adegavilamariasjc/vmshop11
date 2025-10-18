
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Trash2 } from 'lucide-react';

interface OrderActionsProps {
  onPrint: () => void;
  onDelete: () => void;
  isPrinting: boolean;
  isDeleting: boolean;
}

const OrderActions: React.FC<OrderActionsProps> = ({ 
  onPrint, 
  onDelete, 
  isPrinting, 
  isDeleting 
}) => {
  return (
    <div className="bg-black/40 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-3">Ações</h3>
      <div className="flex flex-col gap-2">
        <Button 
          onClick={onPrint}
          disabled={isPrinting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
        >
          <Printer size={16} className="mr-2" />
          Imprimir Comanda
        </Button>
        
        <Button 
          onClick={onDelete}
          disabled={isDeleting}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
        >
          <Trash2 size={16} className="mr-2" />
          Excluir Pedido
        </Button>
      </div>
    </div>
  );
};

export default OrderActions;
