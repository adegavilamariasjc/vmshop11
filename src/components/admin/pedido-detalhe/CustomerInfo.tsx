
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
      <div><strong>Cliente:</strong> {name}</div>
      <div><strong>Endereço:</strong> {address}, {number || ''}</div>
      {complement && (
        <div><strong>Complemento:</strong> {complement}</div>
      )}
      {reference && (
        <div><strong>Referência:</strong> {reference}</div>
      )}
      <div><strong>Bairro:</strong> {district}</div>
      <div><strong>WhatsApp:</strong> {whatsapp}</div>
      {observation && (
        <div><strong>Observação:</strong> {observation}</div>
      )}
    </div>
  );
};

export default CustomerInfo;
