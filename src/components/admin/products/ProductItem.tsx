
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell } from '@/components/ui/table';
import { Pencil, Save, Trash, PauseCircle, PlayCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProduct, deleteProduct, toggleProductPause } from '@/lib/supabase';
import type { SupabaseProduct } from '@/lib/supabase/types';

interface ProductItemProps {
  product: SupabaseProduct;
  onUpdate: (updatedProduct: SupabaseProduct) => void;
  onDelete: (productId: number) => void;
  isSaving: boolean;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product, onUpdate, onDelete, isSaving }) => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    name: product.name,
    price: product.price
  });
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [editMode]);

  const handleSaveEdit = async () => {
    if (!editedProduct.name || editedProduct.price <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, preencha nome e preço corretamente",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await updateProduct(product.id, {
        name: editedProduct.name,
        price: editedProduct.price
      });

      if (success) {
        onUpdate({ ...product, ...editedProduct });
        setEditMode(false);
        
        toast({
          title: "Produto atualizado",
          description: `${editedProduct.name} foi atualizado com sucesso`
        });
      } else {
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar o produto no banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const success = await deleteProduct(product.id);

      if (success) {
        onDelete(product.id);
        
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso"
        });
      } else {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o produto do banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePause = async () => {
    try {
      const success = await toggleProductPause(product.id, !product.is_paused);
      
      if (success) {
        onUpdate({ ...product, is_paused: !product.is_paused });
        
        toast({
          title: !product.is_paused ? "Produto pausado" : "Produto ativado",
          description: !product.is_paused 
            ? "O produto foi pausado e não estará disponível para pedidos"
            : "O produto está novamente disponível para pedidos"
        });
      } else {
        toast({
          title: "Erro ao alterar estado",
          description: "Não foi possível alterar o estado do produto.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao alterar estado do produto:", error);
      toast({
        title: "Erro ao alterar estado",
        description: "Ocorreu um erro ao alterar o estado do produto.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <TableCell className="font-medium">
        {editMode ? (
          <Input
            value={editedProduct.name}
            onChange={e => setEditedProduct({...editedProduct, name: e.target.value})}
            className="bg-gray-800 border-gray-700 text-white"
            disabled={isSaving}
          />
        ) : (
          <span>{product.name}</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {editMode ? (
          <Input
            ref={priceInputRef}
            type="number"
            step="0.01"
            value={editedProduct.price}
            onChange={e => setEditedProduct({...editedProduct, price: parseFloat(e.target.value) || 0})}
            onFocus={e => e.target.select()}
            className="bg-gray-800 border-gray-700 text-white w-24 ml-auto"
            disabled={isSaving}
          />
        ) : (
          <span>R$ {product.price.toFixed(2)}</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          {editMode ? (
            <Button 
              onClick={handleSaveEdit}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
            </Button>
          ) : (
            <Button 
              onClick={() => setEditMode(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              <Pencil size={16} />
            </Button>
          )}
          <Button 
            onClick={handleTogglePause}
            size="sm"
            className={product.is_paused ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
            disabled={isSaving}
          >
            {product.is_paused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
          </Button>
          <Button 
            onClick={handleDelete}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            disabled={isSaving}
          >
            <Trash size={16} />
          </Button>
        </div>
      </TableCell>
    </>
  );
};
