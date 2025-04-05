
import { Bairro } from '../types';
import { fetchBairros, saveBairro as saveBairroService, updateBairro as updateBairroService, deleteBairro as deleteBairroService } from '../services/supabaseService';

// Bairros (neighborhoods) data
export const bairrosList = [
  { nome: "Centro", taxa: 5.00 },
  { nome: "Jardim América", taxa: 7.00 },
  { nome: "Vila Nova", taxa: 10.00 }
];

export const loadBairros = async () => {
  try {
    return await fetchBairros();
  } catch (error) {
    console.error("Error loading bairros:", error);
    return bairrosList;
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
