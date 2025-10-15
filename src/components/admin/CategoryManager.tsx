import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save, Loader2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '@/lib/supabase';
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
      const sortedCategories = fetchedCategories.sort((a, b) => a.order_index - b.order_index);
      setCategories(sortedCategories);
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
      const categoryToAdd: Omit<SupabaseCategory, 'id'> = {
        name: newCategory,
        order_index: categories.length
      };
      
      const addedCategory = await addCategory(categoryToAdd);

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
      const success = await updateCategory(categoryId, {
        name: editedCategory.name
      });

      if (success) {
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    if (result.destination.index === result.source.index) return;

    const updatedCategories = Array.from(categories);
    const [draggedItem] = updatedCategories.splice(result.source.index, 1);
    updatedCategories.splice(result.destination.index, 0, draggedItem);

    const reorderedCategories = updatedCategories.map((item, index) => ({
      ...item,
      order_index: index
    }));

    setCategories(reorderedCategories);

    const loadingToast = toast({
      title: "Atualizando ordem",
      description: "Salvando a nova ordem das categorias...",
    });

    setIsSaving(true);
    try {
      for (const item of reorderedCategories) {
        await updateCategory(item.id, { order_index: item.order_index });
      }
      toast({
        title: "Ordem atualizada",
        description: "A ordem das categorias foi atualizada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      toast({
        title: "Erro ao atualizar ordem",
        description: "Ocorreu um erro ao atualizar a ordem das categorias",
        variant: "destructive"
      });
      await loadCategories();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Gerenciar Categorias</h2>
      
      <div className="bg-gray-900/50 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Adicionar Categoria</h3>
        <div className="flex flex-col gap-2 sm:gap-3">
          <Input
            placeholder="Nome da categoria"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white w-full"
            disabled={isSaving}
          />
          <Button 
            onClick={handleAddCategory}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center justify-center w-full"
            disabled={isSaving}
            size="sm"
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
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : categories.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Nenhuma categoria encontrada
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories">
                {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="w-full"
                    >
                      <div className="space-y-2 sm:space-y-0">
                        {/* Mobile View */}
                        <div className="block sm:hidden">
                          {categories.map((category, index) => (
                            <Draggable
                              key={category.id.toString()}
                              draggableId={category.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-gray-800 p-3 rounded-lg mb-2"
                                >
                                  {editMode === category.id ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={editedCategory.name}
                                        onChange={e => setEditedCategory({...editedCategory, name: e.target.value})}
                                        className="bg-gray-700 border-gray-600 text-white w-full"
                                        disabled={isSaving}
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleSaveEdit(category.id)}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 flex-1"
                                          disabled={isSaving}
                                        >
                                          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        </Button>
                                        <Button
                                          onClick={() => handleDeleteCategory(category.id)}
                                          size="sm"
                                          className="bg-red-600 hover:bg-red-700 flex-1"
                                          disabled={isSaving}
                                        >
                                          <Trash size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-between items-center">
                                      <span className="text-white font-medium">{category.name}</span>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleEditCategory(category)}
                                          size="sm"
                                          className="bg-blue-600 hover:bg-blue-700"
                                          disabled={isSaving}
                                        >
                                          <Pencil size={14} />
                                        </Button>
                                        <Button
                                          onClick={() => handleDeleteCategory(category.id)}
                                          size="sm"
                                          className="bg-red-600 hover:bg-red-700"
                                          disabled={isSaving}
                                        >
                                          <Trash size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-white">
                            <thead className="bg-gray-800">
                              <tr>
                                <th className="p-3 text-left">Nome</th>
                                <th className="p-3 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categories.map((category, index) => (
                                <Draggable
                                  key={category.id.toString()}
                                  draggableId={category.id.toString()}
                                  index={index}
                                >
                                  {(provided) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors cursor-move"
                                    >
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
                                      <td className="p-3">
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
                                  )}
                                </Draggable>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
