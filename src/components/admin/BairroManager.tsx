
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { fetchBairros, updateBairro, deleteBairro, updateBairroOrder } from '@/lib/supabase';
import { AddBairroForm } from './bairros/AddBairroForm';
import { BairroList } from './bairros/BairroList';
import type { SupabaseBairro } from '@/lib/supabase/types';

const BairroManager: React.FC = () => {
  const [bairros, setBairros] = useState<SupabaseBairro[]>([]);
  const [editingBairro, setEditingBairro] = useState<SupabaseBairro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllBairros();
  }, []);

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

  if (isLoading) {
    return (
      <div className="text-center py-4 text-white">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        Carregando bairros...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-white">Gerenciar Bairros</h2>
      
      <AddBairroForm 
        onBairroAdded={(newBairro) => setBairros([...bairros, newBairro])}
        bairrosLength={bairros.length}
      />
      
      <BairroList
        bairros={bairros}
        editingBairro={editingBairro}
        onDragEnd={handleDragEnd}
        onEdit={(bairro) => setEditingBairro({ ...bairro })}
        onSave={handleSaveEdit}
        onCancel={() => setEditingBairro(null)}
        onDelete={handleDeleteBairro}
        setEditingBairro={setEditingBairro}
      />
    </div>
  );
};

export default BairroManager;
