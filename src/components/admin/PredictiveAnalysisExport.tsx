import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

interface ProductSales {
  name: string;
  totalQty: number;
  totalRevenue: number;
  avgPrice: number;
  orderCount: number;
  frequency: number;
}

interface PeriodAnalysis {
  startDate: Date;
  endDate: Date;
  totalOrders: number;
  totalRevenue: number;
  avgTicket: number;
  products: ProductSales[];
  paymentMethods: Record<string, number>;
  neighborhoods: Record<string, number>;
  dayOfWeek: Record<string, number>;
  hourDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export const PredictiveAnalysisExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { toast } = useToast();

  const analyzeOrders = (orders: any[]): PeriodAnalysis => {
    const productMap = new Map<string, ProductSales>();
    const paymentMethods: Record<string, number> = {};
    const neighborhoods: Record<string, number> = {};
    const dayOfWeek: Record<string, number> = {};
    const hourDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};
    
    let totalRevenue = 0;

    orders.forEach(order => {
      totalRevenue += Number(order.total || 0);

      // Analyze payment methods
      const payment = order.forma_pagamento || 'Não especificado';
      paymentMethods[payment] = (paymentMethods[payment] || 0) + 1;

      // Analyze neighborhoods
      const neighborhood = order.cliente_bairro || 'Não especificado';
      neighborhoods[neighborhood] = (neighborhoods[neighborhood] || 0) + 1;

      // Analyze day of week
      const orderDate = new Date(order.data_criacao);
      const dayName = orderDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      dayOfWeek[dayName] = (dayOfWeek[dayName] || 0) + 1;

      // Analyze hour distribution
      const hour = orderDate.getHours();
      const hourRange = `${hour}:00-${hour}:59`;
      hourDistribution[hourRange] = (hourDistribution[hourRange] || 0) + 1;

      // Analyze status
      const status = order.status || 'Não especificado';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;

      // Analyze products
      const items = order.itens as any[];
      if (Array.isArray(items)) {
        items.forEach(item => {
          const existing = productMap.get(item.name) || {
            name: item.name,
            totalQty: 0,
            totalRevenue: 0,
            avgPrice: 0,
            orderCount: 0,
            frequency: 0
          };

          const itemQty = Number(item.qty || 0);
          const itemPrice = Number(item.price || 0);
          
          productMap.set(item.name, {
            name: item.name,
            totalQty: existing.totalQty + itemQty,
            totalRevenue: existing.totalRevenue + (itemPrice * itemQty),
            avgPrice: itemPrice,
            orderCount: existing.orderCount + 1,
            frequency: 0
          });
        });
      }
    });

    // Calculate frequency for each product
    const products = Array.from(productMap.values()).map(product => ({
      ...product,
      frequency: (product.orderCount / orders.length) * 100
    })).sort((a, b) => b.totalQty - a.totalQty);

    return {
      startDate: startDate!,
      endDate: endDate!,
      totalOrders: orders.length,
      totalRevenue,
      avgTicket: totalRevenue / orders.length,
      products,
      paymentMethods,
      neighborhoods,
      dayOfWeek,
      hourDistribution,
      statusDistribution
    };
  };

  const generatePDF = (analysis: PeriodAnalysis) => {
    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    const checkPageBreak = (neededSpace: number = 20) => {
      if (yPos + neededSpace > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise Preditiva de Vendas', 105, yPos, { align: 'center' });
    yPos += 10;

    // Period
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const periodText = `Período: ${format(analysis.startDate, 'dd/MM/yyyy', { locale: ptBR })} a ${format(analysis.endDate, 'dd/MM/yyyy', { locale: ptBR })}`;
    doc.text(periodText, 105, yPos, { align: 'center' });
    yPos += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Geral', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Pedidos: ${analysis.totalOrders}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Faturamento Total: R$ ${analysis.totalRevenue.toFixed(2).replace('.', ',')}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Ticket Médio: R$ ${analysis.avgTicket.toFixed(2).replace('.', ',')}`, 20, yPos);
    yPos += lineHeight + 5;

    // Products Section
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Produtos Mais Vendidos (Top 20)', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Produto', 20, yPos);
    doc.text('Qtd', 120, yPos);
    doc.text('Faturamento', 145, yPos);
    doc.text('Freq%', 180, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'normal');
    analysis.products.slice(0, 20).forEach(product => {
      checkPageBreak();
      const productName = product.name.length > 40 ? product.name.substring(0, 37) + '...' : product.name;
      doc.text(productName, 20, yPos);
      doc.text(product.totalQty.toString(), 120, yPos);
      doc.text(`R$ ${product.totalRevenue.toFixed(2)}`, 145, yPos);
      doc.text(`${product.frequency.toFixed(1)}%`, 180, yPos);
      yPos += lineHeight;
    });
    yPos += 5;

    // Payment Methods
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Formas de Pagamento', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(analysis.paymentMethods)
      .sort((a, b) => b[1] - a[1])
      .forEach(([method, count]) => {
        checkPageBreak();
        const percentage = ((count / analysis.totalOrders) * 100).toFixed(1);
        doc.text(`${method}: ${count} pedidos (${percentage}%)`, 20, yPos);
        yPos += lineHeight;
      });
    yPos += 5;

    // Neighborhoods
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Bairros Mais Atendidos', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(analysis.neighborhoods)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([neighborhood, count]) => {
        checkPageBreak();
        const percentage = ((count / analysis.totalOrders) * 100).toFixed(1);
        doc.text(`${neighborhood}: ${count} pedidos (${percentage}%)`, 20, yPos);
        yPos += lineHeight;
      });
    yPos += 5;

    // Day of Week Distribution
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribuição por Dia da Semana', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const orderedDays = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
    orderedDays.forEach(day => {
      const count = analysis.dayOfWeek[day] || 0;
      if (count > 0) {
        checkPageBreak();
        const percentage = ((count / analysis.totalOrders) * 100).toFixed(1);
        doc.text(`${day}: ${count} pedidos (${percentage}%)`, 20, yPos);
        yPos += lineHeight;
      }
    });
    yPos += 5;

    // Hour Distribution
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribuição por Horário', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    Object.entries(analysis.hourDistribution)
      .sort((a, b) => {
        const hourA = parseInt(a[0].split(':')[0]);
        const hourB = parseInt(b[0].split(':')[0]);
        return hourA - hourB;
      })
      .forEach(([hour, count]) => {
        checkPageBreak();
        const percentage = ((count / analysis.totalOrders) * 100).toFixed(1);
        doc.text(`${hour}: ${count} pedidos (${percentage}%)`, 20, yPos);
        yPos += lineHeight;
      });
    yPos += 5;

    // Status Distribution
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Status dos Pedidos', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(analysis.statusDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        checkPageBreak();
        const percentage = ((count / analysis.totalOrders) * 100).toFixed(1);
        doc.text(`${status}: ${count} pedidos (${percentage}%)`, 20, yPos);
        yPos += lineHeight;
      });

    // Save PDF
    const fileName = `analise_preditiva_${format(analysis.startDate, 'dd-MM-yyyy')}_ate_${format(analysis.endDate, 'dd-MM-yyyy')}.pdf`;
    doc.save(fileName);
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Selecione o período",
        description: "Por favor, selecione a data inicial e final.",
        variant: "destructive"
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Período inválido",
        description: "A data inicial deve ser anterior à data final.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const { data: orders, error } = await supabase
        .from('pedidos')
        .select('*')
        .gte('data_criacao', startOfDay(startDate).toISOString())
        .lte('data_criacao', endOfDay(endDate).toISOString())
        .order('data_criacao', { ascending: true });

      if (error) throw error;

      if (!orders || orders.length === 0) {
        toast({
          title: "Nenhum pedido encontrado",
          description: "Não há pedidos no período selecionado.",
          variant: "destructive"
        });
        return;
      }

      const analysis = analyzeOrders(orders);
      generatePDF(analysis);

      toast({
        title: "PDF gerado com sucesso",
        description: `Análise de ${orders.length} pedidos exportada!`
      });

    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar a análise preditiva.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold">Análise Preditiva para IA</h3>
      <p className="text-sm text-muted-foreground">
        Gere um PDF completo com dados de vendas, padrões de consumo e métricas para análise preditiva de IA e montagem de lista de compras.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Inicial</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP', { locale: ptBR }) : 'Selecione...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Data Final</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP', { locale: ptBR }) : 'Selecione...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full"
      >
        <FileText className="mr-2 h-4 w-4" />
        {isExporting ? 'Gerando PDF...' : 'Gerar PDF de Análise'}
      </Button>
    </div>
  );
};