import { Bairro, AlcoholOption, Product } from '../types';
import { 
  fetchCategories, 
  fetchProducts, 
  fetchBairros, 
  fetchIceFlavors, 
  fetchAlcoholOptions,
  saveBairro as saveBairroService,
  updateBairro as updateBairroService,
  deleteBairro as deleteBairroService,
  saveCategory as saveCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  moveCategoryOrder as moveCategoryOrderService,
  saveProduct as saveProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  migrateExistingData
} from '../services/supabaseService';

export const categories = [
  "Copão Whisky",
  "Copão Vodka",
  "Copão Gin",
  "Combos Whisky",
  "Combos Vodka",
  "Combos Gin",
  "Cervejas",
  "Vinhos",
  "Refrigerantes",
  "Energéticos",
  "Corotes",
  "Caipirinhas",
  "Drinks 43",
  "Drinks Gourmet",
  "Batidas",
  "Batidas Kids 0%",
  "Ices",
  "Gelos",
  "Água",
  "Gins",
  "Vodkas",
  "Whiskys",
  "Licores",
  "Sucos",
  "Doces",
  "Tabacaria",
  "Diversos"
];

export const products = {
  "Copão Whisky": [
    { name: "Copão Master Gold Tradicional", price: 8.00 },
    { name: "Copão Master Gold Fusion", price: 10.00 },
    { name: "Copão Master Gold Red Bull", price: 18.00 },
    { name: "Copão Master Gold Monster", price: 21.00 },
    { name: "Copão Passport Tradicional", price: 15.00 },
    { name: "Copão Passport Fusion", price: 18.00 },
    { name: "Copão Passport Red Bull", price: 25.00 },
    { name: "Copão Passport Monster", price: 28.00 },
    { name: "Copão Passport Mel Tradicional", price: 15.00 },
    { name: "Copão Passport Mel Fusion", price: 18.00 },
    { name: "Copão Passport Mel Red Bull", price: 25.00 },
    { name: "Copão Passport Mel Monster", price: 28.00 },
    { name: "Copão White Horse Tradicional", price: 20.00 },
    { name: "Copão White Horse Fusion", price: 23.00 },
    { name: "Copão White Horse Red Bull", price: 30.00 },
    { name: "Copão White Horse Monster", price: 33.00 },
    { name: "Copão Ballantine's Tradicional", price: 20.00 },
    { name: "Copão Ballantine's Fusion", price: 23.00 },
    { name: "Copão Ballantine's Red Bull", price: 30.00 },
    { name: "Copão Ballantine's Monster", price: 33.00 },
    { name: "Copão Red Label Fusion", price: 25.00 },
    { name: "Copão Red Label Red Bull", price: 35.00 },
    { name: "Copão Red Label Monster", price: 38.00 },
    { name: "Copão Black Label Fusion", price: 45.00 },
    { name: "Copão Black Label Red Bull", price: 55.00 },
    { name: "Copão Black Label Monster", price: 58.00 },
    { name: "Copão Jack Daniel's Fusion", price: 35.00 },
    { name: "Copão Jack Daniel's Red Bull", price: 45.00 },
    { name: "Copão Jack Daniel's Monster", price: 48.00 },
    { name: "Copão Jack Daniel's Mel Fusion", price: 35.00 },
    { name: "Copão Jack Daniel's Mel Red Bull", price: 45.00 },
    { name: "Copão Jack Daniel's Mel Monster", price: 48.00 },
    { name: "Copão Jack Daniel's Maçã Fusion", price: 35.00 },
    { name: "Copão Jack Daniel's Maçã Red Bull", price: 45.00 },
    { name: "Copão Jack Daniel's Maçã Monster", price: 48.00 },
    { name: "Copão Jack Daniel's Canela Fusion", price: 35.00 },
    { name: "Copão Jack Daniel's Canela Red Bull", price: 45.00 },
    { name: "Copão Jack Daniel's Canela Monster", price: 48.00 },
    { name: "Copão Buchanan's Fusion", price: 45.00 },
    { name: "Copão Buchanan's Red Bull", price: 55.00 },
    { name: "Copão Buchanan's Monster", price: 58.00 }
  ],
  "Copão Vodka": [
    { name: "Copão Master Black Tradicional", price: 8.00 },
    { name: "Copão Master Black Baly", price: 10.00 },
    { name: "Copão Master Black Red Bull", price: 20.00 },
    { name: "Copão Master Black Monster", price: 23.00 },
    { name: "Copão Askov Tradicional", price: 10.00 },
    { name: "Copão Askov Baly", price: 12.00 },
    { name: "Copão Askov Red Bull", price: 22.00 },
    { name: "Copão Askov Monster", price: 31.00 },
    { name: "Copão Smirnoff Tradicional", price: 15.00 },
    { name: "Copão Smirnoff Baly", price: 17.00 },
    { name: "Copão Smirnoff Red Bull", price: 25.00 },
    { name: "Copão Smirnoff Monster", price: 31.00 },
    { name: "Copão Smirnoff Melancia Baly", price: 25.00 },
    { name: "Copão Smirnoff Melancia Red Bull", price: 35.00 },
    { name: "Copão Smirnoff Melancia Monster", price: 38.00 },
    { name: "Copão Smirnoff Maracujá Baly", price: 25.00 },
    { name: "Copão Smirnoff Maracujá Red Bull", price: 35.00 },
    { name: "Copão Smirnoff Maracujá Monster", price: 38.00 },
    { name: "Copão Absolut Baly", price: 25.00 },
    { name: "Copão Absolut Red Bull", price: 35.00 },
    { name: "Copão Absolut Monster", price: 41.00 },
    { name: "Copão Ciroc Baly", price: 45.00 },
    { name: "Copão Ciroc Red Bull", price: 55.00 },
    { name: "Copão Ciroc Monster", price: 58.00 },
    { name: "Copão Ciroc Redberry Baly", price: 45.00 },
    { name: "Copão Ciroc Redberry Red Bull", price: 55.00 },
    { name: "Copão Ciroc Redberry Monster", price: 58.00 }
  ],
  "Copão Gin": [
    { name: "Copão Intencion Tradicional", price: 15.00 },
    { name: "Copão Intencion Baly", price: 15.00 },
    { name: "Copão Intencion Red Bull", price: 25.00 },
    { name: "Copão Intencion Monster", price: 28.00 },
    { name: "Copão Ópera Tradicional", price: 15.00 },
    { name: "Copão Ópera Baly", price: 15.00 },
    { name: "Copão Ópera Red Bull", price: 25.00 },
    { name: "Copão Ópera Monster", price: 28.00 },
    { name: "Copão Rocks Tradicional", price: 20.00 },
    { name: "Copão Rocks Baly", price: 20.00 },
    { name: "Copão Rocks Red Bull", price: 30.00 },
    { name: "Copão Rocks Monster", price: 33.00 },
    { name: "Copão Rocks Strawberry Tradicional", price: 20.00 },
    { name: "Copão Rocks Strawberry Baly", price: 20.00 },
    { name: "Copão Rocks Strawberry Red Bull", price: 30.00 },
    { name: "Copão Rocks Strawberry Monster", price: 33.00 },
    { name: "Copão Gordons Baly", price: 25.00 },
    { name: "Copão Gordons Red Bull", price: 35.00 },
    { name: "Copão Gordons Monster", price: 38.00 },
    { name: "Copão Beefeater Baly", price: 30.00 },
    { name: "Copão Beefeater Red Bull", price: 40.00 },
    { name: "Copão Beefeater Monster", price: 43.00 },
    { name: "Copão Tanqueray Baly", price: 35.00 },
    { name: "Copão Tanqueray Red Bull", price: 45.00 },
    { name: "Copão Tanqueray Monster", price: 48.00 },
    { name: "Copão Tanqueray Royale Baly", price: 35.00 },
    { name: "Copão Tanqueray Royale Red Bull", price: 45.00 },
    { name: "Copão Tanqueray Royale Monster", price: 48.00 },
    { name: "Copão Tanqueray Sevilla Baly", price: 35.00 },
    { name: "Copão Tanqueray Sevilla Red Bull", price: 45.00 },
    { name: "Copão Tanqueray Sevilla Monster", price: 48.00 }
  ],
  "Combos Whisky": [
    { name: "Combo Master Gold e Tradicional", price: 45.00 },
    { name: "Combo Master Gold e Fusion", price: 55.00 },
    { name: "Combo Master Gold e Red Bull", price: 85.00 },
    { name: "Combo Master Gold e Monster", price: 95.00 },
    { name: "Combo Passport e Tradicional", price: 80.00 },
    { name: "Combo Passport e Fusion", price: 90.00 },
    { name: "Combo Passport e Red Bull", price: 120.00 },
    { name: "Combo Passport e Monster", price: 135.00 },
    { name: "Combo Passport Mel e Tradicional", price: 80.00 },
    { name: "Combo Passport Mel e Fusion", price: 90.00 },
    { name: "Combo Passport Mel e Red Bull", price: 120.00 },
    { name: "Combo Passport Mel e Monster", price: 135.00 },
    { name: "Combo White Horse e Tradicional", price: 110.00 },
    { name: "Combo White Horse e Fusion", price: 120.00 },
    { name: "Combo White Horse e Red Bull", price: 150.00 },
    { name: "Combo White Horse e Monster", price: 165.00 },
    { name: "Combo Ballantine's e Tradicional", price: 115.00 },
    { name: "Combo Ballantine's e Fusion", price: 125.00 },
    { name: "Combo Ballantine's e Red Bull", price: 155.00 },
    { name: "Combo Ballantine's e Monster", price: 170.00 },
    { name: "Combo Red Label e Tradicional", price: 135.00 },
    { name: "Combo Red Label e Fusion", price: 145.00 },
    { name: "Combo Red Label e Red Bull", price: 175.00 },
    { name: "Combo Red Label e Monster", price: 190.00 },
    { name: "Combo Black Label e Tradicional", price: 225.00 },
    { name: "Combo Black Label e Fusion", price: 235.00 },
    { name: "Combo Black Label e Red Bull", price: 265.00 },
    { name: "Combo Black Label e Monster", price: 280.00 },
    { name: "Combo Jack Daniel's e Tradicional", price: 185.00 },
    { name: "Combo Jack Daniel's e Fusion", price: 195.00 },
    { name: "Combo Jack Daniel's e Red Bull", price: 225.00 },
    { name: "Combo Jack Daniel's e Monster", price: 240.00 },
    { name: "Combo Jack Daniel's Mel e Tradicional", price: 185.00 },
    { name: "Combo Jack Daniel's Mel e Fusion", price: 195.00 },
    { name: "Combo Jack Daniel's Mel e Red Bull", price: 225.00 },
    { name: "Combo Jack Daniel's Mel e Monster", price: 240.00 },
    { name: "Combo Jack Daniel's Maçã e Tradicional", price: 185.00 },
    { name: "Combo Jack Daniel's Maçã e Fusion", price: 195.00 },
    { name: "Combo Jack Daniel's Maçã e Red Bull", price: 225.00 },
    { name: "Combo Jack Daniel's Maçã e Monster", price: 260.00 },
    { name: "Combo Jack Daniel's Canela e Tradicional", price: 185.00 },
    { name: "Combo Jack Daniel's Canela e Fusion", price: 195.00 },
    { name: "Combo Jack Daniel's Canela e Red Bull", price: 225.00 },
    { name: "Combo Jack Daniel's Canela e Monster", price: 260.00 },
    { name: "Combo Buchanan's e Tradicional", price: 221.00 },
    { name: "Combo Buchanan's e Fusion", price: 245.00 },
    { name: "Combo Buchanan's e Red Bull", price: 261.00 },
    { name: "Combo Buchanan's e Monster", price: 276.00 }
  ],
  "Combos Vodka": [
    { name: "Combo Master Black e Tradicional", price: 40.00 },
    { name: "Combo Master Black e Baly", price: 45.00 },
    { name: "Combo Master Black e Red Bull", price: 90.00 },
    { name: "Combo Master Black e Monster", price: 105.00 },
    { name: "Combo Askov e Tradicional", price: 44.00 },
    { name: "Combo Askov e Baly", price: 49.00 },
    { name: "Combo Askov e Red Bull", price: 94.00 },
    { name: "Combo Askov e Monster", price: 109.00 },
    { name: "Combo Smirnoff e Tradicional", price: 70.00 },
    { name: "Combo Smirnoff e Baly", price: 75.00 },
    { name: "Combo Smirnoff e Red Bull", price: 120.00 },
    { name: "Combo Smirnoff e Monster", price: 135.00 },
    { name: "Combo Smirnoff Melancia e Baly", price: 99.00 },
    { name: "Combo Smirnoff Melancia e Red Bull", price: 144.00 },
    { name: "Combo Smirnoff Melancia e Monster", price: 159.00 },
    { name: "Combo Smirnoff Maracujá e Baly", price: 99.00 },
    { name: "Combo Smirnoff Maracujá e Red Bull", price: 144.00 },
    { name: "Combo Smirnoff Maracujá e Monster", price: 159.00 },
    { name: "Combo Absolut e Baly", price: 145.00 },
    { name: "Combo Absolut e Red Bull", price: 185.00 },
    { name: "Combo Absolut e Monster", price: 200.00 },
    { name: "Combo Ciroc e Baly", price: 209.00 },
    { name: "Combo Ciroc e Red Bull", price: 254.00 },
    { name: "Combo Ciroc e Monster", price: 269.00 },
    { name: "Combo Ciroc Redberry e Baly", price: 219.00 },
    { name: "Combo Ciroc Redberry e Red Bull", price: 264.00 },
    { name: "Combo Ciroc Redberry e Monster", price: 279.00 }
  ],
  "Combos Gin": [
    { name: "Combo Intencion e Tradicional", price: 50.00 },
    { name: "Combo Intencion e Baly", price: 50.00 },
    { name: "Combo Intencion e Red Bull", price: 100.00 },
    { name: "Combo Intencion e Monster", price: 105.00 },
    { name: "Combo Ópera e Tradicional", price: 50.00 },
    { name: "Combo Ópera e Baly", price: 50.00 },
    { name: "Combo Ópera e Red Bull", price: 100.00 },
    { name: "Combo Ópera e Monster", price: 105.00 },
    { name: "Combo Rocks e Tradicional", price: 65.00 },
    { name: "Combo Rocks e Baly", price: 65.00 },
    { name: "Combo Rocks e Red Bull", price: 110.00 },
    { name: "Combo Rocks e Monster", price: 115.00 },
    { name: "Combo Rocks Strawberry e Tradicional", price: 65.00 },
    { name: "Combo Rocks Strawberry e Baly", price: 65.00 },
    { name: "Combo Rocks Strawberry e Red Bull", price: 110.00 },
    { name: "Combo Rocks Strawberry e Monster", price: 115.00 },
    { name: "Combo Gordons e Baly", price: 105.00 },
    { name: "Combo Gordons e Red Bull", price: 150.00 },
    { name: "Combo Gordons e Monster", price: 155.00 },
    { name: "Combo Beefeater e Baly", price: 130.00 },
    { name: "Combo Beefeater e Red Bull", price: 175.00 },
    { name: "Combo Beefeater e Monster", price: 179.00 },
    { name: "Combo Tanqueray e Baly", price: 165.00 },
    { name: "Combo Tanqueray e Red Bull", price: 210.00 },
    { name: "Combo Tanqueray e Monster", price: 215.00 },
    { name: "Combo Tanqueray Royale e Baly", price: 165.00 },
    { name: "Combo Tanqueray Royale e Red Bull", price: 210.00 },
    { name: "Combo Tanqueray Royale e Monster", price: 215.00 },
    { name: "Combo Tanqueray Sevilla e Baly", price: 165.00 },
    { name: "Combo Tanqueray Sevilla e Red Bull", price: 210.00 },
    { name: "Combo Tanqueray Sevilla e Monster", price: 215.00 }
  ],
  "Cervejas": [
    { name: "Skol 269ml", price: 3.50 },
    { name: "Skol 350ml", price: 4.00 },
    { name: "Itaipava 269ml", price: 3.00 },
    { name: "Itaipava 350ml", price: 3.50 },
    { name: "Original 269ml", price: 4.50 },
    { name: "Original 350ml", price: 5.50 },
    { name: "Brahma 350ml", price: 4.50 },
    { name: "Brahma Duplo Malte 350ml", price: 5.00 },
    { name: "Heineken 350ml", price: 6.50 },
    { name: "Heineken Zero 350ml", price: 6.50 },
    { name: "Eisenbahn Amarela", price: 5.50 },
    { name: "Eisenbahn Verde", price: 5.50 },
    { name: "Budweiser 269ml ", price: 4.50 },
    { name: "Petra 350ml", price: 4.50 },
    { name: "Império 269ml", price: 4.00 },
    { name: "Império 350ml", price: 4.50 },
    { name: "Amstel 269ml", price: 4.50 },
    { name: "Amstel 350ml", price: 5.50 },
    { name: "Spaten 350ml", price: 6.50 },
    { name: "Skol Beats Senses", price: 9.00 },
    { name: "Skol Beats GT", price: 9.00 },
    { name: "Longneck Budweiser", price: 10.00 },
    { name: "Longneck Corona", price: 10.00 },
    { name: "Longneck Heineken", price: 10.00 },
    { name: "Longneck Heineken 0%", price: 10.00 },
    { name: "Longneck Stella", price: 10.00 },
    { name: "Longneck Skol Beats Senses", price: 12.00 },
    { name: "Longneck Skol Beats GT", price: 12.00 }
  ],
  "Vinhos": [
    { name: "Dani 700ml", price: 22.00 },
    { name: "Cantinho do Vale 880ml", price: 6.00 },
    { name: "Cantinho do Vale 2L", price: 12.00 },
    { name: "Dom Nogueira 900ml", price: 20.00 },
    { name: "Sangue de Boi Suave 1L", price: 20.00 },
    { name: "Sangue de Boi Seco 1L", price: 20.00 },
    { name: "Pergola 1L", price: 28.00 },
    { name: "Chopp de Vinho Draft 600ml", price: 15.00 },
    { name: "Longneck Skol Beats GT", price: 12.00 }
  ],
  "Refrigerantes": [
    { name: "Coca-Cola 2L", price: 12.00 },
    { name: "Coca-Cola Zero 2L", price: 12.00 },
    { name: "Coca-Cola 1L", price: 9.00 },
    { name: "Coca-Cola Zero 1L", price: 9.00 },
    { name: "Fanta Laranja 2L", price: 12.00 },
    { name: "Guaraná Antatica 2L", price: 12.00 },
    { name: "TISS Sabores 2L", price: 7.50 },
    { name: "Coca-Cola 200ml", price: 3.00 },
    { name: "Coca-Cola 600ml", price: 8.00 },
    { name: "Guaraná Antarctica 600ml", price: 6.00 },
    { name: "Coca-Cola Lata", price: 6.00 },
    { name: "Coca-Cola Zero 200ml", price: 3.00 },
    { name: "Coca-Cola 600ml", price: 8.00 },
    { name: "Coca-Cola Zero 600ml", price: 8.00 },
    { name: "Sprite 2L", price: 12.00 },
    { name: "Schweppes 1,5L", price: 12.00 },
    { name: "Schweppes Cítrus", price: 12.00 },
    { name: "Schweppes Tônica", price: 12.00 }, 
    { name: "Pepsi 600ml", price: 6.00 },
    { name: "Guaranita 600ml", price: 6.00 }
  ],
  "Energéticos": [
    { name: "Red Bull Tradicional 250ml", price: 12.00 },
    { name: "Red Bull Zero Açúcar 250ml", price: 12.00 },
    { name: "Red Bull Coco com Açaí 250ml", price: 12.00 },
    { name: "Red Bull Frutas Vermelhas 250ml", price: 12.00 },
    { name: "Red Bull Açaí 250ml", price: 12.00 },
    { name: "Red Bull Figo com Maçã 250ml", price: 12.00 },
    { name: "Red Bull Pitaya 250ml", price: 12.00 },
    { name: "Red Bull Melancia 250ml", price: 12.00 },
    { name: "Red Bull Tropical 250ml", price: 12.00 },
    { name: "Red Bull Cereja 250ml", price: 12.00 },
    { name: "Red Bull Melão e Maracujá 250ml", price: 12.00 },
    { name: "Red Bull Pera e Canela 250ml", price: 12.00 },
    { name: "Monster Tradicional 500ml", price: 13.00 },
    { name: "Monster Manga 500ml", price: 13.00 },
    { name: "Monster Melancia 500ml", price: 13.00 },
    { name: "Baly 2 Litros Melancia", price: 16.00 },
    { name: "Baly 2 Litros Morango e Pêssego", price: 16.00 },
    { name: "Baly 2 Litros Maçã Verde", price: 16.00 },
    { name: "Baly 2 Litros Tropical", price: 16.00 },
    { name: "Fusion 2 Litros", price: 20.00 },
    { name: "Big Boss 2 Litros", price: 14.00 }
  ],
  "Corotes": [
    { name: "Corote Puro", price: 6.00 },
    { name: "Corote Limão", price: 6.00 },
    { name: "Corote Maracuja", price: 6.00 },
    { name: "Corote Blueberry", price: 6.00 },
    { name: "Corote Melância", price: 6.00 },
    { name: "Corote Morango", price: 6.00 }
  ],
  "Caipirinhas": [
    { name: "Caipirinha de Limão", price: 20.00 },
    { name: "Caipirinha de Morango", price: 25.00 },
    { name: "Caipirinha de Morango com Limão", price: 28.00 },
    { name: "Caipirinha de Morango com Laranja", price: 35.00 },
    { name: "Caipirinha de Maracujá", price: 20.00 },
    { name: "Caipirinha de Kiwi", price: 25.00 },
    { name: "Caipirinha de Limão com Maracujá", price: 25.00 },
    { name: "Caipirinha de Kiwi com Maracujá", price: 29.00 },
    { name: "Caipirinha de Morango com Maracujá", price: 29.00 },
    { name: "Caipirinha de Manga com Maracujá", price: 29.00 },
    { name: "Caipirinha de Manga com Limão", price: 25.00 },
    { name: "Caipirinha de Goiaba com Limão", price: 25.00 },
    { name: "Caipirinha de Uva com Limão", price: 27.00 },
    { name: "Caipirinha de Uva com Kiwi", price: 29.00 },
    { name: "Caipirinha de Abacaxi", price: 22.00 },
    { name: "Caipirinha de Abacaxi com Limão", price: 27.00 },
    { name: "Caipirinha de Abacaxi com Morango", price: 29.00 },
    { name: "Caipirinha de Abacaxi com Hortelã", price: 27.00 },
    { name: "Caipirinha de Limão com Ice", price: 30.00 },
    { name: "Caipirinha de Morango com Ice", price: 30.00 },
    { name: "Caipirinha de Kiwi com Ice", price: 30.00 },
    { name: "Caipirinha de Maracujá com Ice", price: 30.00 },
    { name: "Caipirinha de Uva com Ice", price: 30.00 },
    { name: "Caipirinha de Abacaxi com Ice", price: 30.00 },
    { name: "Caipirinha de GT com Maracujá", price: 32.00 },
    { name: "Caipirinha de Limão com Ice ZERO", price: 30.00 },
    { name: "Caipirinha de Morango com Ice ZERO", price: 30.00 },
    { name: "Caipirinha de Kiwi com Ice ZERO", price: 30.00 },
    { name: "Caipirinha de Maracujá com Ice ZERO", price: 30.00 },
    { name: "Caipirinha de Uva com Ice ZERO", price: 30.00 },
    { name: "Caipirinha de Abacaxi com Ice ZERO", price: 30.00 },
    { name: "Caipicerva de Limão com Corona ou Heineken", price: 30.00 },
    { name: "Caipicerva de Limão com Corona ou Heineken ZERO", price: 30.00 },
    { name: "Caipicerva de Maracujá com Corona ou Heineken", price: 30.00 },
    { name: "Caipicerva de Maracujá com Corona ou Heineken ZERO", price: 30.00 }
  ],
  "Drinks 43": [
    { name: "Refresco 43 - Licor 43, limão e laranja.", price: 38.00 },
    { name: "Abacaxi 43 - Licor 43, limão e abacaxi", price: 38.00 },
    { name: "Summer 43 - Licor 43, pessego e morango", price: 45.00 },
    { name: "Morty 43 - Licor 43, maracuja e morango", price: 45.00 },
    { name: "Limão 43 - Licor 43, limão", price: 38.00 }
  ]
};

