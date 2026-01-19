
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
          className="w-full bg-gray-800 text-purple-200 border border-gray-700 rounded-md p-2 text-sm appearance-none"
          style={{
            color: '#D6BCFA',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          {bairros.map((b) => (
            <option key={b.nome} value={b.nome}>
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
          className="w-full bg-gray-800 text-purple-200 border border-gray-700 rounded-md p-2 text-sm appearance-none"
          style={{
            color: '#D6BCFA',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value="">Selecione...</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Pix">Pix</option>
          <option value="Cartão de Crédito">Cartão de Crédito</option>
          <option value="Cartão de Débito">Cartão de Débito</option>
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
            autoComplete="off"
            value={troco}
            onChange={onChange}
            placeholder="Exemplo: R$ 50,00"
            className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400"
            style={{color: '#D6BCFA', WebkitAppearance: 'none'}}
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
          autoComplete="off"
          value={observacao}
          onChange={onChange}
          rows={3}
          placeholder="Instruções para entrega, preferências, etc."
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-2 text-sm placeholder:text-gray-400" 
          style={{color: '#D6BCFA', WebkitAppearance: 'none'}}
        />
      </div>
    </div>
  );
};

export default LocationAndPaymentFields;
