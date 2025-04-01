
export interface Product {
  name: string;
  price: number;
  category?: string;
  qty?: number;
  ice?: Record<string, number>;
  alcohol?: string;
  fruits?: string[]; // Array com as frutas selecionadas
}

export interface Bairro {
  nome: string;
  taxa: number;
}

export interface AlcoholOption {
  name: string;
  extraCost: number;
}

export interface FormData {
  nome: string;
  endereco: string;
  numero: string;
  complemento: string;
  referencia: string;
  observacao: string;
  whatsapp: string;
  bairro: Bairro;
  pagamento: string;
  troco: string;
  cep?: string;
}