export const alcoholOptions = [
  { name: "Vodka", extraCost: 0 },
  { name: "Pinga", extraCost: 0 },
  { name: "Jurupinga", extraCost: 10 },
  { name: "Whisky", extraCost: 10 },
  { name: "Gin", extraCost: 10 },
  { name: "Saquê", extraCost: 10 }
];

export const iceFlavors = [
  "Gelo de Água", 
  "Coco", 
  "Melancia", 
  "Maracujá", 
  "Maçã Verde", 
  "Morango"
];

export const getMaxIce = (category: string): number => {
  if (category.includes("Copão")) return 4;
  if (category.includes("Combo")) return 8;
  return 2; // Default for other categories
};

export const requiresFlavor = (category: string): boolean => {
  return category.includes("Copão") || category.includes("Combo");
};

export const requiresAlcoholChoice = (category: string): boolean => {
  return category.includes("Caipirinha") || category === "Batidas";
};

export const bairrosList = [
  { nome: "Centro", taxa: 5.00 },
  { nome: "Jardim América", taxa: 7.00 },
  { nome: "Vila Nova", taxa: 10.00 }
];

export const migrateStaticDataToSupabase = async () => {
  return await migrateExistingData();
};

export const loadCategories = async () => {
  try {
    return await fetchCategories();
  } catch (error) {
    console.error("Error loading categories:", error);
    return categories;
  }
};

