import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save, Loader2, PauseCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  fetchCategories, fetchProducts, addProduct, updateProduct, deleteProduct, toggleProductPause,
  SupabaseCategory, SupabaseProduct
} from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const ProductManager: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [productsList, setProductsList] = useState<SupabaseProduct[]>([]);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState<{name: string; price: number}>({
    name: "",
    price: 0
  });
  const [editedProduct, setEditedProduct] = useState<{name: string; price: number}>({
    name: "",
    price: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadProducts(selectedCategoryId);
    } else {
      setProductsList([]);
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
      
      if (fetchedCategories.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(fetchedCategories[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as categorias do banco de dados.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const loadProducts = async (categoryId: number) => {
    setIsLoading(true);
    try {
      const fetchedProducts = await fetchProducts(categoryId);
      setProductsList(fetchedProducts);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os produtos do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        is_paused: false
      });

      if (addedProduct) {
        setProductsList([...productsList, addedProduct]);
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

  const handleEditProduct = (product: SupabaseProduct) => {
    setEditedProduct({
      name: product.name,
      price: product.price
    });
    setEditMode(product.id);
  };

  const handleSaveEdit = async (productId: number) => {
    if (!editedProduct.name || editedProduct.price <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, preencha nome e preço corretamente",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const success = await updateProduct(productId, {
        name: editedProduct.name,
        price: editedProduct.price
      });

      if (success) {
        setProductsList(productsList.map(p => 
          p.id === productId 
            ? {...p, name: editedProduct.name, price: editedProduct.price} 
            : p
        ));
        
        setEditMode(null);
        
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    setIsSaving(true);

    try {
      const success = await deleteProduct(productId);

      if (success) {
        setProductsList(productsList.filter(p => p.id !== productId));
        
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePause = async (productId: number, currentPauseState: boolean) => {
    setIsSaving(true);
    try {
      const success = await toggleProductPause(productId, !currentPauseState);
      
      if (success) {
        setProductsList(productsList.map(p => 
          p.id === productId 
            ? {...p, is_paused: !currentPauseState}
            : p
        ));
        
        toast({
          title: !currentPauseState ? "Produto pausado" : "Produto ativado",
          description: !currentPauseState 
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Gerenciar Produtos</h2>
      
      <div className="mb-6">
        <Select 
          value={selectedCategoryId?.toString() || ""} 
          onValueChange={(value) => setSelectedCategoryId(Number(value))}
          disabled={isLoading || categories.length === 0}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white z-50">
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Produtos</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : !selectedCategoryId ? (
            <div className="p-4 text-center text-gray-400">
              Selecione uma categoria para ver seus produtos
            </div>
          ) : productsList.length > 0 ? (
            <table className="w-full text-white">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-right">Preço</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {productsList.map((product) => (
                  <tr key={product.id} className={`border-t border-gray-700 ${product.is_paused ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      {editMode === product.id ? (
                        <Input
                          value={editedProduct.name}
                          onChange={e => setEditedProduct({...editedProduct, name: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={isSaving}
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editMode === product.id ? (
                        <Input
                          type="number"
                          value={editedProduct.price || 0}
                          onChange={e => setEditedProduct({...editedProduct, price: parseFloat(e.target.value) || 0})}
                          className="bg-gray-800 border-gray-700 text-white w-24 ml-auto"
                          disabled={isSaving}
                        />
                      ) : (
                        `R$ ${product.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {editMode === product.id ? (
                          <Button 
                            onClick={() => handleSaveEdit(product.id)}
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
                            onClick={() => handleEditProduct(product)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isSaving}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleTogglePause(product.id, product.is_paused)}
                          size="sm"
                          className={product.is_paused ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
                          disabled={isSaving}
                        >
                          {product.is_paused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                        </Button>
                        <Button 
                          onClick={() => handleDeleteProduct(product.id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isSaving}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-400">
              Nenhum produto encontrado nesta categoria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
