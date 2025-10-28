import { Badge } from '@/components/ui/badge';

interface StockStatusBadgeProps {
  quantidade: number;
  estoqueMinimo: number;
  unidade?: string;
}

export const StockStatusBadge = ({ 
  quantidade, 
  estoqueMinimo,
  unidade = 'un'
}: StockStatusBadgeProps) => {
  let variant: 'default' | 'secondary' | 'destructive' = 'default';
  let status = 'OK';

  if (quantidade === 0) {
    variant = 'destructive';
    status = 'ESGOTADO';
  } else if (quantidade <= estoqueMinimo) {
    variant = 'secondary';
    status = 'BAIXO';
  }

  return (
    <Badge variant={variant} className="font-mono">
      {quantidade} {unidade} {status !== 'OK' && `- ${status}`}
    </Badge>
  );
};
