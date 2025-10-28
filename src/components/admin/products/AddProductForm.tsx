
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "Produto de qualidade",
    quantidade_estoque: 0,
    estoque_minimo: 0,
    custo_compra: 0,
    unidade_medida: "un",
    controlar_estoque: true
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

    if (newProduct.custo_compra < 0) {
      toast({
        title: "Custo inválido",
        description: "O custo de compra não pode ser negativo",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const addedProduct = await addProduct({
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        category_id: selectedCategoryId,
        is_paused: false,
        quantidade_estoque: newProduct.quantidade_estoque,
        estoque_minimo: newProduct.estoque_minimo,
        custo_compra: newProduct.custo_compra,
        margem_lucro: 0,
        unidade_medida: newProduct.unidade_medida,
        controlar_estoque: newProduct.controlar_estoque,
        updated_at: new Date().toISOString()
      });

      if (addedProduct) {
        onProductAdded(addedProduct);
        setNewProduct({
          name: "",
          price: 0,
          description: "Produto de qualidade",
          quantidade_estoque: 0,
          estoque_minimo: 0,
          custo_compra: 0,
          unidade_medida: "un",
          controlar_estoque: true
        });
        
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

  const margemCalculada = newProduct.custo_compra > 0 
    ? ((newProduct.price - newProduct.custo_compra) / newProduct.custo_compra * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-gray-900/50 p-4 rounded-md mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Adicionar Produto</h3>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Nome do produto"
            value={newProduct.name}
            onChange={e => setNewProduct({...newProduct, name: e.target.value})}
            className="bg-gray-800 border-gray-700 text-white flex-1"
            disabled={!selectedCategoryId || isSaving}
          />
          <Input
            type="text"
            placeholder="Unidade"
            value={newProduct.unidade_medida}
            onChange={e => setNewProduct({...newProduct, unidade_medida: e.target.value})}
            className="bg-gray-800 border-gray-700 text-white md:w-24"
            disabled={!selectedCategoryId || isSaving}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <Input
            type="number"
            placeholder="Quantidade Inicial"
            value={newProduct.quantidade_estoque || ''}
            onChange={e => setNewProduct({...newProduct, quantidade_estoque: parseInt(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white md:w-36"
            disabled={!selectedCategoryId || isSaving}
          />
          <Input
            type="number"
            placeholder="Estoque Mínimo"
            value={newProduct.estoque_minimo || ''}
            onChange={e => setNewProduct({...newProduct, estoque_minimo: parseInt(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white md:w-36"
            disabled={!selectedCategoryId || isSaving}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Custo (R$)"
            value={newProduct.custo_compra || ''}
            onChange={e => setNewProduct({...newProduct, custo_compra: parseFloat(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white md:w-32"
            disabled={!selectedCategoryId || isSaving}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Preço Venda (R$)"
            value={newProduct.price || ''}
            onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white md:w-36"
            disabled={!selectedCategoryId || isSaving}
          />
        </div>

        {(newProduct.custo_compra > 0 || newProduct.price > 0) && (
          <div className="text-sm text-gray-400">
            Margem estimada: <span className="text-green-400 font-mono font-semibold">{margemCalculada}%</span>
          </div>
        )}

        <Textarea
          placeholder="Descrição do produto"
          value={newProduct.description}
          onChange={e => setNewProduct({...newProduct, description: e.target.value})}
          className="bg-gray-800 border-gray-700 text-white"
          disabled={!selectedCategoryId || isSaving}
          rows={2}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="controlar-estoque"
            checked={newProduct.controlar_estoque}
            onChange={e => setNewProduct({...newProduct, controlar_estoque: e.target.checked})}
            className="w-4 h-4"
            disabled={!selectedCategoryId || isSaving}
          />
          <label htmlFor="controlar-estoque" className="text-sm text-gray-300">
            Controlar estoque deste produto
          </label>
        </div>

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
