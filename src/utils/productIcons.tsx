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
  Martini,
  Snowflake,
  Apple,
  Beef,
  Baby,
  Pizza,
  LucideIcon
} from 'lucide-react';

interface ProductIconMap {
  [key: string]: LucideIcon;
}

// Mapeamento de palavras-chave para ícones baseado nos produtos reais
const keywordIconMap: ProductIconMap = {
  // Água
  'agua': GlassWater,
  'água': GlassWater,
  'water': GlassWater,
  'mineral': GlassWater,
  
  // Batidas (drinks com álcool)
  'batida': Martini,
  'batidas': Martini,
  
  // Batidas Kids (sem álcool)
  'batida de': Martini,
  'batidas kids': Baby,
  '0%': Baby,
  
  // Cachaças
  'cachaca': Wine,
  'cachaça': Wine,
  'corote': Wine,
  'canelinha': Wine,
  'barreiro': Wine,
  '51': Wine,
  
  // Caipi Ice
  'caip ice': Snowflake,
  'caipi ice': Snowflake,
  
  // Caipirinhas
  'caipirinha': CupSoda,
  'caipirinhas': CupSoda,
  
  // Cervejas
  'cerveja': Beer,
  'cervejas': Beer,
  'beer': Beer,
  'heineken': Beer,
  'skol': Beer,
  'brahma': Beer,
  'budweiser': Beer,
  'corona': Beer,
  'stella': Beer,
  'amstel': Beer,
  'itaipava': Beer,
  'original': Beer,
  'eisenbahn': Beer,
  'antarctica': Beer,
  'petra': Beer,
  'devassa': Beer,
  'spaten': Beer,
  
  // Chocolates
  'chocolate': Candy,
  'bis': Candy,
  'kit kat': Candy,
  'laka': Candy,
  'snickers': Candy,
  'twix': Candy,
  'ovomaltine': Candy,
  
  // Cigarros
  'cigarro': Cigarette,
  'cigarette': Cigarette,
  'marlboro': Cigarette,
  'dunhill': Cigarette,
  'eight': Cigarette,
  
  // Copão/Drinks
  'copao': CupSoda,
  'copão': CupSoda,
  'drink': CupSoda,
  'coquetel': CupSoda,
  
  // Doces/Balas
  'bala': Candy,
  'chiclete': Candy,
  'trident': Candy,
  'halls': Candy,
  'mentos': Candy,
  
  // Energéticos
  'energetico': Flame,
  'energético': Flame,
  'energy': Flame,
  'red bull': Flame,
  'monster': Flame,
  'fusion': Flame,
  'tnt': Flame,
  
  // Café
  'cafe': Coffee,
  'café': Coffee,
  'coffee': Coffee,
  'nescafe': Coffee,
  
  // Gin
  'gin': Wine,
  'tanqueray': Wine,
  'beefeater': Wine,
  'gordon': Wine,
  
  // Biscoitos
  'biscoito': Cookie,
  'bolacha': Cookie,
  'cookie': Cookie,
  'oreo': Cookie,
  'club social': Cookie,
  'passatempo': Cookie,
  'trakinas': Cookie,
  
  // Leite/Bebidas lácteas
  'leite': Milk,
  'milk': Milk,
  'ninho': Milk,
  'italac': Milk,
  'piracanjuba': Milk,
  
  // Refrigerantes
  'refrigerante': CupSoda,
  'coca': CupSoda,
  'pepsi': CupSoda,
  'guarana': CupSoda,
  'fanta': CupSoda,
  'sprite': CupSoda,
  'schweppes': CupSoda,
  'kuat': CupSoda,
  
  // Salgadinhos/Snacks
  'salgadinho': Package,
  'snack': Package,
  'chips': Package,
  'doritos': Package,
  'ruffles': Package,
  'cheetos': Package,
  'elma': Package,
  'fandangos': Package,
  'torcida': Package,
  'baconzitos': Package,
  
  // Sorvetes
  'sorvete': IceCream,
  'ice cream': IceCream,
  'picole': IceCream,
  'picolé': IceCream,
  'acai': IceCream,
  'açai': IceCream,
  
  // Sucos
  'suco': Apple,
  'juice': Apple,
  'del valle': Apple,
  
  // Vodka/Destilados
  'vodka': Wine,
  'whisky': Wine,
  'whiskey': Wine,
  'sake': Wine,
  'saquê': Wine,
  
  // Vinho
  'vinho': Wine,
  'wine': Wine,
  
  // Comidas/Lanches
  'lanche': Pizza,
  'sanduiche': Pizza,
  'hamburguer': Pizza,
  'pizza': Pizza,
  'sopa': Soup,
  'miojo': Soup,
  'nissin': Soup,
  'carne': Beef,
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
