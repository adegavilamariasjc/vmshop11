import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { Pedido } from '@/hooks/usePedidosManager';

interface MotoboyPedidosTableProps {
  pedidos: Pedido[];
  onAtualizarStatus: (id: string, status: string) => void;
  formatDateTime: (dateString: string) => string;
}

const MotoboyPedidosTable: React.FC<MotoboyPedidosTableProps> = ({
  pedidos,
  onAtualizarStatus,
  formatDateTime
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(pedidos.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPedidos = pedidos.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { variant: 'destructive' as const, icon: Package, text: 'Pendente' },
      'preparando': { variant: 'default' as const, icon: Clock, text: 'Preparando' },
      'pronto': { variant: 'secondary' as const, icon: CheckCircle, text: 'Pronto' },
      'entregue': { variant: 'default' as const, icon: CheckCircle, text: 'Entregue' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.text}
      </Badge>
    );
  };

  const renderProductionTime = (pedido: Pedido) => {
    if (pedido.status !== 'preparando' || !pedido.timeInProduction) return null;

    const minutes = pedido.timeInProduction;
    const isOverdue = minutes > 30;

    return (
      <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-yellow-400'}`}>
        {minutes}min em produção
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {currentPedidos.map((pedido) => (
          <Card key={pedido.id} className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">#{pedido.codigo_pedido}</CardTitle>
                  <p className="text-sm text-gray-300 truncate">{pedido.cliente_nome}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(pedido.status)}
                  {renderProductionTime(pedido)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Bairro:</p>
                  <p className="truncate">{pedido.cliente_bairro}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total:</p>
                  <p className="font-medium">R$ {pedido.total?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Pagamento:</p>
                  <p className="truncate">{pedido.forma_pagamento}</p>
                </div>
                <div>
                  <p className="text-gray-400">Data:</p>
                  <p className="text-xs">{formatDateTime(pedido.data_criacao)}</p>
                </div>
              </div>
              {pedido.status === 'pronto' && (
                <div className="mt-4">
                  <Button
                    onClick={() => onAtualizarStatus(pedido.id, 'entregue')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Marcar como Entregue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Paginação Mobile */}
        <div className="flex justify-between items-center mt-4">
          <Button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            variant="outline"
            className="text-black"
            size="sm"
          >
            Anterior
          </Button>
          <span className="text-white text-sm">
            {currentPage}/{Math.ceil(pedidos.length / itemsPerPage)}
          </span>
          <Button 
            onClick={handleNextPage} 
            disabled={currentPage >= Math.ceil(pedidos.length / itemsPerPage)}
            variant="outline"
            className="text-black"
            size="sm"
          >
            Próximo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300 min-w-[80px]">Código</TableHead>
              <TableHead className="text-gray-300 min-w-[120px]">Cliente</TableHead>
              <TableHead className="text-gray-300 min-w-[100px]">Bairro</TableHead>
              <TableHead className="text-gray-300 min-w-[120px]">Status</TableHead>
              <TableHead className="text-gray-300 min-w-[100px]">Pagamento</TableHead>
              <TableHead className="text-gray-300 min-w-[80px]">Total</TableHead>
              <TableHead className="text-gray-300 min-w-[120px]">Data</TableHead>
              <TableHead className="text-gray-300 min-w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPedidos.map((pedido) => (
              <TableRow key={pedido.id} className="border-gray-700 hover:bg-gray-700/50">
                <TableCell className="text-white font-medium">
                  #{pedido.codigo_pedido}
                </TableCell>
                <TableCell className="text-white max-w-[120px] truncate">{pedido.cliente_nome}</TableCell>
                <TableCell className="text-white max-w-[100px] truncate">{pedido.cliente_bairro}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(pedido.status)}
                    {renderProductionTime(pedido)}
                  </div>
                </TableCell>
                <TableCell className="text-white max-w-[100px] truncate">{pedido.forma_pagamento}</TableCell>
                <TableCell className="text-white">R$ {pedido.total?.toFixed(2) || '0.00'}</TableCell>
                <TableCell className="text-white text-xs">{formatDateTime(pedido.data_criacao)}</TableCell>
                <TableCell>
                  {pedido.status === 'pronto' && (
                    <Button
                      onClick={() => onAtualizarStatus(pedido.id, 'entregue')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Entregue
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="text-white text-sm">
          Mostrando {startIndex + 1}-{Math.min(endIndex, pedidos.length)} de {pedidos.length} pedidos
        </span>
        <div className="flex gap-2">
          <Button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            variant="outline"
            className="text-black"
            size="sm"
          >
            Anterior
          </Button>
          <Button 
            onClick={handleNextPage} 
            disabled={currentPage >= Math.ceil(pedidos.length / itemsPerPage)}
            variant="outline"
            className="text-black"
            size="sm"
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MotoboyPedidosTable;