import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SalesExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const convertToCSV = (salesData: any[]): string => {
    const headers = ['Produto', 'Quantidade Total Vendida', 'Valor Unitário Médio', 'Faturamento Total'];
    const rows = salesData.map(item => [
      item.nome,
      item.quantidadeTotal,
      `R$ ${item.precoMedio.toFixed(2).replace('.', ',')}`,
      `R$ ${item.faturamentoTotal.toFixed(2).replace('.', ',')}`
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    return csvContent;
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    
    try {
      // Fetch all pedidos
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('itens, data_criacao')
        .order('data_criacao', { ascending: true });

      if (error) throw error;

      if (!pedidos || pedidos.length === 0) {
        toast({
          title: "Nenhum pedido encontrado",
          description: "Não há dados de vendas para exportar.",
          variant: "destructive"
        });
        return;
      }

      // Aggregate products from all orders
      const productMap = new Map<string, { qty: number, totalPrice: number, count: number }>();

      pedidos.forEach(pedido => {
        const itens = pedido.itens as any[];
        if (Array.isArray(itens)) {
          itens.forEach((item: any) => {
            const key = item.name;
            const existing = productMap.get(key) || { qty: 0, totalPrice: 0, count: 0 };
            productMap.set(key, {
              qty: existing.qty + (item.qty || 0),
              totalPrice: existing.totalPrice + ((item.price || 0) * (item.qty || 0)),
              count: existing.count + 1
            });
          });
        }
      });

      // Convert to array and sort by quantity
      const salesData = Array.from(productMap.entries())
        .map(([nome, data]) => ({
          nome,
          quantidadeTotal: data.qty,
          precoMedio: data.totalPrice / data.qty,
          faturamentoTotal: data.totalPrice
        }))
        .sort((a, b) => b.quantidadeTotal - a.quantidadeTotal);

      // Generate CSV
      const csvContent = convertToCSV(salesData);
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const firstOrderDate = new Date(pedidos[0].data_criacao).toLocaleDateString('pt-BR');
      const today = new Date().toLocaleDateString('pt-BR');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `vendas_produtos_${firstOrderDate.replace(/\//g, '-')}_ate_${today.replace(/\//g, '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: `${salesData.length} produtos exportados com sucesso!`
      });

    } catch (error) {
      console.error('Erro ao exportar vendas:', error);
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao exportar os dados de vendas.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full"
      variant="outline"
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? 'Exportando...' : 'Exportar Vendas de Produtos'}
    </Button>
  );
};
