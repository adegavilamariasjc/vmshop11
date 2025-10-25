import React, { useEffect, useState } from 'react';
import { Printer, Eye, Check, Truck, ShoppingBag, Trash2, Clock, UserPlus } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import PedidoStatusBadge from './PedidoStatusBadge';
import { Pedido } from '@/hooks/usePedidosManager';
import DelivererSelectModal from './DelivererSelectModal';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PedidosTableProps {
  pedidos: Pedido[];
  onVisualizarPedido: (id: string) => void;
  onAtualizarStatus: (id: string, status: string) => void;
  onExcluirPedido: (id: string, codigo: string) => void;
  formatDateTime: (dateString: string) => string;
  onRefresh?: () => void;
}

const ITEMS_PER_PAGE = 10;

const PedidosTable: React.FC<PedidosTableProps> = ({
  pedidos,
  onVisualizarPedido,
  onAtualizarStatus,
  onExcluirPedido,
  formatDateTime,
  onRefresh
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [delivererModalOpen, setDelivererModalOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const totalPages = Math.ceil(pedidos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPedidos = pedidos.slice(startIndex, endIndex);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleAssignDeliverer = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId);
    setDelivererModalOpen(true);
  };

  const handleConfirmDeliverer = async (deliverer: string) => {
    if (!selectedPedidoId) return;

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ entregador: deliverer })
        .eq('id', selectedPedidoId);

      if (error) throw error;

      // Som de notificação será tocado automaticamente na tela do motoboy
      // quando ele detectar o novo pedido atribuído via realtime
      
      toast({
        title: 'Motoboy atribuído',
        description: `${deliverer} foi atribuído ao pedido com sucesso.`,
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao atribuir motoboy:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atribuir o motoboy.',
        variant: 'destructive',
      });
    }
  };

  const isDeliveryOrder = (pedido: Pedido) => {
    // Um pedido é de delivery se o bairro não for "BALCAO" (case insensitive)
    const bairro = (pedido.cliente_bairro || '').trim().toUpperCase();
    const isBalcao = bairro === 'BALCAO' || bairro === 'BALCÃO' || bairro.includes('RETIRADA');
    
    return !isBalcao;
  };
  
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
        {currentPedidos.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            Nenhum pedido registrado.
          </div>
        ) : (
          <>
            {currentPedidos.map((pedido) => (
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
                  <div className="text-white">{pedido.cliente_nome || 'Não informado'}</div>
                  
                  <div className="text-gray-400">Bairro:</div>
                  <div className="text-white">{pedido.cliente_bairro || 'Não informado'}</div>
                  
                  <div className="text-gray-400">Pagamento:</div>
                  <div className="text-white">{pedido.forma_pagamento || 'Não informado'}</div>
                  
                  <div className="text-gray-400">Total:</div>
                  <div className="text-white font-bold">
                    R$ {(typeof pedido.total === 'number' && !isNaN(pedido.total)) ? pedido.total.toFixed(2) : '0.00'}
                  </div>
                  
                  <div className="text-gray-400">Data:</div>
                  <div className="text-white">{formatDateTime(pedido.data_criacao)}</div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onVisualizarPedido(pedido.id)}
                    className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                  >
                    <Eye size={16} className="mr-1" />
                    Detalhes
                  </Button>
                  
                  {isDeliveryOrder(pedido) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAssignDeliverer(pedido.id)}
                      className="text-purple-500 hover:text-purple-400 hover:bg-gray-700"
                    >
                      <UserPlus size={16} className="mr-1" />
                      Motoboy
                    </Button>
                  )}
                  
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
            ))}
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-white">
                    Página {currentPage} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={handleNextPage} 
                    disabled={currentPage >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <DelivererSelectModal 
        open={delivererModalOpen}
        onOpenChange={setDelivererModalOpen}
        onConfirm={handleConfirmDeliverer}
      />
      
      <div className="rounded-md border border-gray-700 w-full">
        <ScrollArea className="max-h-[calc(100vh-280px)]">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-gray-800 sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-white w-[10%]">Código</TableHead>
              <TableHead className="text-white w-[15%]">Cliente</TableHead>
              <TableHead className="text-white hidden md:table-cell w-[10%]">Local</TableHead>
              <TableHead className="text-white hidden lg:table-cell w-[12%]">Pagamento</TableHead>
              <TableHead className="text-white text-right w-[8%]">Total</TableHead>
              <TableHead className="text-white w-[12%]">Status</TableHead>
              <TableHead className="text-white hidden md:table-cell w-[13%]">Data/Hora</TableHead>
              <TableHead className="text-white text-center w-[20%]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPedidos.map((pedido) => (
              <TableRow key={pedido.id} className="border-gray-700 hover:bg-gray-800">
                <TableCell className="text-white font-mono">
                  {pedido.codigo_pedido}
                </TableCell>
                <TableCell className="text-white">
                  {pedido.cliente_nome || 'Não informado'}
                </TableCell>
                <TableCell className="text-white hidden md:table-cell">
                  {pedido.cliente_bairro || 'Não informado'}
                </TableCell>
                <TableCell className="text-white hidden lg:table-cell">
                  {pedido.forma_pagamento || 'Não informado'}
                </TableCell>
                <TableCell className="text-white text-right">
                  R$ {(typeof pedido.total === 'number' && !isNaN(pedido.total)) ? pedido.total.toFixed(2) : '0.00'}
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
                <TableCell>
                  <div className="flex flex-wrap justify-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onVisualizarPedido(pedido.id)}
                      className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                      title="Ver detalhes"
                    >
                      <Eye size={18} />
                    </Button>
                    
                    {isDeliveryOrder(pedido) && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleAssignDeliverer(pedido.id)}
                        className="text-purple-500 hover:text-purple-400 hover:bg-gray-700"
                        title="Atribuir motoboy"
                      >
                        <UserPlus size={18} />
                      </Button>
                    )}
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
            {currentPedidos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-6">
                  Nenhum pedido registrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="border-t border-gray-700 p-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 py-2 text-white">
                Página {currentPage} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={handleNextPage} 
                disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      </div>
    </>
  );
};

export default PedidosTable;
