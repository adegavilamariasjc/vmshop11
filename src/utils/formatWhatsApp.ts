
export const formatWhatsApp = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  if (!cleaned.startsWith('55') && cleaned.length >= 11) {
    return `+55${cleaned}`;
  }
  return cleaned;
};

// Helper function to get full product name
export const getFullProductName = (name: string, category?: string): string => {
  if (category?.toLowerCase() === 'batidas' && !name.toLowerCase().includes('batida de')) {
    return `Batida de ${name}`;
  }
  return name;
};

// Function to group identical items in the cart
export const groupCartItems = (items: Array<any>): Array<any> => {
  // Filter out items with zero quantity first
  const validItems = items.filter(item => item.qty && item.qty > 0);
  
  return validItems.reduce((acc: any[], item: any) => {
    // For customizable products, keep them as individual items
    if (item.ice || 
        item.energyDrinks || 
        item.energyDrink || 
        item.name.toLowerCase().includes('copão') || 
        (item.category && item.category.toLowerCase().includes('combo'))) {
      acc.push({...item});
      return acc;
    }
    
    // For simple products, combine quantities if they are identical
    const existingItem = acc.find(i => 
      i.name === item.name && 
      i.category === item.category && 
      i.alcohol === item.alcohol && 
      i.balyFlavor === item.balyFlavor
    );
    
    if (existingItem) {
      existingItem.qty = (existingItem.qty || 0) + (item.qty || 0);
    } else {
      acc.push({...item});
    }
    
    return acc;
  }, []);
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
  // Parse troco as a number to ensure it's not treated as unknown
  const trocoValue = parseFloat(troco) || 0;
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
