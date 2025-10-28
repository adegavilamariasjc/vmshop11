import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { adjustStock } from '@/lib/supabase/stock';
type AdjustmentType = 'entrada' | 'saida' | 'ajuste';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: {
    id: number;
    name: string;
    quantidade_estoque: number;
  } | null;
  onSuccess: () => void;
}

export const StockAdjustmentModal = ({
  isOpen,
  onClose,
  produto,
  onSuccess
}: StockAdjustmentModalProps) => {
  const [tipo, setTipo] = useState<AdjustmentType>('entrada');
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacao, setObservacao] = useState('');
  const [custoUnitario, setCustoUnitario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!produto) return;

    const qtd = parseInt(quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      toast.error('Quantidade inválida');
      return;
    }

    setIsSubmitting(true);

    const custo = custoUnitario ? parseFloat(custoUnitario) : undefined;

    const success = await adjustStock(
      produto.id,
      tipo,
      qtd,
      motivo || undefined,
      observacao || undefined,
      custo
    );

    setIsSubmitting(false);

    if (success) {
      toast.success('Estoque ajustado com sucesso!');
      onSuccess();
      handleClose();
    } else {
      toast.error('Erro ao ajustar estoque');
    }
  };

  const handleClose = () => {
    setTipo('entrada');
    setQuantidade('');
    setMotivo('');
    setObservacao('');
    setCustoUnitario('');
    onClose();
  };

  if (!produto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Estoque - {produto.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Estoque atual: {produto.quantidade_estoque}</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Movimentação</Label>
            <Select value={tipo} onValueChange={(value) => setTipo(value as AdjustmentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              required
              placeholder={tipo === 'ajuste' ? 'Nova quantidade total' : 'Quantidade a movimentar'}
            />
          </div>

          {tipo === 'entrada' && (
            <div className="space-y-2">
              <Label htmlFor="custo">Custo Unitário (R$)</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                min="0"
                value={custoUnitario}
                onChange={(e) => setCustoUnitario(e.target.value)}
                placeholder="Opcional - atualiza o custo do produto"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Input
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Compra, Devolução, Perda..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Detalhes adicionais (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ajustando...' : 'Confirmar Ajuste'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
