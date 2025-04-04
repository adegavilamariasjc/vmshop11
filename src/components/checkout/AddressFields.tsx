
import React from 'react';
import { FormData } from '../../types';
import FormField from './FormField';

interface AddressFieldsProps {
  form: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AddressFields: React.FC<AddressFieldsProps> = ({ form, handleChange }) => {
  return (
    <>
      <div className="col-span-1">
        <FormField id="endereco" label="Endereço" required>
          <input
            id="endereco"
            name="endereco"
            type="text"
            value={form.endereco}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Rua / Avenida"
            required
          />
        </FormField>
      </div>
      
      <div className="col-span-1">
        <FormField id="numero" label="Número" required>
          <input
            id="numero"
            name="numero"
            type="text"
            value={form.numero}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Número"
            required
          />
        </FormField>
      </div>
      
      <div className="col-span-1">
        <FormField id="complemento" label="Complemento">
          <input
            id="complemento"
            name="complemento"
            type="text"
            value={form.complemento}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Apto / Casa / Bloco"
          />
        </FormField>
      </div>
      
      <div className="col-span-1">
        <FormField id="referencia" label="Referência">
          <input
            id="referencia"
            name="referencia"
            type="text"
            value={form.referencia}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Próximo a..."
          />
        </FormField>
      </div>
      
      <div className="col-span-2">
        <FormField id="observacao" label="Observações">
          <textarea
            id="observacao"
            name="observacao"
            value={form.observacao}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Alguma observação especial?"
            rows={3}
          />
        </FormField>
      </div>
    </>
  );
};

export default AddressFields;
