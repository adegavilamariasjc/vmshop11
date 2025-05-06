
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

// Improved function to check if a product should be grouped or not
export const shouldBeGrouped = (item: any): boolean => {
  // Products that should NOT be grouped (keep as individual items)
  if (item.ice || 
      item.energyDrinks || 
      item.energyDrink || 
      item.name.toLowerCase().includes('copão') || 
      (item.category && item.category.toLowerCase().includes('combo'))) {
    return false;
  }
  
  // All other items should be grouped (beers, simple products)
  return true;
};

// Function to group identical items in the cart
export const groupCartItems = (items: Array<any> | string): Array<any> => {
  // Handle case when items might be a JSON string (from database)
  let itemsArray = Array.isArray(items) ? items : [];
  if (typeof items === 'string') {
    try {
      itemsArray = JSON.parse(items);
    } catch (e) {
      console.error("Error parsing items:", e);
      return [];
    }
  }

  // Filter out items with zero quantity first
  const validItems = itemsArray.filter(item => item.qty && item.qty > 0);
  
  const groupedItems: any[] = [];
  const groupingMap = new Map();
  
  validItems.forEach(item => {
    // For customizable products, keep them as individual items
    if (!shouldBeGrouped(item)) {
      groupedItems.push({...item});
      return;
    }
    
    // For simple products like beers, create a unique key for grouping
    const key = `${item.name}-${item.category || ''}-${item.alcohol || ''}-${item.balyFlavor || ''}`;
    
    if (groupingMap.has(key)) {
      // Update existing item quantity
      const existingIndex = groupingMap.get(key);
      groupedItems[existingIndex].qty = (groupedItems[existingIndex].qty || 0) + (item.qty || 0);
    } else {
      // Add new item and store its index
      groupingMap.set(key, groupedItems.length);
      groupedItems.push({...item});
    }
  });
  
  return groupedItems;
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
  // Parse troco as a number to fix the type error
  const trocoValue = parseFloat(troco) || 0;
  const trocoFinal = trocoValue - total;

  const trocoMessage = pagamento === "Dinheiro" && trocoValue > 0
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
