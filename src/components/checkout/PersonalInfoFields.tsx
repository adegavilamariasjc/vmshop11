
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
  // Format WhatsApp number with proper spacing and validation
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length <= 11) {
      let formattedValue = value;
      
      // Format as "XX XXXXXXXXX" (e.g., "12 999999999")
      if (value.length > 2) {
        formattedValue = `${value.slice(0, 2)} ${value.slice(2)}`;
      }
      
      // Create a proper event-like object compatible with iOS/Safari
      onChange({
        target: {
          name: 'whatsapp',
          value: formattedValue
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Validation for WhatsApp field
  const isWhatsAppValid = whatsapp.replace(/\D/g, '').length >= 10;
  
  return (
    <div className="space-y-3">
      <div>
        <FormField id="nome" label="Nome" required>
          <Input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            value={nome}
            onChange={onChange}
            className="w-full bg-gray-800 text-gray-200 text-shadow-dark border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            placeholder="Seu nome completo"
            style={{color: '#D6BCFA', WebkitAppearance: 'none'}}
          />
        </FormField>
      </div>
      
      <div>
        <FormField id="whatsapp" label="WhatsApp" required>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            pattern="[0-9 ]*"
            value={whatsapp}
            onChange={handleWhatsAppChange}
            className={`w-full bg-gray-800 text-gray-200 text-shadow-dark border rounded-md p-2 text-sm placeholder:text-gray-400 ${
              whatsapp && !isWhatsAppValid ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Ex: 12 999999999"
            style={{color: '#D6BCFA', WebkitAppearance: 'none'}}
          />
          {whatsapp && !isWhatsAppValid && (
            <p className="text-red-500 text-xs mt-1">Digite um número válido com DDD (mínimo 10 dígitos)</p>
          )}
        </FormField>
      </div>
    </div>
  );
};

export default PersonalInfoFields;
