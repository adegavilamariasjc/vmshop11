
import React from 'react';
import FormField from './FormField';
import AddressLookupField from './AddressLookupField';
import { Input } from '@/components/ui/input';

interface AddressFieldsProps {
  endereco: string;
  numero: string;
  complemento: string;
  referencia: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setAddress: (address: { street: string; neighborhood: string }) => void;
}

const AddressFields: React.FC<AddressFieldsProps> = ({
  endereco,
  numero,
  complemento,
  referencia,
  onChange,
  setAddress
}) => {
  // Ensure house number only accepts digits
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'numero',
        value
      }
    };
    
    onChange(syntheticEvent);
  };
  
  return (
    <div className="space-y-3">
      <div>
        <FormField id="endereco" label="Endereço" required>
          <Input
            id="endereco"
            name="endereco"
            type="text"
            value={endereco}
            onChange={onChange}
            className="w-full bg-gray-800 text-gray-200 text-shadow-dark border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            placeholder="Nome da rua"
            required
            style={{color: '#D6BCFA'}} // Light purple text color
          />
        </FormField>
      </div>

      <div>
        <AddressLookupField
          value=""
          onAddressFound={setAddress}
        />
      </div>
      
      <div>
        <FormField id="numero" label="Número" required>
          <Input
            id="numero"
            name="numero"
            type="text"
            inputMode="numeric"
            value={numero}
            onChange={handleNumberChange}
            className="w-full bg-gray-800 text-gray-200 text-shadow-dark border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            placeholder="Apenas números"
            required
            style={{color: '#D6BCFA'}} // Light purple text color
          />
        </FormField>
      </div>
      
      <div>
        <FormField id="complemento" label="Complemento">
          <Input
            id="complemento"
            name="complemento"
            type="text"
            value={complemento}
            onChange={onChange}
            className="w-full bg-gray-800 text-gray-200 text-shadow-dark border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            placeholder="Apto, Bloco, etc."
            style={{color: '#D6BCFA'}} // Light purple text color
          />
        </FormField>
      </div>
      
      <div>
        <FormField id="referencia" label="Ponto de Referência">
          <Input
            id="referencia"
            name="referencia"
            type="text"
            value={referencia}
            onChange={onChange}
            className="w-full bg-gray-800 text-gray-200 text-shadow-dark border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            placeholder="Próximo a..."
            style={{color: '#D6BCFA'}} // Light purple text color
          />
        </FormField>
      </div>
    </div>
  );
};

export default AddressFields;
