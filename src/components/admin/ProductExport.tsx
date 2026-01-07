import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchAllProducts, fetchCategories } from '@/lib/supabase';
import type { SupabaseProduct, SupabaseCategory } from '@/lib/supabase/types';

const ProductExport: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (products: SupabaseProduct[], categories: SupabaseCategory[]) => {
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<number, string>);

    const headers = [
      'ID',
      'Nome do Produto',
      'Descrição',
      'Preço (R$)',
      'Custo (R$)',
      'Margem (%)',
      'Categoria',
      'Estoque',
      'Estoque Mínimo',
      'Unidade',
      'Status',
      'Ordem'
    ];

    const rows = products.map(product => [
      product.id,
      `"${product.name.replace(/"/g, '""')}"`,
      `"${(product.description || '').replace(/"/g, '""')}"`,
      product.price.toFixed(2).replace('.', ','),
      product.custo_compra.toFixed(2).replace('.', ','),
      product.margem_lucro.toFixed(1).replace('.', ','),
      `"${categoryMap[product.category_id || 0] || 'Sem Categoria'}"`,
      product.quantidade_estoque,
      product.estoque_minimo,
      product.unidade_medida,
      product.is_paused ? 'Pausado' : 'Ativo',
      product.order_index || 0
    ]);

    return [headers, ...rows].map(row => row.join(';')).join('\n');
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      const [products, categories] = await Promise.all([
        fetchAllProducts(),
        fetchCategories()
      ]);

      if (products.length === 0) {
        toast({
          title: "Nenhum produto encontrado",
          description: "Não há produtos para exportar.",
          variant: "destructive",
        });
        return;
      }

      const csvContent = '\uFEFF' + convertToCSV(products, categories); // BOM for Excel UTF-8
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `produtos_categorias_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "CSV exportado!",
        description: `${products.length} produtos exportados com sucesso.`,
      });

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os produtos.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Exportando...' : 'Exportar CSV'}
    </Button>
  );
};

export default ProductExport;