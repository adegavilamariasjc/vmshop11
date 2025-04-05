
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { FormData, Bairro } from '../types';
import { bairrosList as bairros } from '../data/bairros';
import PersonalInfoFields from './checkout/PersonalInfoFields';
import AddressFields from './checkout/AddressFields';
import LocationAndPaymentFields from './checkout/LocationAndPaymentFields';
import CheckoutButton from './checkout/CheckoutButton';

interface CheckoutFormProps {
  form: FormData;
  setForm: (form: FormData) => void;
  onSubmit: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ form, setForm, onSubmit }) => {
  const { toast } = useToast();
  
  const formatWhatsApp = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned;
    }
    return cleaned.substring(0, 11);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const requiredFields: (keyof FormData)[] = ['nome', 'endereco', 'numero', 'whatsapp'];
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (form.bairro.nome === "Selecione Um Bairro") {
      toast({
        title: "Bairro não selecionado",
        description: "Por favor, selecione um bairro para entrega.",
        variant: "destructive"
      });
      return;
    }
    
    if (!form.pagamento) {
      toast({
        title: "Forma de pagamento",
        description: "Por favor, selecione uma forma de pagamento.",
        variant: "destructive"
      });
      return;
    }
    
    if (form.pagamento === "Dinheiro" && (!form.troco || isNaN(Number(form.troco)) || Number(form.troco) <= 0)) {
      toast({
        title: "Troco inválido",
        description: "Por favor, informe um valor válido para o troco.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };
  
  const handleBairroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBairroNome = e.target.value;
    const selectedBairro = bairros.find(b => b.nome === selectedBairroNome) || bairros[0];
    
    setForm({
      ...form,
      bairro: selectedBairro
    });
  };
  
  const handlePagamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pagamento = e.target.value;
    
    setForm({
      ...form,
      pagamento,
      // Clear troco if payment method is not cash
      troco: pagamento === "Dinheiro" ? form.troco : ""
    });
  };

  const handleAddressFound = (address: { street: string, neighborhood: string }) => {
    // Try to find a matching bairro in our list
    let matchedBairro = bairros.find(b => 
      b.nome.toLowerCase() === address.neighborhood.toLowerCase()
    ) || form.bairro;

    setForm({
      ...form,
      endereco: address.street,
      bairro: matchedBairro
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <PersonalInfoFields 
          form={form} 
          handleChange={handleChange}
          formatWhatsApp={formatWhatsApp}
          onAddressFound={handleAddressFound}
        />
        
        <AddressFields 
          form={form} 
          handleChange={handleChange}
        />
        
        <LocationAndPaymentFields 
          form={form}
          handleBairroChange={handleBairroChange}
          handlePagamentoChange={handlePagamentoChange}
          handleChange={handleChange}
        />
      </div>
      
      <CheckoutButton />
    </form>
  );
};

export default CheckoutForm;
