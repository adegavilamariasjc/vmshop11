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

interface CategorySales {
  category: string;
  totalQty: number;
  totalRevenue: number;
  productCount: number;
}

interface OrderTypeAnalysis {
  type: string;
  count: number;
  totalRevenue: number;
  avgTicket: number;
}

interface ProductCombo {
  products: string[];
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
  categorySales: CategorySales[];
  orderTypes: OrderTypeAnalysis[];
  peakHours: Array<{ hour: string; orders: number; revenue: number }>;
  productCombos: ProductCombo[];
  paymentMethodRevenue: Record<string, number>;
}

export const PredictiveAnalysisExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { toast } = useToast();

  const analyzeOrders = (orders: any[]): PeriodAnalysis => {
    const productMap = new Map<string, ProductSales>();
    const categoryMap = new Map<string, CategorySales>();
    const paymentMethods: Record<string, number> = {};
    const paymentMethodRevenue: Record<string, number> = {};
    const neighborhoods: Record<string, number> = {};
    const dayOfWeek: Record<string, number> = {};
    const hourDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};
    const orderTypeMap = new Map<string, { count: number; revenue: number }>();
    const hourRevenueMap = new Map<string, { orders: number; revenue: number }>();
    const productCombosMap = new Map<string, number>();
    
    let totalRevenue = 0;

    orders.forEach(order => {
      const orderTotal = Number(order.total || 0);
      totalRevenue += orderTotal;

      // Analyze payment methods
      const payment = order.forma_pagamento || 'Não especificado';
      paymentMethods[payment] = (paymentMethods[payment] || 0) + 1;
      paymentMethodRevenue[payment] = (paymentMethodRevenue[payment] || 0) + orderTotal;

      // Analyze neighborhoods
      const neighborhood = order.cliente_bairro || 'Não especificado';
      neighborhoods[neighborhood] = (neighborhoods[neighborhood] || 0) + 1;

      // Analyze order type (delivery vs balcão)
      // Considera balcão se: não tem endereço OU bairro é "Balcão" OU taxa de entrega é 0
      const hasAddress = order.cliente_endereco && order.cliente_endereco.trim() !== '';
      const isBalcao = !hasAddress || 
                       order.cliente_bairro?.toLowerCase().includes('balc') ||
                       order.cliente_bairro?.toLowerCase().includes('retirada') ||
                       Number(order.taxa_entrega || 0) === 0;
      const orderType = isBalcao ? 'Balcão' : 'Delivery';
      const typeData = orderTypeMap.get(orderType) || { count: 0, revenue: 0 };
      orderTypeMap.set(orderType, {
        count: typeData.count + 1,
        revenue: typeData.revenue + orderTotal
      });

      // Analyze day of week
      const orderDate = new Date(order.data_criacao);
      const dayName = orderDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      dayOfWeek[dayName] = (dayOfWeek[dayName] || 0) + 1;

      // Analyze hour distribution with revenue
      const hour = orderDate.getHours();
      const hourRange = `${hour}:00-${hour}:59`;
      hourDistribution[hourRange] = (hourDistribution[hourRange] || 0) + 1;
      const hourData = hourRevenueMap.get(hourRange) || { orders: 0, revenue: 0 };
      hourRevenueMap.set(hourRange, {
        orders: hourData.orders + 1,
        revenue: hourData.revenue + orderTotal
      });

      // Analyze status
      const status = order.status || 'Não especificado';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;

      // Analyze products and categories
      const items = order.itens as any[];
      if (Array.isArray(items)) {
        // Product combos
        if (items.length > 1) {
          const productNames = items.map(i => i.name).sort().join(' + ');
          productCombosMap.set(productNames, (productCombosMap.get(productNames) || 0) + 1);
        }

        items.forEach(item => {
          const itemQty = Number(item.qty || 0);
          const itemPrice = Number(item.price || 0);
          const itemRevenue = itemPrice * itemQty;
          
          // Product analysis
          const existing = productMap.get(item.name) || {
            name: item.name,
            totalQty: 0,
            totalRevenue: 0,
            avgPrice: 0,
            orderCount: 0,
            frequency: 0
          };

          productMap.set(item.name, {
            name: item.name,
            totalQty: existing.totalQty + itemQty,
            totalRevenue: existing.totalRevenue + itemRevenue,
            avgPrice: itemPrice,
            orderCount: existing.orderCount + 1,
            frequency: 0
          });

          // Category analysis
          const category = item.category || 'Sem Categoria';
          const catExisting = categoryMap.get(category) || {
            category,
            totalQty: 0,
            totalRevenue: 0,
            productCount: 0
          };

          categoryMap.set(category, {
            category,
            totalQty: catExisting.totalQty + itemQty,
            totalRevenue: catExisting.totalRevenue + itemRevenue,
            productCount: catExisting.productCount + 1
          });
        });
      }
    });

    // Calculate frequency for each product
    const products = Array.from(productMap.values()).map(product => ({
      ...product,
      frequency: (product.orderCount / orders.length) * 100
    })).sort((a, b) => b.totalQty - a.totalQty);

    // Process categories
    const categorySales = Array.from(categoryMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Process order types
    const orderTypes: OrderTypeAnalysis[] = Array.from(orderTypeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      totalRevenue: data.revenue,
      avgTicket: data.revenue / data.count
    }));

    // Process peak hours
    const peakHours = Array.from(hourRevenueMap.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    // Process product combos
    const productCombos = Array.from(productCombosMap.entries())
      .map(([products, frequency]) => ({
        products: products.split(' + '),
        frequency
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 15);

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
      statusDistribution,
      categorySales,
      orderTypes,
      peakHours,
      productCombos,
      paymentMethodRevenue
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

    // Order Types (Delivery vs Balcão)
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise por Tipo de Pedido', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    analysis.orderTypes.forEach(orderType => {
      checkPageBreak();
      const percentage = ((orderType.count / analysis.totalOrders) * 100).toFixed(1);
      doc.text(`${orderType.type}:`, 20, yPos);
      yPos += lineHeight;
      doc.text(`  Pedidos: ${orderType.count} (${percentage}%)`, 25, yPos);
      yPos += lineHeight;
      doc.text(`  Faturamento: R$ ${orderType.totalRevenue.toFixed(2)}`, 25, yPos);
      yPos += lineHeight;
      doc.text(`  Ticket Médio: R$ ${orderType.avgTicket.toFixed(2)}`, 25, yPos);
      yPos += lineHeight + 2;
    });
    yPos += 5;

    // Category Sales
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Vendas por Categoria', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Categoria', 20, yPos);
    doc.text('Qtd Total', 100, yPos);
    doc.text('Faturamento', 140, yPos);
    doc.text('Produtos', 180, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'normal');
    analysis.categorySales.forEach(cat => {
      checkPageBreak();
      doc.text(cat.category.substring(0, 30), 20, yPos);
      doc.text(cat.totalQty.toString(), 100, yPos);
      doc.text(`R$ ${cat.totalRevenue.toFixed(2)}`, 140, yPos);
      doc.text(cat.productCount.toString(), 180, yPos);
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
        const revenue = analysis.paymentMethodRevenue[method] || 0;
        const avgTicket = revenue / count;
        doc.text(`${method}:`, 20, yPos);
        yPos += lineHeight;
        doc.text(`  Pedidos: ${count} (${percentage}%)`, 25, yPos);
        yPos += lineHeight;
        doc.text(`  Faturamento: R$ ${revenue.toFixed(2)}`, 25, yPos);
        yPos += lineHeight;
        doc.text(`  Ticket Médio: R$ ${avgTicket.toFixed(2)}`, 25, yPos);
        yPos += lineHeight + 2;
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

    // Peak Hours
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Horários de Pico (Top 10)', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Horário', 20, yPos);
    doc.text('Pedidos', 80, yPos);
    doc.text('Faturamento', 130, yPos);
    doc.text('Ticket Médio', 175, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'normal');
    analysis.peakHours.forEach(peak => {
      checkPageBreak();
      const avgTicket = peak.revenue / peak.orders;
      doc.text(peak.hour, 20, yPos);
      doc.text(peak.orders.toString(), 80, yPos);
      doc.text(`R$ ${peak.revenue.toFixed(2)}`, 130, yPos);
      doc.text(`R$ ${avgTicket.toFixed(2)}`, 175, yPos);
      yPos += lineHeight;
    });
    yPos += 5;

    // Product Combos
    if (analysis.productCombos.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Produtos Comprados Juntos (Top 15)', 20, yPos);
      yPos += lineHeight + 2;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      analysis.productCombos.forEach(combo => {
        checkPageBreak();
        const comboText = combo.products.join(' + ');
        const displayText = comboText.length > 70 ? comboText.substring(0, 67) + '...' : comboText;
        doc.text(`${displayText} (${combo.frequency}x)`, 20, yPos);
        yPos += lineHeight;
      });
      yPos += 5;
    }

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