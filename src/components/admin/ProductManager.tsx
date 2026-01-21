import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchCategories, fetchProducts, updateProductOrder } from '@/lib/supabase';
import { CategorySelector } from './products/CategorySelector';
import { AddProductForm } from './products/AddProductForm';
import { ProductList } from './products/ProductList';
import { ProductPDFExport } from './ProductPDFExport';
import ProductExport from './ProductExport';
import { StockReportsManager } from './stock/StockReportsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      // Sort by order_index to ensure consistent display
      const sortedProducts = fetchedProducts.sort((a, b) => 
        (a.order_index ?? 0) - (b.order_index ?? 0)
      );
      console.log("Loaded sorted products:", sortedProducts);
      setProductsList(sortedProducts);
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
    // Prevent multiple simultaneous reorders
    if (isSaving) return;
    
    // If dropped outside the list
    if (!result.destination) return;
    
    // If dropped in the same position
    if (result.destination.index === result.source.index) return;

    // Clone the current array to avoid direct state mutations
    const updatedProducts = Array.from(productsList);
    
    // Remove the dragged item from its position
    const [draggedItem] = updatedProducts.splice(result.source.index, 1);
    
    // Insert it at the new position
    updatedProducts.splice(result.destination.index, 0, draggedItem);

    // Update the order_index values
    const reorderedProducts = updatedProducts.map((item, index) => ({
      ...item,
      order_index: index
    }));

    // Update local state immediately for a responsive UI
    setProductsList(reorderedProducts);

    // Show loading toast
    toast({
      title: "Atualizando ordem",
      description: "Salvando a nova ordem dos produtos...",
    });

    setIsSaving(true);
    try {
      // Update the database in sequence
      for (const item of reorderedProducts) {
        console.log(`Updating product ${item.id} order to ${item.order_index}`);
        await updateProductOrder(item.id, item.order_index ?? 0);
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
      
      // Reload original order
      if (selectedCategoryId) {
        await loadProducts(selectedCategoryId);
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
      <Tabs defaultValue="gerenciar" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="gerenciar">Gerenciar</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="gerenciar" className="space-y-4">
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

          <div className="bg-gray-900/50 p-4 rounded-md flex flex-wrap gap-3 items-center">
            <ProductPDFExport />
            <ProductExport />
          </div>

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
        </TabsContent>

        <TabsContent value="relatorios" className="mt-4">
          <StockReportsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductManager;