
import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save, MoveUp, MoveDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchCategories, addCategory, updateCategory, deleteCategory, fetchProducts, SupabaseCategory } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const CategoryManager: React.FC = () => {
  const { toast } = useToast();
  const [categoriesList, setCategoriesList] = useState<SupabaseCategory[]>([]);
  const [productsCount, setProductsCount] = useState<Record<number, number>>({});
  const [newCategory, setNewCategory] = useState("");
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editedCategory, setEditedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const categories = await fetchCategories();
      setCategoriesList(categories);

      // Carregar contagem de produtos para cada categoria
      const countMap: Record<number, number> = {};
      for (const category of categories) {
        const products = await fetchProducts(category.id);
        countMap[category.id] = products.length;
      }
      setProductsCount(countMap);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as categorias do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, digite um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    if (categoriesList.some(c => c.name === newCategory)) {
      toast({
        title: "Categoria duplicada",
        description: "Esta categoria já existe",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Determinar o próximo índice de ordem
      const maxOrderIndex = categoriesList.length > 0 
        ? Math.max(...categoriesList.map(c => c.order_index))
        : -1;
      
      const newCategoryData = await addCategory({
        name: newCategory,
        order_index: maxOrderIndex + 1
      });

      if (newCategoryData) {
        setCategoriesList([...categoriesList, newCategoryData]);
        setProductsCount({...productsCount, [newCategoryData.id]: 0});
        setNewCategory("");
        
        toast({
          title: "Categoria adicionada",
          description: `${newCategory} foi adicionada com sucesso`
        });
      } else {
        toast({
          title: "Erro ao adicionar",
          description: "Não foi possível adicionar a categoria ao banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro ao adicionar a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCategory = (category: SupabaseCategory) => {
    setEditedCategory(category.name);
    setEditMode(category.id);
  };

  const handleSaveEdit = async (categoryId: number) => {
    if (!editedCategory.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, digite um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    if (categoriesList.some(c => c.name === editedCategory && c.id !== categoryId)) {
      toast({
        title: "Categoria duplicada",
        description: "Esta categoria já existe",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const success = await updateCategory(categoryId, {
        name: editedCategory
      });

      if (success) {
        // Atualizar localmente
        setCategoriesList(categoriesList.map(c => 
          c.id === categoryId 
            ? {...c, name: editedCategory} 
            : c
        ));
        
        setEditMode(null);
        
        toast({
          title: "Categoria atualizada",
          description: `A categoria foi atualizada com sucesso`
        });
      } else {
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar a categoria no banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Todos os produtos nela serão removidos também.')) {
      return;
    }

    setIsSaving(true);

    try {
      const success = await deleteCategory(categoryId);

      if (success) {
        // Atualizar localmente
        setCategoriesList(categoriesList.filter(c => c.id !== categoryId));
        
        toast({
          title: "Categoria excluída",
          description: "A categoria foi excluída com sucesso"
        });
      } else {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a categoria do banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === categoriesList.length - 1)) {
      return;
    }

    setIsSaving(true);

    try {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const categoryToMove = categoriesList[index];
      const categoryToSwap = categoriesList[newIndex];
      
      // Trocar os índices de ordem
      const tempOrderIndex = categoryToMove.order_index;
      
      const success1 = await updateCategory(categoryToMove.id, {
        order_index: categoryToSwap.order_index
      });
      
      const success2 = await updateCategory(categoryToSwap.id, {
        order_index: tempOrderIndex
      });

      if (success1 && success2) {
        // Atualizar localmente
        const updatedList = [...categoriesList];
        [updatedList[index], updatedList[newIndex]] = [updatedList[newIndex], updatedList[index]];
        setCategoriesList(updatedList);
      } else {
        toast({
          title: "Erro ao reordenar",
          description: "Não foi possível reordenar as categorias no banco de dados.",
          variant: "destructive",
        });
        // Recarregar as categorias para garantir consistência
        await loadCategories();
      }
    } catch (error) {
      console.error("Erro ao reordenar categorias:", error);
      toast({
        title: "Erro ao reordenar",
        description: "Ocorreu um erro ao reordenar as categorias.",
        variant: "destructive",
      });
      // Recarregar as categorias para garantir consistência
      await loadCategories();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Gerenciar Categorias</h2>
      
      {/* Add new category */}
      <div className="bg-gray-900/50 p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Adicionar Categoria</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Nome da categoria"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            disabled={isSaving}
          />
          <Button 
            onClick={handleAddCategory}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center"
            disabled={isSaving}
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
      
      {/* Category list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Categorias</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : categoriesList.length > 0 ? (
            <table className="w-full text-white">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-right">Produtos</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categoriesList.map((category, index) => (
                  <tr key={category.id} className="border-t border-gray-700">
                    <td className="p-3">
                      {editMode === category.id ? (
                        <Input
                          value={editedCategory}
                          onChange={e => setEditedCategory(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={isSaving}
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {productsCount[category.id] || 0}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          onClick={() => moveCategory(index, 'up')}
                          size="sm"
                          disabled={index === 0 || isSaving}
                          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                        >
                          <MoveUp size={16} />
                        </Button>
                        <Button 
                          onClick={() => moveCategory(index, 'down')}
                          size="sm"
                          disabled={index === categoriesList.length - 1 || isSaving}
                          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                        >
                          <MoveDown size={16} />
                        </Button>
                        
                        {editMode === category.id ? (
                          <Button 
                            onClick={() => handleSaveEdit(category.id)}
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
                            onClick={() => handleEditCategory(category)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isSaving}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDeleteCategory(category.id)}
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
              Nenhuma categoria encontrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
