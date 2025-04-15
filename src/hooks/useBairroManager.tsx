
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
      setBairros(bairrosList);
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
    if (!result.destination) return;

    const items = Array.from(bairros);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index
    }));

    setBairros(updatedItems);

    try {
      for (const item of updatedItems) {
        await updateBairroOrder(item.id, item.order_index || 0);
      }
      toast({
        title: "Ordem atualizada",
        description: "A ordem dos bairros foi atualizada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      toast({
        title: "Erro ao atualizar ordem",
        description: "Ocorreu um erro ao atualizar a ordem dos bairros",
        variant: "destructive"
      });
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
