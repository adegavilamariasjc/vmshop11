
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FormData, Bairro } from '../types';
import { bairros } from '../data/products';
import { Search } from 'lucide-react';

interface CheckoutFormProps {
  form: FormData;
  setForm: (form: FormData) => void;
  onSubmit: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ form, setForm, onSubmit }) => {
  const { toast } = useToast();
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  
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
    
    if (name === 'whatsapp') {
      setForm({
        ...form,
        [name]: formatWhatsApp(value)
      });
      return;
    }
    
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
  
  const handleCepSearch = async () => {
    const cep = form.cep?.replace(/\D/g, '');
    
    if (!cep || cep.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Por favor, digite um CEP válido com 8 números.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado.",
          variant: "destructive"
        });
        return;
      }
      
      // Encontrar o bairro correspondente na lista
      let matchedBairro = bairros.find(b => 
        b.nome.toLowerCase() === data.bairro.toLowerCase()
      );
      
      // Se não encontrou um bairro exato, deixa o usuário escolher
      if (!matchedBairro) {
        matchedBairro = form.bairro;
      }
      
      setForm({
        ...form,
        endereco: data.logradouro,
        bairro: matchedBairro,
        complemento: data.complemento || form.complemento
      });
      
      toast({
        title: "Endereço encontrado",
        description: "Os dados do endereço foram preenchidos automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar o endereço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCep(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="col-span-2">
          <label htmlFor="nome" className="block text-sm font-medium text-white mb-1">
            Nome *
          </label>
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
        </div>
        
        <div className="col-span-2 md:col-span-1">
          <label htmlFor="cep" className="block text-sm font-medium text-white mb-1">
            CEP
          </label>
          <div className="flex">
            <input
              id="cep"
              name="cep"
              type="text"
              value={form.cep || ''}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-l-md text-white"
              placeholder="Digite o CEP"
              maxLength={9}
            />
            <button 
              type="button" 
              onClick={handleCepSearch}
              disabled={isLoadingCep}
              className="bg-purple-dark p-3 rounded-r-md text-white hover:bg-purple-600 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
        
        <div className="col-span-1">
          <label htmlFor="endereco" className="block text-sm font-medium text-white mb-1">
            Endereço *
          </label>
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
        </div>
        
        <div className="col-span-1">
          <label htmlFor="numero" className="block text-sm font-medium text-white mb-1">
            Número *
          </label>
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
        </div>
        
        <div className="col-span-1">
          <label htmlFor="complemento" className="block text-sm font-medium text-white mb-1">
            Complemento
          </label>
          <input
            id="complemento"
            name="complemento"
            type="text"
            value={form.complemento}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Apto / Casa / Bloco"
          />
        </div>
        
        <div className="col-span-1">
          <label htmlFor="referencia" className="block text-sm font-medium text-white mb-1">
            Referência
          </label>
          <input
            id="referencia"
            name="referencia"
            type="text"
            value={form.referencia}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Próximo a..."
          />
        </div>
        
        <div className="col-span-2">
          <label htmlFor="whatsapp" className="block text-sm font-medium text-white mb-1">
            WhatsApp *
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="text"
            value={form.whatsapp}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Ex: 12999999999"
            required
            maxLength={11}
          />
        </div>
        
        <div className="col-span-2">
          <label htmlFor="observacao" className="block text-sm font-medium text-white mb-1">
            Observações
          </label>
          <textarea
            id="observacao"
            name="observacao"
            value={form.observacao}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Alguma observação especial?"
            rows={3}
          />
        </div>
        
        {/* Emphasized bairro selection */}
        <div className="col-span-2">
          <label htmlFor="bairro" className="block text-lg font-medium text-purple-light mb-1">
            Selecione Um Bairro *
          </label>
          <select
            id="bairro"
            name="bairro"
            value={form.bairro.nome}
            onChange={handleBairroChange}
            className="w-full p-3 bg-gray-800 border-2 border-purple-dark rounded-md text-white"
            required
          >
            {bairros.map((bairro) => (
              <option key={bairro.nome} value={bairro.nome} disabled={bairro.nome === "Selecione Um Bairro"}>
                {bairro.nome} {bairro.taxa > 0 ? `(R$ ${bairro.taxa.toFixed(2)})` : ''}
              </option>
            ))}
          </select>
        </div>
        
        {/* Emphasized payment method selection */}
        <div className="col-span-2">
          <label htmlFor="pagamento" className="block text-lg font-medium text-purple-light mb-1">
            Selecione Forma de Pagamento *
          </label>
          <select
            id="pagamento"
            name="pagamento"
            value={form.pagamento}
            onChange={handlePagamentoChange}
            className="w-full p-3 bg-gray-800 border-2 border-purple-dark rounded-md text-white"
            required
          >
            <option value="" disabled>Escolha uma forma de pagamento</option>
            <option value="Cartão">Cartão</option>
            <option value="Pix">Pix</option>
            <option value="Dinheiro">Dinheiro</option>
          </select>
        </div>
        
        {form.pagamento === "Dinheiro" && (
          <div className="col-span-2">
            <label htmlFor="troco" className="block text-sm font-medium text-white mb-1">
              Troco para quanto? *
            </label>
            <input
              id="troco"
              name="troco"
              type="number"
              value={form.troco}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white"
              placeholder="Valor para troco"
              required
              min="1"
              step="0.01"
            />
          </div>
        )}
      </div>
      
      <button
        type="submit"
        className="w-full p-3 bg-purple-dark hover:bg-purple text-white rounded-md font-bold"
      >
        Enviar Pedido via WhatsApp
      </button>
    </form>
  );
};

export default CheckoutForm;
