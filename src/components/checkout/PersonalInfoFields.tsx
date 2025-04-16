
import React from 'react';
import FormField from './FormField';

interface PersonalInfoFieldsProps {
  nome: string;
  whatsapp: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  nome,
  whatsapp,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <div>
        <FormField id="nome" label="Nome" required>
          <input
            id="nome"
            name="nome"
            type="text"
            value={nome}
            onChange={onChange}
            className="w-full bg-gray-800 text-white text-shadow-dark border border-gray-700 rounded-md p-2 text-sm"
            placeholder="Seu nome completo"
            required
          />
        </FormField>
      </div>
      
      <div>
        <FormField id="whatsapp" label="WhatsApp" required>
          <input
            id="whatsapp"
            name="whatsapp"
            type="text"
            value={whatsapp}
            onChange={onChange}
            className="w-full bg-gray-800 text-white text-shadow-dark border border-gray-700 rounded-md p-2 text-sm"
            placeholder="Ex: 12999999999"
            required
            maxLength={14}
          />
        </FormField>
      </div>
    </div>
  );
};

export default PersonalInfoFields;
