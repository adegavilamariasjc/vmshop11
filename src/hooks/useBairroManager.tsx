
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchBairros, updateBairro, deleteBairro, updateBairroOrder } from '@/lib/supabase';
import type { SupabaseBairro } from '@/lib/supabase/types';

export const useBairroManager = () => {
  const [bairros, setBairros] = useState<SupabaseBairro[]>([]);
  const [editingBairro, setEditingBairro] = useState<SupabaseBairro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllBairros = async () => {
    setIsLoading(true);
    try {
      const bairrosList = await fetchBairros();
      // Sort by order_index to ensure consistent display
      const sortedBairros = bairrosList.sort((a, b) => 
        (a.order_index ?? 0) - (b.order_index ?? 0)
      );
      setBairros(sortedBairros);
    } catch (error) {
      console.error('Erro ao buscar bairros:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os bairros.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBairros();
  }, []);

  const handleSaveEdit = async () => {
    if (!editingBairro) return;
    
    try {
      const success = await updateBairro(editingBairro.id, { 
        nome: editingBairro.nome, 
        taxa: editingBairro.taxa
      });
      
      if (success) {
        setBairros(bairros.map(b => b.id === editingBairro.id ? editingBairro : b));
        setEditingBairro(null);
        
        toast({
          title: 'Sucesso',
          description: 'Bairro atualizado com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar bairro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o bairro.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBairro = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este bairro?')) return;
    
    try {
      const success = await deleteBairro(id);
      
      if (success) {
        setBairros(bairros.filter(b => b.id !== id));
        
        toast({
          title: 'Sucesso',
          description: 'Bairro excluído com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao excluir bairro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o bairro.',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    // If dropped outside the list or no destination
    if (!result.destination) return;
    
    // If dropped in the same position
    if (result.destination.index === result.source.index) return;

    // Clone the current array to avoid direct state mutations
    const updatedBairros = Array.from(bairros);
    
    // Remove the dragged item from its position
    const [draggedItem] = updatedBairros.splice(result.source.index, 1);
    
    // Insert it at the new position
    updatedBairros.splice(result.destination.index, 0, draggedItem);

    // Update the order_index values
    const reorderedBairros = updatedBairros.map((item, index) => ({
      ...item,
      order_index: index
    }));

    // Update local state immediately for a responsive UI
    setBairros(reorderedBairros);

    // Show loading toast
    const loadingToast = toast({
      title: "Atualizando ordem",
      description: "Salvando a nova ordem dos bairros...",
    });

    try {
      // Update the database in sequence to maintain order integrity
      for (const item of reorderedBairros) {
        await updateBairroOrder(item.id, item.order_index || 0);
      }
      
      // Show success message after all updates complete
      toast({
        title: "Ordem atualizada",
        description: "A ordem dos bairros foi atualizada com sucesso",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      
      // Show error message and refresh data to get original order
      toast({
        title: "Erro ao atualizar ordem",
        description: "Ocorreu um erro ao atualizar a ordem dos bairros",
        variant: "destructive"
      });
      
      // Reload the original order
      await fetchAllBairros();
    }
  };

  return {
    bairros,
    editingBairro,
    isLoading,
    setBairros,
    setEditingBairro,
    handleSaveEdit,
    handleDeleteBairro,
    handleDragEnd
  };
};
