
export const formatWhatsApp = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  if (!cleaned.startsWith('55') && cleaned.length >= 11) {
    return `+55${cleaned}`;
  }
  return cleaned;
};

export const formatWhatsAppMessage = (
  codigoPedido: string, 
  nome: string,
  endereco: string,
  numero: string,
  complemento: string,
  referencia: string,
  bairroNome: string,
  bairroTaxa: number,
  whatsapp: string,
  pagamento: string,
  troco: string,
  itemsText: string,
  total: number
): string => {
  const trocoValue = Number(troco) || 0;
  const trocoFinal = trocoValue - total;

  const trocoMessage = pagamento === "Dinheiro"
    ? `\uD83D\uDCB0 Troco para: R$${trocoValue.toFixed(2).replace('.', ',')} (TROCO R$${trocoFinal >= 0 ? trocoFinal.toFixed(2).replace('.', ',') : '0,00'})\n`
    : "";

  return (
    `\uD83C\uDF89 Pedido ${codigoPedido} \uD83C\uDF89\n\n` +
    `\uD83D\uDC64 Cliente: ${nome}\n` +
    `\uD83C\uDFE0 Endereço: ${endereco}, Nº ${numero} ${complemento}\n` +
    `\uD83D\uDCCD Referência: ${referencia}\n` +
    `\uD83D\uDCCD Bairro: ${bairroNome} (Taxa: R$${bairroTaxa.toFixed(2).replace('.', ',')})\n` +
    `\uD83D\uDCF1 WhatsApp: ${whatsapp}\n\n` +
    `\uD83D\uDED2 Pedido:\n${itemsText}\n\n` +
    `\uD83D\uDCB3 Forma de Pagamento: ${pagamento}\n` +
    (pagamento === "Dinheiro" ? trocoMessage : "") +
    `\u2728 Total: R$${total.toFixed(2).replace('.', ',')} \u2728`
  );
};
