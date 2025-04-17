
import React from 'react';
import PedidoStatusBadge from '../PedidoStatusBadge';

interface OrderHeaderProps {
  orderCode: string;
  orderDate: string;
  status: string;
  formatDateTime: (dateString: string) => string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ 
  orderCode, 
  orderDate, 
  status, 
  formatDateTime 
}) => {
  return (
    <div className="header">
      <div className="title">ADEGA VM</div>
      <div>PEDIDO #{orderCode}</div>
      <div>{formatDateTime(orderDate)}</div>
      <div className="print-hidden">
        <PedidoStatusBadge status={status} />
      </div>
    </div>
  );
};

export default OrderHeader;
