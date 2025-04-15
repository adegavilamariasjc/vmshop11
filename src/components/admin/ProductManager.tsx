
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchCategories, fetchProducts, updateProductOrder } from '@/lib/supabase';
import { CategorySelector } from './products/CategorySelector';
import { AddProductForm } from './products/AddProductForm';
import { ProductList } from './products/ProductList';
import type { SupabaseCategory, SupabaseProduct } from '@/lib/supabase/types';

const ProductManager: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [productsList, setProductsList] = useState<SupabaseProduct[]>([]);
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

  const handleProductsReorder = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(productsList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index
    }));

    setProductsList(updatedItems);

    try {
      setIsSaving(true);
      for (const item of updatedItems) {
        await updateProductOrder(item.id, item.order_index);
      }
      toast({
        title: "Ordem atualizada",
        description: "A ordem dos produtos foi atualizada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      toast({
        title: "Erro ao atualizar ordem",
        description: "Ocorreu um erro ao atualizar a ordem dos produtos",
        variant: "destructive"
      });
      if (selectedCategoryId) {
        loadProducts(selectedCategoryId);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductAdded = (newProduct: SupabaseProduct) => {
    setProductsList([...productsList, newProduct]);
  };

  const handleProductUpdate = (updatedProduct: SupabaseProduct) => {
    setProductsList(productsList.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
  };

  const handleProductDelete = (productId: number) => {
    setProductsList(productsList.filter(p => p.id !== productId));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Gerenciar Produtos</h2>
      
      <CategorySelector
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        isLoading={isLoading}
      />
      
      <AddProductForm
        selectedCategoryId={selectedCategoryId}
        onProductAdded={handleProductAdded}
      />
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Produtos</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          <ProductList
            products={productsList}
            isLoading={isLoading}
            isSaving={isSaving}
            selectedCategoryId={selectedCategoryId}
            onProductsReorder={handleProductsReorder}
            onProductUpdate={handleProductUpdate}
            onProductDelete={handleProductDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
