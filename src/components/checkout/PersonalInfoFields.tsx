
import React from 'react';
import FormField from './FormField';
import { Input } from '@/components/ui/input';

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
  // Format WhatsApp number with proper spacing
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length <= 11) {
      let formattedValue = value;
      
      // Format as "XX XXXXXXXXX" (e.g., "12 999999999")
      if (value.length > 2) {
        formattedValue = `${value.slice(0, 2)} ${value.slice(2)}`;
      }
      
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name: 'whatsapp',
          value: formattedValue
        }
      };
      
      onChange(syntheticEvent);
    }
  };
  
  return (
    <div className="space-y-3">
      <div>
        <FormField id="nome" label="Nome" required>
          <Input
            id="nome"
            name="nome"
            type="text"
            value={nome}
            onChange={onChange}
            className="w-full bg-gray-800 text-gray-200 text-shadow-dark border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            placeholder="Seu nome completo"
            required
            style={{color: '#e2e2e2'}} // Enforce light text color
          />
        </FormField>
      </div>
      
      <div>
        <FormField id="whatsapp" label="WhatsApp" required>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            value={whatsapp}
            onChange={handleWhatsAppChange}
            className="w-full bg-gray-800 text-gray-200 text-shadow-dark border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            placeholder="Ex: 12 999999999"
            required
            maxLength={13} // 2 digits + space + 9 digits = 12 chars
            style={{color: '#e2e2e2'}} // Enforce light text color
          />
        </FormField>
      </div>
    </div>
  );
};

export default PersonalInfoFields;
