import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PedidoCounter {
  id: string;
  codigo_pedido: string;
  data_criacao: string;
  tipo: 'delivery' | 'balcao';
  taxa_app: number;
}

export const AppCounterManager = () => {
  const [pedidos, setPedidos] = useState<PedidoCounter[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchPedidos = async () => {
    setIsLoading(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));

      const { data, error } = await supabase
        .from('pedidos')
        .select('id, codigo_pedido, data_criacao, cliente_bairro')
        .gte('data_criacao', startDate.toISOString())
        .lte('data_criacao', endDate.toISOString())
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      const pedidosFormatted: PedidoCounter[] = (data || []).map(p => ({
        id: p.id,
        codigo_pedido: p.codigo_pedido,
        data_criacao: p.data_criacao,
        tipo: p.cliente_bairro === 'BALCAO' ? 'balcao' : 'delivery',
        taxa_app: 0.50
      }));

      setPedidos(pedidosFormatted);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [selectedMonth]);

  const totalDelivery = pedidos.filter(p => p.tipo === 'delivery').length;
  const totalBalcao = pedidos.filter(p => p.tipo === 'balcao').length;
  const totalPedidos = pedidos.length;
  const totalTaxa = totalPedidos * 0.50;

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    
    return options;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Contador de Pedidos - Taxa do Aplicativo</h2>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px] bg-white/10 text-white border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getMonthOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Total Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalDelivery}</p>
            <p className="text-sm text-white/70">R$ {(totalDelivery * 0.50).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Total Balcão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalBalcao}</p>
            <p className="text-sm text-white/70">R$ {(totalBalcao * 0.50).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalPedidos}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-600/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm">Total a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">R$ {totalTaxa.toFixed(2)}</p>
            <p className="text-sm text-white/70">Taxa: R$ 0,50/pedido</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Detalhamento dos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-white/70 text-center py-8">Carregando...</p>
          ) : pedidos.length === 0 ? (
            <p className="text-white/70 text-center py-8">Nenhum pedido encontrado neste mês</p>
          ) : (
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white">Código</TableHead>
                    <TableHead className="text-white">Data/Hora</TableHead>
                    <TableHead className="text-white">Tipo</TableHead>
                    <TableHead className="text-white text-right">Taxa App</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id} className="border-white/20 hover:bg-white/5">
                      <TableCell className="text-white font-medium">
                        {pedido.codigo_pedido}
                      </TableCell>
                      <TableCell className="text-white/90">
                        {format(new Date(pedido.data_criacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={pedido.tipo === 'delivery' ? 'default' : 'secondary'}
                          className={pedido.tipo === 'delivery' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}
                        >
                          {pedido.tipo === 'delivery' ? 'Delivery' : 'Balcão'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/90 text-right font-medium">
                        R$ {pedido.taxa_app.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
