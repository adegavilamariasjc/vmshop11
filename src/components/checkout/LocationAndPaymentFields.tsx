
import React from 'react';

interface LocationAndPaymentFieldsProps {
  bairro: string;
  pagamento: string;
  troco: string;
  bairros: { nome: string; taxa: number }[];
  observacao: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const LocationAndPaymentFields: React.FC<LocationAndPaymentFieldsProps> = ({
  bairro,
  pagamento,
  troco,
  bairros,
  observacao,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="bairro" className="block text-sm font-medium text-gray-300 mb-1">
          Bairro *
        </label>
        <select
          id="bairro"
          name="bairro"
          value={bairro}
          onChange={onChange}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-2 text-sm"
          required
          style={{color: '#D6BCFA'}} // Light purple text color
        >
          {bairros.map((b) => (
            <option key={b.nome} value={b.nome} style={{color: '#D6BCFA', backgroundColor: '#1f2937'}}>
              {b.nome} {b.taxa > 0 ? `(R$ ${b.taxa.toFixed(2)})` : ''}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="pagamento" className="block text-sm font-medium text-gray-300 mb-1">
          Forma de Pagamento *
        </label>
        <select
          id="pagamento"
          name="pagamento"
          value={pagamento}
          onChange={onChange}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-2 text-sm"
          required
          style={{color: '#D6BCFA'}} // Light purple text color
        >
          <option value="" style={{color: '#D6BCFA', backgroundColor: '#1f2937'}}>Selecione...</option>
          <option value="Dinheiro" style={{color: '#D6BCFA', backgroundColor: '#1f2937'}}>Dinheiro</option>
          <option value="Pix" style={{color: '#D6BCFA', backgroundColor: '#1f2937'}}>Pix</option>
          <option value="Cartão de Crédito" style={{color: '#D6BCFA', backgroundColor: '#1f2937'}}>Cartão de Crédito</option>
          <option value="Cartão de Débito" style={{color: '#D6BCFA', backgroundColor: '#1f2937'}}>Cartão de Débito</option>
        </select>
      </div>
      
      {pagamento === 'Dinheiro' && (
        <div>
          <label htmlFor="troco" className="block text-sm font-medium text-gray-300 mb-1">
            Troco para quanto?
          </label>
          <input
            type="text"
            id="troco"
            name="troco"
            value={troco}
            onChange={onChange}
            placeholder="Exemplo: R$ 50,00"
            className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            style={{color: '#D6BCFA'}} // Light purple text color
          />
        </div>
      )}
      
      <div>
        <label htmlFor="observacao" className="block text-sm font-medium text-gray-300 mb-1">
          Observações
        </label>
        <textarea
          id="observacao"
          name="observacao"
          value={observacao}
          onChange={onChange}
          rows={3}
          placeholder="Instruções para entrega, preferências, etc."
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400" 
          style={{color: '#D6BCFA'}} // Light purple text color
        />
      </div>
    </div>
  );
};

export default LocationAndPaymentFields;
