import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProfitMarginBadgeProps {
  margem: number;
}

export const ProfitMarginBadge = ({ margem }: ProfitMarginBadgeProps) => {
  const getVariant = () => {
    if (margem >= 30) return 'default';
    if (margem >= 15) return 'secondary';
    return 'destructive';
  };

  const getIcon = () => {
    if (margem >= 30) return <TrendingUp className="h-3 w-3" />;
    if (margem >= 15) return <Minus className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1 font-mono">
      {getIcon()}
      {margem.toFixed(1)}%
    </Badge>
  );
};