export const loadProductsByCategory = async (category: string) => {
  try {
    return await fetchProducts(category);
  } catch (error) {
    console.error("Error loading products:", error);
    return products[category] || [];
  }
};

export const loadBairros = async () => {
  try {
    return await fetchBairros();
  } catch (error) {
    console.error("Error loading bairros:", error);
    return bairrosList;
  }
};

export const loadIceFlavors = async () => {
  try {
    return await fetchIceFlavors();
  } catch (error) {
    console.error("Error loading ice flavors:", error);
    return iceFlavors;
  }
};

export const loadAlcoholOptions = async () => {
  try {
    return await fetchAlcoholOptions();
  } catch (error) {
    console.error("Error loading alcohol options:", error);
    return alcoholOptions;
  }
};

export const saveBairro = async (bairro: Bairro) => {
  return await saveBairroService(bairro);
};

export const updateBairro = async (oldNome: string, bairro: Bairro) => {
  return await updateBairroService(oldNome, bairro);
};

export const deleteBairro = async (nome: string) => {
  return await deleteBairroService(nome);
};

export const saveCategory = async (name: string, index: number) => {
  return await saveCategoryService(name, index);
};

export const updateCategory = async (oldName: string, newName: string, index: number) => {
  return await updateCategoryService(oldName, newName, index);
};

export const deleteCategory = async (name: string) => {
  return await deleteCategoryService(name);
};

export const saveProduct = async (product: Product) => {
  return await saveProductService(product);
};

export const updateProduct = async (product: Product, oldName: string) => {
  return await updateProductService(product, oldName);
};

export const deleteProduct = async (product: Pick<Product, 'name' | 'category'>) => {
  return await deleteProductService(product);
};

export const moveCategoryOrder = async (categories: string[]) => {
  return await moveCategoryOrderService(categories);
};

export const gerarCodigoPedido = () => {
  const data = new Date();
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear().toString().slice(-2);
  const horas = data.getHours().toString().padStart(2, '0');
  const minutos = data.getMinutes().toString().padStart(2, '0');
  
  return `${dia}${mes}${ano}-${horas}${minutos}`;
};
