import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchAllProducts, fetchCategories } from '@/lib/supabase';
import type { SupabaseProduct, SupabaseCategory } from '@/lib/supabase/types';

const ProductExport: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (products: SupabaseProduct[], categories: SupabaseCategory[]) => {
    // Create category map for faster lookups
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<number, string>);

    // CSV Headers
    const headers = [
      'ID',
      'Nome do Produto',
      'Preço (R$)',
      'Categoria',
      'Status',
      'Ordem de Exibição',
      'Data de Criação'
    ];

    // Convert products to CSV rows
    const rows = products.map(product => [
      product.id,
      `"${product.name}"`, // Wrap in quotes to handle commas
      product.price.toString().replace('.', ','), // Brazilian decimal format
      `"${categoryMap[product.category_id || 0] || 'Sem Categoria'}"`,
      product.is_paused ? 'Pausado' : 'Ativo',
      product.order_index || 0,
      new Date().toLocaleDateString('pt-BR')
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(';')) // Use semicolon for Brazilian CSV format
      .join('\n');

    return csvContent;
  };

  const generateAIInstructions = () => {
    return `
INSTRUÇÕES PARA ANÁLISE DE DADOS - PRODUTOS DA ADEGA
====================================================

Este arquivo CSV contém todos os produtos cadastrados no sistema da adega.

ESTRUTURA DOS DADOS:
- ID: Identificador único do produto
- Nome do Produto: Nome completo do produto
- Preço (R$): Valor em reais (formato brasileiro com vírgula)
- Categoria: Categoria do produto
- Status: Ativo ou Pausado
- Ordem de Exibição: Posição do produto na lista
- Data de Criação: Data de exportação dos dados

SUGESTÕES DE ANÁLISES PARA IA:

1. ANÁLISE DE PREÇOS:
   - Identificar produtos com preços muito acima ou abaixo da média
   - Sugerir ajustes de preços baseados na categoria
   - Detectar possíveis erros de digitação nos preços

2. ANÁLISE DE CATEGORIAS:
   - Verificar distribuição de produtos por categoria
   - Identificar categorias com poucos produtos
   - Sugerir reorganização de categorias

3. ANÁLISE DE NOMES:
   - Identificar nomes duplicados ou muito similares
   - Sugerir padronização de nomenclatura
   - Detectar possíveis erros de digitação

4. ANÁLISE DE STATUS:
   - Produtos pausados há muito tempo
   - Sugestões de reativação ou remoção

5. OTIMIZAÇÃO DE VENDAS:
   - Sugerir produtos em promoção
   - Identificar produtos premium para destaque
   - Análise de mix de produtos

COMO USAR:
1. Importe este arquivo CSV em sua ferramenta de análise preferida
2. Use as colunas para criar gráficos e relatórios
3. Aplique as análises sugeridas acima
4. Gere relatórios com recomendações específicas

Data de exportação: ${new Date().toLocaleString('pt-BR')}
`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      toast({
        title: "Exportando dados",
        description: "Coletando informações dos produtos...",
      });

      // Fetch all products and categories
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

      // Generate CSV content
      const csvContent = convertToCSV(products, categories);
      const instructions = generateAIInstructions();

      // Create and download CSV file
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const csvLink = document.createElement('a');
      csvLink.href = csvUrl;
      csvLink.download = `produtos_adega_${new Date().toISOString().split('T')[0]}.csv`;
      csvLink.click();
      URL.revokeObjectURL(csvUrl);

      // Create and download instructions file
      const instructionsBlob = new Blob([instructions], { type: 'text/plain;charset=utf-8;' });
      const instructionsUrl = URL.createObjectURL(instructionsBlob);
      const instructionsLink = document.createElement('a');
      instructionsLink.href = instructionsUrl;
      instructionsLink.download = `instrucoes_analise_ia_${new Date().toISOString().split('T')[0]}.txt`;
      instructionsLink.click();
      URL.revokeObjectURL(instructionsUrl);

      toast({
        title: "Exportação concluída",
        description: `${products.length} produtos exportados com sucesso! Arquivos CSV e de instruções baixados.`,
      });

    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados dos produtos.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900/50 rounded-md">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Exportar Dados para Análise</h3>
      </div>
      
      <p className="text-gray-300 text-sm">
        Exporte todos os produtos em formato CSV junto com instruções detalhadas para análise por IA.
        Útil para análise de preços, categorização e otimização do catálogo.
      </p>

      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-fit"
        variant="outline"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exportando...' : 'Exportar CSV + Instruções IA'}
      </Button>
    </div>
  );
};

export default ProductExport;