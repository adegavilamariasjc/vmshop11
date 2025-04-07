
import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories, saveCategories, products, saveProducts } from '../../data/products';
import { useToast } from '@/hooks/use-toast';

const CategoryManager: React.FC = () => {
  const { toast } = useToast();
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editedCategory, setEditedCategory] = useState("");

  useEffect(() => {
    setCategoriesList([...categories]);
  }, []);

  const handleAddCategory = () => {
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

    const updatedCategories = [...categoriesList, newCategory];
    
    // Create empty product array for new category
    const updatedProducts = {...products};
    updatedProducts[newCategory] = [];
    
    // Save to local storage
    saveCategories(updatedCategories);
    saveProducts(updatedProducts);
    
    // Update local state
    setCategoriesList(updatedCategories);
    setNewCategory("");
    
    toast({
      title: "Categoria adicionada",
      description: `${newCategory} foi adicionada com sucesso`
    });
  };

  const handleEditCategory = (category: string) => {
    setEditedCategory(category);
    setEditMode(category);
  };

  const handleSaveEdit = (oldCategory: string, index: number) => {
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

    // Update category list
    const updatedCategories = [...categoriesList];
    updatedCategories[index] = editedCategory;
    
    // Update products with new category name
    const updatedProducts = {...products};
    if (oldCategory !== editedCategory) {
      updatedProducts[editedCategory] = updatedProducts[oldCategory] || [];
      delete updatedProducts[oldCategory];
    }
    
    // Save to local storage
    saveCategories(updatedCategories);
    saveProducts(updatedProducts);
    
    // Update local state
    setCategoriesList(updatedCategories);
    setEditMode(null);
    
    toast({
      title: "Categoria atualizada",
      description: `A categoria foi atualizada com sucesso`
    });
  };

  const handleDeleteCategory = (category: string, index: number) => {
    if (confirm('Tem certeza que deseja excluir esta categoria? Todos os produtos nela serão removidos também.')) {
      // Update category list
      const updatedCategories = [...categoriesList];
      updatedCategories.splice(index, 1);
      
      // Remove category from products
      const updatedProducts = {...products};
      delete updatedProducts[category];
      
      // Save to local storage
      saveCategories(updatedCategories);
      saveProducts(updatedProducts);
      
      // Update local state
      setCategoriesList(updatedCategories);
      
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso"
      });
    }
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === categoriesList.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedCategories = [...categoriesList];
    [updatedCategories[index], updatedCategories[newIndex]] = [updatedCategories[newIndex], updatedCategories[index]];
    
    // Save to local storage
    saveCategories(updatedCategories);
    
    // Update local state
    setCategoriesList(updatedCategories);
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
          />
          <Button 
            onClick={handleAddCategory}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center"
          >
            <Plus size={16} /> Adicionar
          </Button>
        </div>
      </div>
      
      {/* Category list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Categorias</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {categoriesList.length > 0 ? (
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
                  <tr key={category} className="border-t border-gray-700">
                    <td className="p-3">
                      {editMode === category ? (
                        <Input
                          value={editedCategory}
                          onChange={e => setEditedCategory(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      ) : (
                        category
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {products[category] ? products[category].length : 0}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          onClick={() => moveCategory(index, 'up')}
                          size="sm"
                          disabled={index === 0}
                          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                        >
                          <MoveUp size={16} />
                        </Button>
                        <Button 
                          onClick={() => moveCategory(index, 'down')}
                          size="sm"
                          disabled={index === categoriesList.length - 1}
                          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                        >
                          <MoveDown size={16} />
                        </Button>
                        
                        {editMode === category ? (
                          <Button 
                            onClick={() => handleSaveEdit(category, index)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save size={16} />
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleEditCategory(category)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDeleteCategory(category, index)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
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
