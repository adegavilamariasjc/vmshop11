
import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '../../types';
import { loadCategories, loadProductsByCategory, saveProduct as saveProductService, updateProduct as updateProductService, deleteProduct as deleteProductService } from '../../services/supabaseService';
import { useToast } from '@/hooks/use-toast';

const ProductManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    price: 0
  });
  const [editedProduct, setEditedProduct] = useState<Product>({
    name: "",
    price: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategoriesData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProductsData(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategoriesData = async () => {
    setIsLoading(true);
    try {
      const data = await loadCategories();
      setCategoriesList(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0]);
      }
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

  const loadProductsData = async (category: string) => {
    setIsLoading(true);
    try {
      const data = await loadProductsByCategory(category);
      setProductsList(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, preencha nome e preço corretamente",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const productWithCategory = { ...newProduct, category: selectedCategory };
      await saveProduct(productWithCategory);
      
      // Update local state
      setProductsList([...productsList, productWithCategory]);
      setNewProduct({ name: "", price: 0 });
      
      toast({
        title: "Produto adicionado",
        description: `${newProduct.name} foi adicionado com sucesso`
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Não foi possível adicionar o produto. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product, index: number) => {
    setEditedProduct({...product});
    setEditMode(`${index}-${product.name}`);
  };

  const handleSaveEdit = async (oldName: string, index: number) => {
    if (!editedProduct.name || editedProduct.price <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, preencha nome e preço corretamente",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const productWithCategory = { ...editedProduct, category: selectedCategory };
      await updateProduct(productWithCategory, oldName);
      
      // Update local state
      const updatedProductsList = [...productsList];
      updatedProductsList[index] = productWithCategory;
      setProductsList(updatedProductsList);
      setEditMode(null);
      
      toast({
        title: "Produto atualizado",
        description: `${editedProduct.name} foi atualizado com sucesso`
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível atualizar o produto. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (index: number) => {
    const product = productsList[index];
    
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setIsLoading(true);
      try {
        await deleteProduct({ name: product.name, category: selectedCategory });
        
        // Update local state
        const updatedProductsList = [...productsList];
        updatedProductsList.splice(index, 1);
        setProductsList(updatedProductsList);
        
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso"
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Erro ao excluir produto",
          description: "Não foi possível excluir o produto. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Gerenciar Produtos</h2>
      
      <div className="mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoading}>
          <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categoriesList.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Add new product */}
      <div className="bg-gray-900/50 p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Adicionar Produto</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Nome do produto"
            value={newProduct.name}
            onChange={e => setNewProduct({...newProduct, name: e.target.value})}
            className="bg-gray-800 border-gray-700 text-white"
            disabled={isLoading || !selectedCategory}
          />
          <Input
            type="number"
            placeholder="Preço"
            value={newProduct.price || ''}
            onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white md:w-32"
            disabled={isLoading || !selectedCategory}
          />
          <Button 
            onClick={handleAddProduct}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center"
            disabled={isLoading || !selectedCategory}
          >
            <Plus size={16} /> Adicionar
          </Button>
        </div>
      </div>
      
      {/* Product list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Produtos</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Carregando produtos...
            </div>
          ) : !selectedCategory ? (
            <div className="p-4 text-center text-gray-400">
              Selecione uma categoria para ver os produtos
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
                {productsList.map((product, index) => (
                  <tr key={`${index}-${product.name}`} className="border-t border-gray-700">
                    <td className="p-3">
                      {editMode === `${index}-${product.name}` ? (
                        <Input
                          value={editedProduct.name}
                          onChange={e => setEditedProduct({...editedProduct, name: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={isLoading}
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editMode === `${index}-${product.name}` ? (
                        <Input
                          type="number"
                          value={editedProduct.price || 0}
                          onChange={e => setEditedProduct({...editedProduct, price: parseFloat(e.target.value) || 0})}
                          className="bg-gray-800 border-gray-700 text-white w-24 ml-auto"
                          disabled={isLoading}
                        />
                      ) : (
                        `R$ ${product.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {editMode === `${index}-${product.name}` ? (
                          <Button 
                            onClick={() => handleSaveEdit(product.name, index)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                          >
                            <Save size={16} />
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleEditProduct(product, index)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDeleteProduct(index)}
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
              Nenhum produto encontrado nesta categoria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
