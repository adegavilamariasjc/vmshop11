
import React from 'react';
import { FormData } from '../types';
import AddressFields from './checkout/AddressFields';
import LocationAndPaymentFields from './checkout/LocationAndPaymentFields';
import PersonalInfoFields from './checkout/PersonalInfoFields';

interface CheckoutFormProps {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  bairros: { nome: string; taxa: number }[];
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ form, setForm, bairros }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'bairro') {
      const selectedBairro = bairros.find(b => b.nome === value) || bairros[0];
      setForm(prev => ({
        ...prev,
        bairro: selectedBairro
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddressFound = (address: { street: string, neighborhood: string }) => {
    setForm(prev => ({
      ...prev,
      endereco: address.street
    }));

    // Attempt to find matching neighborhood in available bairros
    if (address.neighborhood) {
      const matchingBairro = bairros.find(b => 
        b.nome.toLowerCase() === address.neighborhood.toLowerCase()
      );
      
      if (matchingBairro) {
        setForm(prev => ({
          ...prev,
          bairro: matchingBairro
        }));
      }
    }
  };

  return (
    <div className="bg-black/50 p-4 rounded-md">
      <h3 className="text-lg font-semibold text-white mb-4">Dados para Entrega</h3>
      
      <div className="space-y-4">
        <PersonalInfoFields
          nome={form.nome}
          whatsapp={form.whatsapp}
          onChange={handleInputChange}
        />
        
        <AddressFields
          endereco={form.endereco}
          numero={form.numero}
          complemento={form.complemento}
          referencia={form.referencia}
          onChange={handleInputChange}
          setAddress={handleAddressFound}
        />
        
        <LocationAndPaymentFields
          bairro={form.bairro.nome}
          pagamento={form.pagamento}
          troco={form.troco}
          bairros={bairros}
          observacao={form.observacao}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default CheckoutForm;
