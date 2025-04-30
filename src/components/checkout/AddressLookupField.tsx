
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { searchAddressByCep } from '../../utils/addressLookup';
import FormField from './FormField';

interface AddressLookupFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddressFound: (address: { street: string, neighborhood: string }) => void;
}

const AddressLookupField: React.FC<AddressLookupFieldProps> = ({ 
  value = '', 
  onChange, 
  onAddressFound 
}) => {
  const { toast } = useToast();
  const [cep, setCep] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      setCep(value);
      if (onChange) {
        onChange(value);
      }
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
    const address = await searchAddressByCep(cep);
    setIsSearching(false);

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
  };

  return (
    <FormField id="cep" label="CEP (Buscar Endereço - Opcional)">
      <div className="flex">
        <input
          id="cep"
          name="cep"
          type="text"
          value={cep}
          onChange={handleCepChange}
          className="flex-1 p-3 bg-gray-900 border border-gray-600 rounded-l-md text-gray-200"
          placeholder="Apenas números"
          maxLength={8}
        />
        <button
          type="button"
          onClick={searchAddressByZipcode}
          disabled={isSearching || cep.length !== 8}
          className={`flex items-center justify-center px-3 rounded-r-md ${
            isSearching ? 'bg-gray-700' : 'bg-purple-dark hover:bg-purple-600'
          }`}
        >
          <Search size={20} />
        </button>
      </div>
    </FormField>
  );
};

export default AddressLookupField;
