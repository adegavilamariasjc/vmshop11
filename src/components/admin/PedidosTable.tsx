
import React from 'react';
import { Printer, Eye, Check, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import PedidoStatusBadge from './PedidoStatusBadge';
import { Pedido } from '@/hooks/usePedidosManager';

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
  return (
    <div className="bg-black/50 rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-800">
          <TableRow>
            <TableHead className="text-white">Código</TableHead>
            <TableHead className="text-white">Cliente</TableHead>
            <TableHead className="text-white">Local</TableHead>
            <TableHead className="text-white">Pagamento</TableHead>
            <TableHead className="text-white text-right">Total</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Data/Hora</TableHead>
            <TableHead className="text-white text-right">Ações</TableHead>
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
              <TableCell className="text-white">
                {pedido.cliente_bairro}
              </TableCell>
              <TableCell className="text-white">
                {pedido.forma_pagamento}
              </TableCell>
              <TableCell className="text-white text-right">
                R$ {pedido.total.toFixed(2)}
              </TableCell>
              <TableCell>
                <PedidoStatusBadge status={pedido.status} />
              </TableCell>
              <TableCell className="text-white text-sm">
                {formatDateTime(pedido.data_criacao)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onVisualizarPedido(pedido.id)}
                    className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                    title="Ver detalhes"
                  >
                    <Eye size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onAtualizarStatus(pedido.id, 'preparando')}
                    disabled={pedido.status !== 'pendente'}
                    className="text-yellow-500 hover:text-yellow-400 hover:bg-gray-700"
                    title="Marcar como preparando"
                  >
                    <Check size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onAtualizarStatus(pedido.id, 'entregue')}
                    disabled={pedido.status !== 'preparando'}
                    className="text-green-500 hover:text-green-400 hover:bg-gray-700"
                    title="Marcar como entregue"
                  >
                    <Check size={18} className="mr-1" />
                    <Check size={18} className="-ml-2" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onVisualizarPedido(pedido.id)}
                    className="text-purple-500 hover:text-purple-400 hover:bg-gray-700"
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
  );
};

export default PedidosTable;
