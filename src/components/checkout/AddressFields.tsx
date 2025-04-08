
import React from 'react';
import FormField from './FormField';

interface AddressFieldsProps {
  endereco: string;
  numero: string;
  complemento: string;
  referencia: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const AddressFields: React.FC<AddressFieldsProps> = ({ 
  endereco, 
  numero, 
  complemento, 
  referencia, 
  onChange 
}) => {
  return (
    <div className="space-y-3 grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <FormField id="endereco" label="Endereço" required>
          <input
            id="endereco"
            name="endereco"
            type="text"
            value={endereco}
            onChange={onChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 text-sm"
            placeholder="Rua / Avenida"
            required
          />
        </FormField>
      </div>
      
      <div>
        <FormField id="numero" label="Número" required>
          <input
            id="numero"
            name="numero"
            type="text"
            value={numero}
            onChange={onChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 text-sm"
            placeholder="Número"
            required
          />
        </FormField>
      </div>
      
      <div>
        <FormField id="complemento" label="Complemento">
          <input
            id="complemento"
            name="complemento"
            type="text"
            value={complemento}
            onChange={onChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 text-sm"
            placeholder="Apto / Casa / Bloco"
          />
        </FormField>
      </div>
      
      <div className="col-span-2">
        <FormField id="referencia" label="Referência">
          <input
            id="referencia"
            name="referencia"
            type="text"
            value={referencia}
            onChange={onChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 text-sm"
            placeholder="Próximo a..."
          />
        </FormField>
      </div>
    </div>
  );
};

export default AddressFields;
