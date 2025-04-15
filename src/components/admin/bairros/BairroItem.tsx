
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import type { SupabaseBairro } from '@/lib/supabase/types';

interface BairroItemProps {
  bairro: SupabaseBairro;
  editingBairro: SupabaseBairro | null;
  onEdit: (bairro: SupabaseBairro) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: number) => void;
  setEditingBairro: (bairro: SupabaseBairro | null) => void;
}

export const BairroItem: React.FC<BairroItemProps> = ({
  bairro,
  editingBairro,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  setEditingBairro,
}) => {
  return (
    <>
      <TableCell className="text-white">
        {editingBairro?.id === bairro.id ? (
          <Input
            value={editingBairro.nome}
            onChange={(e) => setEditingBairro({ ...editingBairro, nome: e.target.value })}
            className="bg-gray-900 border-gray-700 text-white"
          />
        ) : (
          bairro.nome
        )}
      </TableCell>
      <TableCell className="text-white text-right">
        {editingBairro?.id === bairro.id ? (
          <Input
            type="number"
            value={editingBairro.taxa}
            onChange={(e) => setEditingBairro({ ...editingBairro, taxa: Number(e.target.value) })}
            className="bg-gray-900 border-gray-700 text-white w-24 ml-auto"
          />
        ) : (
          bairro.taxa.toFixed(2)
        )}
      </TableCell>
      <TableCell className="text-right">
        {editingBairro?.id === bairro.id ? (
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onSave}
              className="text-green-500 hover:text-green-400 hover:bg-gray-700"
            >
              <Save size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-300 hover:bg-gray-700"
            >
              <X size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(bairro)}
              className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
            >
              <Pencil size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(bairro.id)}
              className="text-red-500 hover:text-red-400 hover:bg-gray-700"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}
      </TableCell>
    </>
  );
};
