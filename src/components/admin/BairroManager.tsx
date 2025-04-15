import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, PlusCircle, Save, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchBairros, addBairro, updateBairro, deleteBairro, updateBairroOrder } from '@/lib/supabase';
import type { SupabaseBairro } from '@/lib/supabase/types';

interface Bairro {
  id: number;
  nome: string;
  taxa: number;
}

const BairroManager: React.FC = () => {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [newBairro, setNewBairro] = useState({ nome: '', taxa: 0 });
  const [editingBairro, setEditingBairro] = useState<Bairro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBairros();
  }, []);

  const fetchBairros = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bairros')
        .select('*')
        .order('nome');
      
      if (error) {
        throw error;
      }
      
      setBairros(data);
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

  const handleAddBairro = async () => {
    if (!newBairro.nome) {
      toast({
        title: 'Erro',
        description: 'O nome do bairro é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bairros')
        .insert([{ nome: newBairro.nome, taxa: newBairro.taxa }])
        .select();
      
      if (error) {
        throw error;
      }
      
      setBairros([...bairros, data[0]]);
      setNewBairro({ nome: '', taxa: 0 });
      
      toast({
        title: 'Sucesso',
        description: 'Bairro adicionado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao adicionar bairro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o bairro.',
        variant: 'destructive',
      });
    }
  };

  const handleEditBairro = (bairro: Bairro) => {
    setEditingBairro({ ...bairro });
  };

  const handleSaveEdit = async () => {
    if (!editingBairro) return;
    
    try {
      const { error } = await supabase
        .from('bairros')
        .update({ nome: editingBairro.nome, taxa: editingBairro.taxa })
        .eq('id', editingBairro.id);
      
      if (error) {
        throw error;
      }
      
      setBairros(bairros.map(b => b.id === editingBairro.id ? editingBairro : b));
      setEditingBairro(null);
      
      toast({
        title: 'Sucesso',
        description: 'Bairro atualizado com sucesso.',
      });
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
      const { error } = await supabase
        .from('bairros')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setBairros(bairros.filter(b => b.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Bairro excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir bairro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o bairro.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingBairro(null);
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
      await fetchBairros();
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-white">Carregando bairros...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-white">Gerenciar Bairros</h2>
      
      <div className="bg-black/50 p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-3 text-white">Adicionar Novo Bairro</h3>
        <div className="flex gap-3 mb-2">
          <div className="flex-grow">
            <Input
              placeholder="Nome do bairro"
              value={newBairro.nome}
              onChange={(e) => setNewBairro({ ...newBairro, nome: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="w-32">
            <Input
              type="number"
              placeholder="Taxa"
              value={newBairro.taxa}
              onChange={(e) => setNewBairro({ ...newBairro, taxa: Number(e.target.value) })}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <Button 
            onClick={handleAddBairro}
            className="bg-purple-dark hover:bg-purple-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
      
      <div className="bg-black/50 rounded-md overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="bairros">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <Table>
                  <TableHeader className="bg-gray-800">
                    <TableRow>
                      <TableHead className="text-white">Nome</TableHead>
                      <TableHead className="text-white text-right">Taxa (R$)</TableHead>
                      <TableHead className="text-white text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bairros.map((bairro, index) => (
                      <Draggable
                        key={bairro.id.toString()}
                        draggableId={bairro.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="border-gray-700 hover:bg-gray-800 cursor-move"
                          >
                            <TableCell className="text-white">
                              {editingBairro?.id === bairro.id ? (
                                <Input
                                  value={editingBairro.nome}
                                  onChange={(e) => setEditingBairro({ ...editingBairro, nome: e.target.value })}
                                  className="bg-gray-900 border-gray-700 text-white"
                                />
                              ) : (
                                bairro.nome
                              )}
                            </TableCell>
                            <TableCell className="text-white text-right">
                              {editingBairro?.id === bairro.id ? (
                                <Input
                                  type="number"
                                  value={editingBairro.taxa}
                                  onChange={(e) => setEditingBairro({ ...editingBairro, taxa: Number(e.target.value) })}
                                  className="bg-gray-900 border-gray-700 text-white w-24 ml-auto"
                                />
                              ) : (
                                bairro.taxa.toFixed(2)
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingBairro?.id === bairro.id ? (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={handleSaveEdit}
                                    className="text-green-500 hover:text-green-400 hover:bg-gray-700"
                                  >
                                    <Save size={18} />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={handleCancelEdit}
                                    className="text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                                  >
                                    <X size={18} />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEditBairro(bairro)}
                                    className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                                  >
                                    <Pencil size={18} />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeleteBairro(bairro.id)}
                                    className="text-red-500 hover:text-red-400 hover:bg-gray-700"
                                  >
                                    <Trash2 size={18} />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default BairroManager;
