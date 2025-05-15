
import React from 'react';
import { PrintablePedido } from './PrinterUtils';

interface PrintPageProps {
  pedido: PrintablePedido;
  deliverer: string;
  formattedContent: string;
  onPrint: () => void;
}

const PrintPage: React.FC<PrintPageProps> = ({ 
  formattedContent,
  deliverer,
  onPrint
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (onPrint) {
      onPrint();
    }
  }, [onPrint]);

  return (
    <div className="hidden">
      <div dangerouslySetInnerHTML={{ 
        __html: `
          <html>
            <head>
              <title>Pedido</title>
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
                ${formattedContent}
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
        `
      }} />
    </div>
  );
};

export default PrintPage;
