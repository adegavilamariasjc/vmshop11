
/**
 * Utility functions for formatting order items and handling printing
 */
import { calculateBeerDiscount } from '@/utils/discountUtils';

export interface PrintableItem {
  qty: number;
  name: string;
  price: number;
  alcohol?: string;
  balyFlavor?: string;
  ice?: Record<string, any>;
  energyDrinks?: Array<{ type: string; flavor: string }>;
  category?: string;
}

export interface PrintablePedido {
  codigo_pedido: string;
  cliente_nome: string;
  cliente_endereco: string;
  cliente_numero?: string;
  cliente_complemento?: string;
  cliente_referencia?: string;
  cliente_bairro: string;
  cliente_whatsapp: string;
  taxa_entrega: number;
  forma_pagamento: string;
  troco?: string;
  itens: PrintableItem[];
  total: number;
  data_criacao: string;
  observacao?: string;
  discount_amount?: number;
}

export const formatItemForPrint = (item: PrintableItem): string => {
  let texto = `${item.qty}x ${item.name}`;
  
  // Adicionar detalhes do álcool se presente
  if (item.alcohol) {
    texto += ` (${item.alcohol})`;
  }
  
  // Adicionar detalhes do sabor Baly se presente
  if (item.balyFlavor) {
    texto += ` (Baly: ${item.balyFlavor})`;
  }

  // Verificar se tem desconto de cerveja com produto da categoria cerveja e quantidade >= 12
  const discountInfo = calculateBeerDiscount(item);
  if (discountInfo.hasDiscount) {
    texto += ` (-${discountInfo.discountPercentage}%)`;
    texto += `\n   Valor normal: R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}`;
    texto += `\n   Com desconto: R$ ${discountInfo.discountedPrice.toFixed(2).replace('.', ',')}`;
  } else {
    texto += `\n   R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}`;
  }

  // Adicionar detalhes do gelo se presente
  if (item.ice && Object.entries(item.ice).some(([_, qty]: [string, any]) => qty > 0)) {
    const geloInfo = Object.entries(item.ice)
      .filter(([_, qty]: [string, any]) => qty > 0)
      .map(([flavor, qty]: [string, any]) => `${flavor} x${qty}`)
      .join(", ");

    texto += `\n   Gelo: ${geloInfo}`;
  }

  // Adicionar detalhes dos energéticos se presente
  if (item.energyDrinks && item.energyDrinks.length > 0) {
    const energeticosInfo = item.energyDrinks
      .map((ed: any) => 
        `${ed.type}${ed.flavor !== 'Tradicional' ? ` - ${ed.flavor}` : ''}`
      )
      .join(", ");
    
    texto += `\n   Energéticos: ${energeticosInfo}`;
  }

  return texto;
};

export const calculateOrderTotals = (pedido: PrintablePedido) => {
  // Calcular o subtotal sem descontos aplicados
  const subtotalSemDesconto = pedido.itens.reduce((sum: number, item: PrintableItem) => {
    return sum + (item.price * item.qty);
  }, 0);

  // Calcular o subtotal com descontos aplicados
  const subtotalComDesconto = pedido.itens.reduce((sum: number, item: PrintableItem) => {
    const discountInfo = calculateBeerDiscount(item);
    if (discountInfo.hasDiscount) {
      return sum + discountInfo.discountedPrice;
    } else {
      return sum + (item.price * item.qty);
    }
  }, 0);

  // Calcular o valor total de desconto
  const totalDescontos = subtotalSemDesconto - subtotalComDesconto;
  
  // Usar o valor armazenado no pedido se disponível, caso contrário usar o calculado
  const descontoExibir = pedido.discount_amount !== undefined && pedido.discount_amount > 0 
    ? pedido.discount_amount 
    : totalDescontos;

  return {
    subtotalSemDesconto,
    subtotalComDesconto,
    totalDescontos,
    descontoExibir
  };
};

export const formatPedidoForPrint = (pedido: PrintablePedido, deliverer: string): string => {
  const itensFormatados = pedido.itens.map(formatItemForPrint).join('\n\n');
  const { subtotalSemDesconto, descontoExibir } = calculateOrderTotals(pedido);

  // Adicionar informação de desconto no texto apenas se houver descontos
  const descontoTexto = descontoExibir > 0 
    ? `DESCONTOS APLICADOS: R$ ${descontoExibir.toFixed(2).replace('.', ',')}\n` 
    : '';

  const trocoInfo = pedido.forma_pagamento === 'Dinheiro' && pedido.troco 
    ? `\nTROCO PARA: R$ ${pedido.troco}` 
    : '';

  return `
${deliverer}

ADEGA VM
PEDIDO #${pedido.codigo_pedido}
${new Date(pedido.data_criacao).toLocaleString('pt-BR')}

CLIENTE: ${pedido.cliente_nome}
ENDEREÇO: ${pedido.cliente_endereco}, ${pedido.cliente_numero || ''}
${pedido.cliente_complemento ? `COMPLEMENTO: ${pedido.cliente_complemento}` : ''}
${pedido.cliente_referencia ? `REFERÊNCIA: ${pedido.cliente_referencia}` : ''}
BAIRRO: ${pedido.cliente_bairro}
WHATSAPP: ${pedido.cliente_whatsapp}
${pedido.observacao ? `OBSERVAÇÃO: ${pedido.observacao}` : ''}

ITENS DO PEDIDO:
${itensFormatados}

RESUMO DO PEDIDO:
SUBTOTAL: R$ ${subtotalSemDesconto.toFixed(2).replace('.', ',')}
${descontoTexto}TAXA DE ENTREGA: R$ ${pedido.taxa_entrega.toFixed(2).replace('.', ',')}
TOTAL: R$ ${pedido.total.toFixed(2).replace('.', ',')}

FORMA DE PAGAMENTO: ${pedido.forma_pagamento}
${trocoInfo}

Obrigado pela preferência!
ADEGA VM
`.trim();
};
