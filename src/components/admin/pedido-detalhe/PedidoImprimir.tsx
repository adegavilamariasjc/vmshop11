
import React from 'react';

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

    const itensFormatados = pedido.itens.map((item: any) => {
      let texto = `${item.qty}x ${item.name}`;
      if (item.alcohol) {
        texto += ` (${item.alcohol})`;
      }
      if (item.balyFlavor) {
        texto += ` (Baly: ${item.balyFlavor})`;
      }

      if (item.ice && Object.entries(item.ice).some(([_, qty]: [string, any]) => qty > 0)) {
        const geloInfo = Object.entries(item.ice)
          .filter(([_, qty]: [string, any]) => qty > 0)
          .map(([flavor, qty]: [string, any]) => `${flavor} x${qty}`)
          .join(", ");

        texto += `\n   Gelo: ${geloInfo}`;
      }

      texto += `\n   R$ ${(item.price * item.qty).toFixed(2)}`;
      return texto;
    }).join('\n\n');

    let trocoInfo = '';
    if (pedido.forma_pagamento === 'Dinheiro' && pedido.troco) {
      const trocoValue = Number(pedido.troco);
      const changeAmount = trocoValue - pedido.total;
      if (changeAmount > 0) {
        trocoInfo = `\nLEVAR TROCO: R$ ${changeAmount.toFixed(2)}`;
      }
    }

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

SUBTOTAL: R$ ${(pedido.total - pedido.taxa_entrega).toFixed(2)}
TAXA DE ENTREGA: R$ ${pedido.taxa_entrega.toFixed(2)}
TOTAL: R$ ${pedido.total.toFixed(2)}

FORMA DE PAGAMENTO: ${pedido.forma_pagamento}
${pedido.forma_pagamento === 'Dinheiro' && pedido.troco ? `TROCO PARA: R$ ${pedido.troco}` : ''}
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
              ${conteudoImpressao.replace(
                trocoInfo,
                trocoInfo ? `\n<div class="change-amount">${trocoInfo}</div>` : ''
              )}
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
