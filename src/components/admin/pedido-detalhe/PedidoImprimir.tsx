
import React from 'react';
import { calculateBeerDiscount } from '@/utils/discountUtils';

export const PedidoImprimir = ({
  pedido,
  deliverer,
  setIsPrinting,
}: {
  pedido: any;
  deliverer: string;
  setIsPrinting: (v: boolean) => void;
}) => {

  // Print function from original code
  React.useEffect(() => {
    if (!pedido) return;
    setIsPrinting(true);

    const formatarItem = (item: any) => {
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

    const itensFormatados = pedido.itens.map(formatarItem).join('\n\n');

    // Calcular o subtotal sem descontos aplicados
    const subtotalSemDesconto = pedido.itens.reduce((sum: number, item: any) => {
      return sum + (item.price * item.qty);
    }, 0);

    // Calcular o subtotal com descontos aplicados
    const subtotalComDesconto = pedido.itens.reduce((sum: number, item: any) => {
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

    // Adicionar informação de desconto no texto apenas se houver descontos
    const descontoTexto = descontoExibir > 0 
      ? `DESCONTOS APLICADOS: R$ ${descontoExibir.toFixed(2).replace('.', ',')}\n` 
      : '';

    const trocoInfo = pedido.forma_pagamento === 'Dinheiro' && pedido.troco 
      ? `\nTROCO PARA: R$ ${pedido.troco}` 
      : '';

    const conteudoImpressao = `
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

    const janela = window.open('', '_blank');

    if (janela) {
      janela.document.write(`
        <html>
          <head>
            <title>Pedido ${pedido.codigo_pedido}</title>
            <style>
              html,body {
                height: 100%;
                margin: 0;
                padding: 0;
              }
              body {
                font-family: monospace;
                font-size: 12pt;
                line-height: 1.2;
                white-space: pre-wrap;
                margin: 10mm;
                background: white;
                box-sizing: border-box;
                max-width: 80mm;
                overflow: auto;
                display: flex;
                flex-direction: column;
                min-height: 100vh;
                max-height: 100vh;
              }
              @media print {
                html,body {
                  height: auto !important;
                  min-height: 0 !important;
                  max-height: none !important;
                  overflow: visible !important;
                }
                body {
                  width: 80mm;
                  max-width: 80mm;
                  background: white;
                  box-sizing: border-box;
                  page-break-inside: avoid;
                }
                .scroll-container {
                  max-height: none !important;
                  overflow: visible !important;
                }
              }
              .scroll-container {
                max-height: 85vh;
                overflow-y: auto;
              }
              .deliverer {
                font-weight: bold;
                font-size: 16pt;
                text-align: center;
                margin-bottom: 10mm;
              }
              .change-amount {
                font-weight: bold;
                font-size: 14pt;
                margin-top: 5mm;
              }
            </style>
          </head>
          <body>
            <div class="scroll-container">
              <div class="deliverer">${deliverer}</div>
              ${conteudoImpressao}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      janela.document.close();
    }

    setIsPrinting(false);
    // Only run once per mount
    // eslint-disable-next-line
  }, []);

  return null;
};
