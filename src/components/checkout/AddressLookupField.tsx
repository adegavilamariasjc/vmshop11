
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2 } from 'lucide-react';
import { searchAddressByCep } from '../../utils/addressLookup';
import FormField from './FormField';

interface AddressLookupFieldProps {
  onAddressFound: (address: { street: string, neighborhood: string }) => void;
}

const AddressLookupField: React.FC<AddressLookupFieldProps> = ({ onAddressFound }) => {
  const { toast } = useToast();
  const [cep, setCep] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      setCep(value);
    }
    
    // Auto-search when CEP reaches 8 digits
    if (value.length === 8 && !isSearching) {
      searchAddressByZipcode();
    }
  };

  const formatCep = (cep: string): string => {
    if (cep.length <= 5) {
      return cep;
    } else {
      return `${cep.slice(0, 5)}-${cep.slice(5)}`;
    }
  };

  const searchAddressByZipcode = async () => {
    if (cep.length !== 8) {
      toast({
        title: "CEP Inválido",
        description: "Por favor, digite um CEP válido com 8 dígitos.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const address = await searchAddressByCep(cep);
      
      if (!address) {
        toast({
          title: "Endereço não encontrado",
          description: "Não foi possível encontrar o endereço para o CEP informado.",
          variant: "destructive"
        });
        return;
      }

      onAddressFound(address);

      toast({
        title: "Endereço encontrado",
        description: "O endereço foi preenchido automaticamente.",
      });
    } catch (error) {
      console.error('Error searching address:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar o endereço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <FormField id="cep" label="CEP (Buscar Endereço - Opcional)">
      <div className="flex">
        <input
          id="cep"
          name="cep"
          type="text"
          value={formatCep(cep)}
          onChange={handleCepChange}
          className="flex-1 p-3 bg-gray-900 border border-gray-600 rounded-l-md text-white"
          placeholder="Digite apenas números"
          maxLength={9} // 00000-000
        />
        <button
          type="button"
          onClick={searchAddressByZipcode}
          disabled={isSearching || cep.length !== 8}
          className={`flex items-center justify-center px-3 rounded-r-md ${
            isSearching ? 'bg-gray-700' : 'bg-purple-dark hover:bg-purple-600'
          }`}
        >
          {isSearching ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Search size={20} />
          )}
        </button>
      </div>
    </FormField>
  );
};

export default AddressLookupField;
