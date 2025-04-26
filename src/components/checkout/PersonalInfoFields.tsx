
import React from 'react';
import FormField from './FormField';
import { Phone } from 'lucide-react';

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
  // Format WhatsApp number with mask (12) 91234-5678
  const formatWhatsApp = (input: string): string => {
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      // Limit to 11 digits max (including area code)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Handle WhatsApp input with formatting
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatWhatsApp(e.target.value);
    
    // Create a synthetic event with the formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: formattedValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

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
          <div className="relative">
            <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={handleWhatsAppChange}
              className="w-full bg-gray-800 text-white text-shadow-dark border border-gray-700 rounded-md p-2 pl-8 text-sm"
              placeholder="(12) 91234-5678"
              required
              maxLength={16} // (XX) XXXXX-XXXX = 16 chars
            />
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default PersonalInfoFields;
