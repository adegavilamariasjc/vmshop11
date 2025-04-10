
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PedidoStatusBadgeProps {
  status: string;
}

const PedidoStatusBadge: React.FC<PedidoStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pendente':
      return <Badge className="bg-yellow-600 text-white">Pendente</Badge>;
    case 'preparando':
      return <Badge className="bg-blue-600 text-white">Preparando</Badge>;
    case 'entregue':
      return <Badge className="bg-green-600 text-white">Entregue</Badge>;
    case 'cancelado':
      return <Badge className="bg-red-600 text-white">Cancelado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default PedidoStatusBadge;
