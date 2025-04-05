
import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadCategories, saveCategory, updateCategory, deleteCategory } from '../../data/products';
import { useToast } from '@/hooks/use-toast';

const CategoryManager: React.FC = () => {
  const { toast } = useToast();
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editedCategory, setEditedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const loadCategoriesData = async () => {
    setIsLoading(true);
    try {
      const data = await loadCategories();
      setCategoriesList(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias. Por favor, tente novamente.",
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

    if (categoriesList.includes(newCategory)) {
      toast({
        title: "Categoria duplicada",
        description: "Esta categoria já existe",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveCategory(newCategory, categoriesList.length);
      
      // Update local state
      const updatedCategories = [...categoriesList, newCategory];
      setCategoriesList(updatedCategories);
      setNewCategory("");
      
      toast({
        title: "Categoria adicionada",
        description: `${newCategory} foi adicionada com sucesso`
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Erro ao adicionar categoria",
        description: "Não foi possível adicionar a categoria. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: string) => {
    setEditedCategory(category);
    setEditMode(category);
  };

  const handleSaveEdit = async (oldCategory: string, index: number) => {
    if (!editedCategory.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, digite um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    if (categoriesList.includes(editedCategory) && editedCategory !== oldCategory) {
      toast({
        title: "Categoria duplicada",
        description: "Esta categoria já existe",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateCategory(oldCategory, editedCategory, index);
      
      // Update local state
      const updatedCategories = [...categoriesList];
      updatedCategories[index] = editedCategory;
      setCategoriesList(updatedCategories);
      setEditMode(null);
      
      toast({
        title: "Categoria atualizada",
        description: `A categoria foi atualizada com sucesso`
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Não foi possível atualizar a categoria. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (category: string, index: number) => {
    if (confirm('Tem certeza que deseja excluir esta categoria? Todos os produtos nela serão removidos também.')) {
      setIsLoading(true);
      try {
        await deleteCategory(category);
        
        // Update local state
        const updatedCategories = [...categoriesList];
        updatedCategories.splice(index, 1);
        setCategoriesList(updatedCategories);
        
        toast({
          title: "Categoria excluída",
          description: "A categoria foi excluída com sucesso"
        });
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({
          title: "Erro ao excluir categoria",
          description: "Não foi possível excluir a categoria. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === categoriesList.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedCategories = [...categoriesList];
    [updatedCategories[index], updatedCategories[newIndex]] = [updatedCategories[newIndex], updatedCategories[index]];
    
    setIsLoading(true);
    try {
      await saveCategoriesToDB(updatedCategories);
      
      // Update local state
      setCategoriesList(updatedCategories);
    } catch (error) {
      console.error("Error moving category:", error);
      toast({
        title: "Erro ao mover categoria",
        description: "Não foi possível mover a categoria. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
          />
          <Button 
            onClick={handleAddCategory}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center"
            disabled={isLoading}
          >
            <Plus size={16} /> Adicionar
          </Button>
        </div>
      </div>
      
      {/* Category list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Categorias</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Carregando categorias...
            </div>
          ) : categoriesList.length > 0 ? (
            <table className="w-full text-white">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categoriesList.map((category, index) => (
                  <tr key={category} className="border-t border-gray-700">
                    <td className="p-3">
                      {editMode === category ? (
                        <Input
                          value={editedCategory}
                          onChange={e => setEditedCategory(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={isLoading}
                        />
                      ) : (
                        category
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          onClick={() => moveCategory(index, 'up')}
                          size="sm"
                          disabled={index === 0 || isLoading}
                          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                        >
                          <MoveUp size={16} />
                        </Button>
                        <Button 
                          onClick={() => moveCategory(index, 'down')}
                          size="sm"
                          disabled={index === categoriesList.length - 1 || isLoading}
                          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                        >
                          <MoveDown size={16} />
                        </Button>
                        
                        {editMode === category ? (
                          <Button 
                            onClick={() => handleSaveEdit(category, index)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                          >
                            <Save size={16} />
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleEditCategory(category)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDeleteCategory(category, index)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isLoading}
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
