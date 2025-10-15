
import React from 'react';

interface CustomerInfoProps {
  name: string;
  address: string;
  number?: string;
  complement?: string;
  reference?: string;
  district: string;
  whatsapp: string;
  observation?: string;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  name,
  address,
  number,
  complement,
  reference,
  district,
  whatsapp,
  observation
}) => {
  return (
    <div className="info">
      <div><strong>Cliente:</strong> {name || 'Não informado'}</div>
      <div><strong>Endereço:</strong> {address || 'Não informado'}{number ? `, ${number}` : ''}</div>
      {complement && complement !== 'null' && complement !== 'undefined' && (
        <div><strong>Complemento:</strong> {complement}</div>
      )}
      {reference && reference !== 'null' && reference !== 'undefined' && (
        <div><strong>Referência:</strong> {reference}</div>
      )}
      <div><strong>Bairro:</strong> {district || 'Não informado'}</div>
      <div><strong>WhatsApp:</strong> {whatsapp || 'Não informado'}</div>
      {observation && observation !== 'null' && observation !== 'undefined' && (
        <div><strong>Observação:</strong> {observation}</div>
      )}
    </div>
  );
};

export default CustomerInfo;
