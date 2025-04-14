import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchCategories, addCategory, updateCategory, deleteCategory, reorderCategory } from '@/lib/supabase';
import type { SupabaseCategory } from '@/lib/supabase/types';

const CategoryManager: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editedCategory, setEditedCategory] = useState<{name: string}>({ name: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
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
        title: "Nome inválido",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const addedCategory = await addCategory(newCategory);

      if (addedCategory) {
        setCategories([...categories, addedCategory]);
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
    setEditedCategory({ name: category.name });
    setEditMode(category.id);
  };

  const handleSaveEdit = async (categoryId: number) => {
    if (!editedCategory.name.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome válido para a categoria.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const success = await updateCategory(categoryId, editedCategory.name);

      if (success) {
        // Atualizar localmente
        setCategories(categories.map(c =>
          c.id === categoryId ? {...c, name: editedCategory.name} : c
        ));

        setEditMode(null);

        toast({
          title: "Categoria atualizada",
          description: `${editedCategory.name} foi atualizada com sucesso`
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
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    setIsSaving(true);

    try {
      const success = await deleteCategory(categoryId);

      if (success) {
        // Atualizar localmente
        setCategories(categories.filter(c => c.id !== categoryId));

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

  const handleReorder = async (categoryId: number, direction: 'up' | 'down') => {
    setIsSaving(true);

    try {
      const success = await reorderCategory(categoryId, direction);

      if (success) {
        loadCategories(); // Recarrega as categorias para atualizar a ordem
        toast({
          title: "Ordem atualizada",
          description: "A ordem das categorias foi atualizada com sucesso."
        });
      } else {
        toast({
          title: "Erro ao atualizar ordem",
          description: "Não foi possível atualizar a ordem da categoria no banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar ordem da categoria:", error);
      toast({
        title: "Erro ao atualizar ordem",
        description: "Ocorreu um erro ao atualizar a ordem da categoria.",
        variant: "destructive",
      });
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
        <div className="flex flex-col md:flex-row gap-3">
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
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Categorias</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-x-auto">
          <table className="w-full text-white min-w-[600px]">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-right">Ordem</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-gray-700">
                  <td className="p-3">
                    {editMode === category.id ? (
                      <Input
                        value={editedCategory.name}
                        onChange={e => setEditedCategory({...editedCategory, name: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={isSaving}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end items-center">
                      <Button
                        onClick={() => handleReorder(category.id, 'up')}
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600"
                        disabled={isSaving || categories.indexOf(category) === 0}
                      >
                        <ArrowUp size={16} />
                      </Button>
                      <span className="w-8 text-center">{category.order_index}</span>
                      <Button
                        onClick={() => handleReorder(category.id, 'down')}
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600"
                        disabled={isSaving || categories.indexOf(category) === categories.length - 1}
                      >
                        <ArrowDown size={16} />
                      </Button>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
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
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
