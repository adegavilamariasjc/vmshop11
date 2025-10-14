
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addProduct } from '@/lib/supabase';
import type { SupabaseProduct } from '@/lib/supabase/types';

interface AddProductFormProps {
  selectedCategoryId: number | null;
  onProductAdded: (product: SupabaseProduct) => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ selectedCategoryId, onProductAdded }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newProduct, setNewProduct] = useState<{name: string; price: number}>({
    name: "",
    price: 0
  });

  const handleAddProduct = async () => {
    if (!selectedCategoryId) {
      toast({
        title: "Categoria não selecionada",
        description: "Por favor, selecione uma categoria primeiro",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.name || newProduct.price <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, preencha nome e preço corretamente",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const addedProduct = await addProduct({
        name: newProduct.name,
        price: newProduct.price,
        category_id: selectedCategoryId,
        is_paused: false,
        updated_at: new Date().toISOString()
      });

      if (addedProduct) {
        onProductAdded(addedProduct);
        setNewProduct({ name: "", price: 0 });
        
        toast({
          title: "Produto adicionado",
          description: `${newProduct.name} foi adicionado com sucesso`
        });
      } else {
        toast({
          title: "Erro ao adicionar",
          description: "Não foi possível adicionar o produto ao banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro ao adicionar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-900/50 p-4 rounded-md mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Adicionar Produto</h3>
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Nome do produto"
          value={newProduct.name}
          onChange={e => setNewProduct({...newProduct, name: e.target.value})}
          className="bg-gray-800 border-gray-700 text-white"
          disabled={!selectedCategoryId || isSaving}
        />
        <Input
          type="number"
          placeholder="Preço"
          value={newProduct.price || ''}
          onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
          className="bg-gray-800 border-gray-700 text-white md:w-32"
          disabled={!selectedCategoryId || isSaving}
        />
        <Button 
          onClick={handleAddProduct}
          className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center"
          disabled={!selectedCategoryId || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Plus size={16} /> Adicionar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
