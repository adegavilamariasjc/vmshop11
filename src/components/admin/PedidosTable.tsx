import React, { useEffect, useState } from 'react';
import { Printer, Eye, Check, Truck, ShoppingBag, Trash2, Clock } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import PedidoStatusBadge from './PedidoStatusBadge';
import { Pedido } from '@/hooks/usePedidosManager';
import { ScrollArea } from "@/components/ui/scroll-area";

interface PedidosTableProps {
  pedidos: Pedido[];
  onVisualizarPedido: (id: string) => void;
  onAtualizarStatus: (id: string, status: string) => void;
  onExcluirPedido: (id: string, codigo: string) => void;
  formatDateTime: (dateString: string) => string;
}

const PedidosTable: React.FC<PedidosTableProps> = ({
  pedidos,
  onVisualizarPedido,
  onAtualizarStatus,
  onExcluirPedido,
  formatDateTime
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const renderProductionTime = (pedido: Pedido) => {
    if (pedido.status !== 'preparando' || !pedido.timeInProduction) {
      return null;
    }
    
    const isWarning = pedido.timeInProduction >= 20;
    const isAlert = pedido.timeInProduction >= 30;
    
    return (
      <div className={`flex items-center ${isAlert ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-blue-400'}`}>
        <Clock size={16} className={`mr-1 ${isAlert ? 'animate-pulse' : ''}`} />
        <span>{pedido.timeInProduction}min</span>
      </div>
    );
  };
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        {pedidos.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            Nenhum pedido registrado.
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-mono">{pedido.codigo_pedido}</span>
                <div className="flex items-center gap-2">
                  {renderProductionTime(pedido)}
                  <PedidoStatusBadge status={pedido.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Cliente:</div>
                <div className="text-white">{pedido.cliente_nome}</div>
                
                <div className="text-gray-400">Bairro:</div>
                <div className="text-white">{pedido.cliente_bairro}</div>
                
                <div className="text-gray-400">Pagamento:</div>
                <div className="text-white">{pedido.forma_pagamento}</div>
                
                <div className="text-gray-400">Total:</div>
                <div className="text-white font-bold">R$ {pedido.total.toFixed(2)}</div>
                
                <div className="text-gray-400">Data:</div>
                <div className="text-white">{formatDateTime(pedido.data_criacao)}</div>
              </div>
              
              <div className="flex flex-wrap justify-between pt-2 border-t border-gray-700 mt-2 gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onVisualizarPedido(pedido.id)}
                  className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                  title="Ver detalhes"
                >
                  <Eye size={16} className="mr-1" />
                  Detalhes
                </Button>
                
                {pedido.status === 'pendente' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onAtualizarStatus(pedido.id, 'preparando')}
                    className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                  >
                    <ShoppingBag size={16} className="mr-1" />
                    Produção
                  </Button>
                )}
                
                {pedido.status === 'preparando' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onAtualizarStatus(pedido.id, 'em_deslocamento')}
                    className="text-orange-500 hover:text-orange-400 hover:bg-gray-700"
                  >
                    <Truck size={16} className="mr-1" />
                    Enviar
                  </Button>
                )}
                
                {pedido.status === 'em_deslocamento' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onAtualizarStatus(pedido.id, 'entregue')}
                    className="text-green-500 hover:text-green-400 hover:bg-gray-700"
                  >
                    <Check size={16} className="mr-1" />
                    Entregar
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onExcluirPedido(pedido.id, pedido.codigo_pedido)}
                  className="text-red-500 hover:text-red-400 hover:bg-gray-700"
                >
                  <Trash2 size={16} className="mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-700 w-full">
      <ScrollArea className="max-h-[calc(100vh-280px)]">
        <div className="w-full">
          <Table>
            <TableHeader className="bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableHead className="text-white" style={{ width: '100px' }}>Código</TableHead>
                <TableHead className="text-white" style={{ width: '150px' }}>Cliente</TableHead>
                <TableHead className="text-white hidden md:table-cell" style={{ width: '120px' }}>Local</TableHead>
                <TableHead className="text-white hidden lg:table-cell" style={{ width: '150px' }}>Pagamento</TableHead>
                <TableHead className="text-white text-right" style={{ width: '100px' }}>Total</TableHead>
                <TableHead className="text-white" style={{ width: '150px' }}>Status</TableHead>
                <TableHead className="text-white hidden md:table-cell" style={{ width: '150px' }}>Data/Hora</TableHead>
                <TableHead className="text-white text-right" style={{ width: '200px' }}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id} className="border-gray-700 hover:bg-gray-800">
                  <TableCell className="text-white font-mono">
                    {pedido.codigo_pedido}
                  </TableCell>
                  <TableCell className="text-white">
                    {pedido.cliente_nome}
                  </TableCell>
                  <TableCell className="text-white hidden md:table-cell">
                    {pedido.cliente_bairro}
                  </TableCell>
                  <TableCell className="text-white hidden lg:table-cell">
                    {pedido.forma_pagamento}
                  </TableCell>
                  <TableCell className="text-white text-right">
                    R$ {pedido.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="">
                    <div className="flex items-center gap-2">
                      {renderProductionTime(pedido)}
                      <PedidoStatusBadge status={pedido.status} />
                    </div>
                  </TableCell>
                  <TableCell className="text-white text-sm hidden md:table-cell">
                    {formatDateTime(pedido.data_criacao)}
                  </TableCell>
                  <TableCell className="text-right p-1">
                    <div className="flex justify-end gap-1 flex-nowrap">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onVisualizarPedido(pedido.id)}
                        className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                        title="Ver detalhes"
                      >
                        <Eye size={18} />
                      </Button>
                      {pedido.status === 'pendente' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onAtualizarStatus(pedido.id, 'preparando')}
                          className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                          title="Marcar como em produção"
                        >
                          <ShoppingBag size={18} />
                        </Button>
                      )}
                      {pedido.status === 'preparando' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onAtualizarStatus(pedido.id, 'em_deslocamento')}
                          className="text-orange-500 hover:text-orange-400 hover:bg-gray-700"
                          title="Marcar como em deslocamento"
                        >
                          <Truck size={18} />
                        </Button>
                      )}
                      {pedido.status === 'em_deslocamento' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onAtualizarStatus(pedido.id, 'entregue')}
                          className="text-green-500 hover:text-green-400 hover:bg-gray-700"
                          title="Marcar como entregue"
                        >
                          <Check size={18} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onVisualizarPedido(pedido.id)}
                        className="text-purple-500 hover:text-purple-400 hover:bg-gray-700 hidden sm:flex"
                        title="Imprimir pedido"
                      >
                        <Printer size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onExcluirPedido(pedido.id, pedido.codigo_pedido)}
                        className="text-red-500 hover:text-red-400 hover:bg-gray-700"
                        title="Excluir pedido"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pedidos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-6">
                    Nenhum pedido registrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PedidosTable;
