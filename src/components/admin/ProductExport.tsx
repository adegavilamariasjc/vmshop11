import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchAllProducts, fetchCategories } from '@/lib/supabase';
import type { SupabaseProduct, SupabaseCategory } from '@/lib/supabase/types';

// Categorias excluídas da exportação para o novo sistema
const EXCLUDED_CATEGORIES = [
  'copão', 'copao', 'combo', 'caipirinha', 'batida', 'drink 43',
  'drinks 43', 'drink gourmet', 'drinks gourmet', 'dose', 'doses'
];

const isCategoryExcluded = (categoryName: string): boolean => {
  const normalized = categoryName.toLowerCase().trim();
  return EXCLUDED_CATEGORIES.some(excluded => 
    normalized.includes(excluded) || excluded.includes(normalized)
  );
};

const convertToCSV = (products: SupabaseProduct[], categories: SupabaseCategory[]) => {
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<number, string>);

  const headers = [
    'ID', 'Nome do Produto', 'Descrição', 'Preço (R$)', 'Custo (R$)',
    'Margem (%)', 'Categoria', 'Estoque', 'Estoque Mínimo', 'Unidade', 'Status'
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
    product.is_paused ? 'Pausado' : 'Ativo'
  ]);

  return [headers, ...rows].map(row => row.join(';')).join('\n');
};

// Exportação completa (todos os produtos)
const ProductExport: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const [products, categories] = await Promise.all([fetchAllProducts(), fetchCategories()]);
      if (products.length === 0) {
        toast({ title: "Nenhum produto encontrado", description: "Não há produtos para exportar.", variant: "destructive" });
        return;
      }
      const csvContent = '\uFEFF' + convertToCSV(products, categories);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `produtos_completo_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "CSV exportado!", description: `${products.length} produtos exportados.` });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({ title: "Erro na exportação", description: "Ocorreu um erro ao exportar.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Exportando...' : 'Exportar CSV'}
    </Button>
  );
};

// Exportação filtrada para o novo sistema (sem copão, combos, caipirinhas, batidas, drinks, doses)
export const ProductExportFiltered: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const [allProducts, categories] = await Promise.all([fetchAllProducts(), fetchCategories()]);

      const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {} as Record<number, string>);

      // Filtrar excluindo categorias self-service
      const filteredProducts = allProducts.filter(p => {
        const catName = categoryMap[p.category_id || 0] || '';
        return !isCategoryExcluded(catName);
      });

      if (filteredProducts.length === 0) {
        toast({ title: "Nenhum produto encontrado", description: "Não há produtos após filtro.", variant: "destructive" });
        return;
      }

      const excludedCount = allProducts.length - filteredProducts.length;
      const csvContent = '\uFEFF' + convertToCSV(filteredProducts, categories);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `produtos_novo_sistema_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: "CSV Novo Sistema exportado!",
        description: `${filteredProducts.length} produtos exportados (${excludedCount} self-service excluídos).`,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({ title: "Erro na exportação", description: "Ocorreu um erro ao exportar.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-green-900/30">
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      {isExporting ? 'Exportando...' : 'CSV Novo Sistema'}
    </Button>
  );
};

export default ProductExport;