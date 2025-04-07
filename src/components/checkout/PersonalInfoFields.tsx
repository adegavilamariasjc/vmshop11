
import React from 'react';
import { FormData } from '../../types';
import FormField from './FormField';
import AddressLookupField from './AddressLookupField';
import { Bairro } from '../../types';

interface PersonalInfoFieldsProps {
  form: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  formatWhatsApp: (number: string) => string;
  onAddressFound: (address: { street: string, neighborhood: string }) => void;
}

const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ 
  form, 
  handleChange, 
  formatWhatsApp, 
  onAddressFound 
}) => {
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatWhatsApp(e.target.value);
    const event = {
      ...e,
      target: {
        ...e.target,
        name: 'whatsapp',
        value: formattedValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleChange(event);
  };

  return (
    <>
      <div className="col-span-2">
        <FormField id="nome" label="Nome" required>
          <input
            id="nome"
            name="nome"
            type="text"
            value={form.nome}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Seu nome completo"
            required
          />
        </FormField>
      </div>
      
      <div className="col-span-2 md:col-span-1">
        <AddressLookupField onAddressFound={onAddressFound} />
      </div>
      
      <div className="col-span-2 md:col-span-1">
        <FormField id="whatsapp" label="WhatsApp" required>
          <input
            id="whatsapp"
            name="whatsapp"
            type="text"
            value={form.whatsapp}
            onChange={handleWhatsAppChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Ex: 12999999999"
            required
            maxLength={11}
          />
        </FormField>
      </div>
    </>
  );
};

export default PersonalInfoFields;
