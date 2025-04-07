
import React, { useState, useEffect } from 'react';
import { FormData, Bairro } from '../../types';
import { loadBairros } from '../../data/bairros';
import FormField from './FormField';
import { useToast } from '@/hooks/use-toast';

interface LocationAndPaymentFieldsProps {
  form: FormData;
  handleBairroChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePagamentoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const LocationAndPaymentFields: React.FC<LocationAndPaymentFieldsProps> = ({
  form,
  handleBairroChange,
  handlePagamentoChange,
  handleChange
}) => {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBairros();
  }, []);

  const fetchBairros = async () => {
    setIsLoading(true);
    try {
      const data = await loadBairros();
      console.log("Bairros carregados:", data);
      
      // Certifique-se de que sempre há pelo menos um bairro (o padrão)
      if (data.length === 0) {
        setBairros([{ nome: "Selecione Um Bairro", taxa: 0 }]);
        toast({
          title: "Aviso",
          description: "Nenhum bairro disponível. Por favor, entre em contato conosco.",
          variant: "warning",
        });
      } else {
        // Certifique-se de que o bairro padrão "Selecione Um Bairro" sempre esteja na lista
        const hasPadrao = data.some(b => b.nome === "Selecione Um Bairro");
        
        if (!hasPadrao) {
          setBairros([{ nome: "Selecione Um Bairro", taxa: 0 }, ...data]);
        } else {
          setBairros(data);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar bairros:", error);
      setBairros([{ nome: "Selecione Um Bairro", taxa: 0 }]);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de bairros",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bairro selection */}
      <div className="col-span-2">
        <label htmlFor="bairro" className="block text-lg font-medium text-purple-light mb-1">
          Selecione Um Bairro *
        </label>
        {isLoading ? (
          <div className="w-full p-3 bg-gray-800 border-2 border-purple-dark rounded-md text-gray-500">
            Carregando bairros...
          </div>
        ) : (
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
        )}
      </div>
      
      {/* Payment method selection */}
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
          <FormField id="troco" label="Troco para quanto?" required>
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
          </FormField>
        </div>
      )}
    </>
  );
};

export default LocationAndPaymentFields;
