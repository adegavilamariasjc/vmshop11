
import React from 'react';
import FormField from './FormField';
import AddressLookupField from './AddressLookupField';
import { MapPin, Search, Home, Building, Info } from 'lucide-react';

interface AddressFieldsProps {
  endereco: string;
  numero: string;
  complemento: string;
  referencia: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setAddress: (address: {street: string, neighborhood: string}) => void;
}

const AddressFields: React.FC<AddressFieldsProps> = ({ 
  endereco, 
  numero, 
  complemento, 
  referencia, 
  onChange,
  setAddress
}) => {
  // Handle number input to only allow digits
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    // Create a synthetic event with only numbers
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  // Ensure street name only contains text and spaces
  const handleStreetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow letters, spaces, accented characters, and basic punctuation
    const value = e.target.value;
    
    // Pass the value through as is (validation will happen at form submission)
    onChange(e);
  };

  return (
    <div className="space-y-3">
      <AddressLookupField onAddressFound={setAddress} />
      
      <div className="col-span-2">
        <FormField id="endereco" label="Endereço" required>
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              id="endereco"
              name="endereco"
              type="text"
              value={endereco}
              onChange={handleStreetInput}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 pl-8 text-sm"
              placeholder="Rua / Avenida"
              required
            />
          </div>
        </FormField>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FormField id="numero" label="Número" required>
            <div className="relative">
              <Home className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                id="numero"
                name="numero"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numero}
                onChange={handleNumberInput}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 pl-8 text-sm"
                placeholder="Apenas números"
                required
              />
            </div>
          </FormField>
        </div>
        
        <div>
          <FormField id="complemento" label="Complemento">
            <div className="relative">
              <Building className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                id="complemento"
                name="complemento"
                type="text"
                value={complemento}
                onChange={onChange}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 pl-8 text-sm"
                placeholder="Apto / Casa / Bloco"
              />
            </div>
          </FormField>
        </div>
      </div>
      
      <div className="col-span-2">
        <FormField id="referencia" label="Referência">
          <div className="relative">
            <Info className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              id="referencia"
              name="referencia"
              type="text"
              value={referencia}
              onChange={onChange}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 pl-8 text-sm"
              placeholder="Próximo a..."
            />
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default AddressFields;
