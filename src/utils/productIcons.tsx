import { 
  Beer, 
  Wine, 
  Coffee, 
  IceCream, 
  Cookie, 
  Milk,
  GlassWater,
  CupSoda,
  Cigarette,
  Package,
  Candy,
  Flame,
  Soup,
  LucideIcon
} from 'lucide-react';

interface ProductIconMap {
  [key: string]: LucideIcon;
}

// Mapeamento de palavras-chave para ícones
const keywordIconMap: ProductIconMap = {
  // Bebidas alcoólicas
  'cerveja': Beer,
  'beer': Beer,
  'heineken': Beer,
  'skol': Beer,
  'brahma': Beer,
  'budweiser': Beer,
  'corona': Beer,
  'stella': Beer,
  
  'vinho': Wine,
  'wine': Wine,
  
  // Bebidas não alcoólicas
  'refrigerante': CupSoda,
  'coca': CupSoda,
  'pepsi': CupSoda,
  'guarana': CupSoda,
  'fanta': CupSoda,
  'sprite': CupSoda,
  
  'suco': Milk,
  'juice': Milk,
  'del valle': Milk,
  
  'agua': GlassWater,
  'water': GlassWater,
  'mineral': GlassWater,
  
  'energetico': Flame,
  'energy': Flame,
  'red bull': Flame,
  'monster': Flame,
  
  'cafe': Coffee,
  'coffee': Coffee,
  'nescafe': Coffee,
  
  'leite': Milk,
  'milk': Milk,
  'ninho': Milk,
  
  // Copão/Drinks
  'copao': CupSoda,
  'copão': CupSoda,
  'drink': CupSoda,
  'coquetel': CupSoda,
  
  // Sorvetes
  'sorvete': IceCream,
  'ice cream': IceCream,
  'picole': IceCream,
  'picolé': IceCream,
  'acai': IceCream,
  'açai': IceCream,
  
  // Salgadinhos/Snacks
  'salgadinho': Package,
  'snack': Package,
  'chips': Package,
  'doritos': Package,
  'ruffles': Package,
  'cheetos': Package,
  'elma': Package,
  
  // Doces
  'chocolate': Candy,
  'bala': Candy,
  'chiclete': Candy,
  'trident': Candy,
  'bis': Candy,
  'kit kat': Candy,
  
  'biscoito': Cookie,
  'bolacha': Cookie,
  'cookie': Cookie,
  'oreo': Cookie,
  
  // Cigarro
  'cigarro': Cigarette,
  'cigarette': Cigarette,
  'marlboro': Cigarette,
  'dunhill': Cigarette,
  
  // Comidas quentes
  'sopa': Soup,
  'miojo': Soup,
  'nissin': Soup,
};

export const getProductIcon = (productName: string, categoryName?: string): LucideIcon => {
  const searchText = `${productName} ${categoryName || ''}`.toLowerCase();
  
  // Busca por palavras-chave
  for (const [keyword, Icon] of Object.entries(keywordIconMap)) {
    if (searchText.includes(keyword)) {
      return Icon;
    }
  }
  
  // Ícone padrão caso não encontre correspondência
  return Package;
};
