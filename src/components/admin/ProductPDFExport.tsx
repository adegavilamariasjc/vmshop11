import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchAllProducts } from '@/lib/supabase/products';
import jsPDF from 'jspdf';

export const ProductPDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    
    try {
      const products = await fetchAllProducts();

      if (products.length === 0) {
        toast({
          title: "Nenhum produto encontrado",
          description: "Não há produtos para exportar.",
          variant: "destructive"
        });
        return;
      }

      // Create PDF
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Lista de Produtos', 105, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 28, { align: 'center' });
      
      // Headers
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Produto', 20, 45);
      doc.text('Preço', 150, 45);
      
      // Line under headers
      doc.line(20, 47, 190, 47);
      
      // Products
      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      let yPosition = 55;
      
      products.forEach((product, index) => {
        // Check if need new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(product.name, 20, yPosition);
        doc.text(`R$ ${product.price.toFixed(2).replace('.', ',')}`, 150, yPosition);
        yPosition += 8;
      });
      
      // Save PDF
      doc.save(`produtos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);

      toast({
        title: "PDF gerado com sucesso",
        description: `${products.length} produtos exportados!`
      });

    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao gerar o PDF dos produtos.",
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
      <FileText className="mr-2 h-4 w-4" />
      {isExporting ? 'Gerando PDF...' : 'Exportar Produtos (PDF)'}
    </Button>
  );
};
