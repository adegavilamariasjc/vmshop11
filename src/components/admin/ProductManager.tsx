
import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '../../types';
import { products, categories, saveProducts } from '../../data/products';
import { useToast } from '@/hooks/use-toast';

const ProductManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
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

  useEffect(() => {
    if (selectedCategory && products[selectedCategory]) {
      setProductsList([...products[selectedCategory]]);
    } else {
      setProductsList([]);
    }
  }, [selectedCategory]);

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.price <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, preencha nome e preço corretamente",
        variant: "destructive",
      });
      return;
    }

    const updatedProducts = {...products};
    updatedProducts[selectedCategory] = [...(updatedProducts[selectedCategory] || []), newProduct];
    
    // Save to local storage
    saveProducts(updatedProducts);
    
    // Update local state
    setProductsList([...productsList, newProduct]);
    setNewProduct({ name: "", price: 0 });
    
    toast({
      title: "Produto adicionado",
      description: `${newProduct.name} foi adicionado com sucesso`
    });
  };

  const handleEditProduct = (product: Product, index: number) => {
    setEditedProduct({...product});
    setEditMode(`${index}-${product.name}`);
  };

  const handleSaveEdit = (index: number) => {
    if (!editedProduct.name || editedProduct.price <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, preencha nome e preço corretamente",
        variant: "destructive",
      });
      return;
    }

    const updatedProductsList = [...productsList];
    updatedProductsList[index] = editedProduct;
    
    const updatedProducts = {...products};
    updatedProducts[selectedCategory] = updatedProductsList;
    
    // Save to local storage
    saveProducts(updatedProducts);
    
    // Update local state
    setProductsList(updatedProductsList);
    setEditMode(null);
    
    toast({
      title: "Produto atualizado",
      description: `${editedProduct.name} foi atualizado com sucesso`
    });
  };

  const handleDeleteProduct = (index: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const updatedProductsList = [...productsList];
      updatedProductsList.splice(index, 1);
      
      const updatedProducts = {...products};
      updatedProducts[selectedCategory] = updatedProductsList;
      
      // Save to local storage
      saveProducts(updatedProducts);
      
      // Update local state
      setProductsList(updatedProductsList);
      
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Gerenciar Produtos</h2>
      
      <div className="mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
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
          />
          <Input
            type="number"
            placeholder="Preço"
            value={newProduct.price || ''}
            onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white md:w-32"
          />
          <Button 
            onClick={handleAddProduct}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center"
          >
            <Plus size={16} /> Adicionar
          </Button>
        </div>
      </div>
      
      {/* Product list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Produtos</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {productsList.length > 0 ? (
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
                        />
                      ) : (
                        `R$ ${product.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {editMode === `${index}-${product.name}` ? (
                          <Button 
                            onClick={() => handleSaveEdit(index)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save size={16} />
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleEditProduct(product, index)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDeleteProduct(index)}
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
              Nenhum produto encontrado nesta categoria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
