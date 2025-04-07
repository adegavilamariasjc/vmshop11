
import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchBairros, addBairro, updateBairro, deleteBairro, SupabaseBairro } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const BairroManager: React.FC = () => {
  const { toast } = useToast();
  const [bairrosList, setBairrosList] = useState<SupabaseBairro[]>([]);
  const [newBairro, setNewBairro] = useState<{name: string; taxa: number}>({
    name: "",
    taxa: 0
  });
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editedBairro, setEditedBairro] = useState<{name: string; taxa: number}>({
    name: "",
    taxa: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBairros();
  }, []);

  const loadBairros = async () => {
    setIsLoading(true);
    try {
      const bairros = await fetchBairros();
      setBairrosList(bairros);
    } catch (error) {
      console.error("Erro ao carregar bairros:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os bairros do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBairro = async () => {
    if (!newBairro.name.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, digite um nome para o bairro",
        variant: "destructive",
      });
      return;
    }

    if (bairrosList.some(b => b.name === newBairro.name)) {
      toast({
        title: "Bairro duplicado",
        description: "Este bairro já existe",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const addedBairro = await addBairro({
        name: newBairro.name,
        taxa: newBairro.taxa
      });

      if (addedBairro) {
        setBairrosList([...bairrosList, addedBairro]);
        setNewBairro({ name: "", taxa: 0 });
        
        toast({
          title: "Bairro adicionado",
          description: `${newBairro.name} foi adicionado com sucesso`
        });
      } else {
        toast({
          title: "Erro ao adicionar",
          description: "Não foi possível adicionar o bairro ao banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar bairro:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro ao adicionar o bairro.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditBairro = (bairro: SupabaseBairro) => {
    setEditedBairro({
      name: bairro.name,
      taxa: bairro.taxa
    });
    setEditMode(bairro.id);
  };

  const handleSaveEdit = async (bairroId: number) => {
    if (!editedBairro.name.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, digite um nome para o bairro",
        variant: "destructive",
      });
      return;
    }

    if (bairrosList.some(b => b.name === editedBairro.name && b.id !== bairroId)) {
      toast({
        title: "Bairro duplicado",
        description: "Este bairro já existe",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const success = await updateBairro(bairroId, {
        name: editedBairro.name,
        taxa: editedBairro.taxa
      });

      if (success) {
        // Atualizar localmente
        setBairrosList(bairrosList.map(b => 
          b.id === bairroId 
            ? {...b, name: editedBairro.name, taxa: editedBairro.taxa} 
            : b
        ));
        
        setEditMode(null);
        
        toast({
          title: "Bairro atualizado",
          description: `${editedBairro.name} foi atualizado com sucesso`
        });
      } else {
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar o bairro no banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar bairro:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o bairro.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBairro = async (bairroId: number) => {
    if (!confirm('Tem certeza que deseja excluir este bairro?')) {
      return;
    }

    setIsSaving(true);

    try {
      const success = await deleteBairro(bairroId);

      if (success) {
        // Atualizar localmente
        setBairrosList(bairrosList.filter(b => b.id !== bairroId));
        
        toast({
          title: "Bairro excluído",
          description: "O bairro foi excluído com sucesso"
        });
      } else {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o bairro do banco de dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir bairro:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o bairro.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Gerenciar Bairros</h2>
      
      {/* Add new bairro */}
      <div className="bg-gray-900/50 p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Adicionar Bairro</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Nome do bairro"
            value={newBairro.name}
            onChange={e => setNewBairro({...newBairro, name: e.target.value})}
            className="bg-gray-800 border-gray-700 text-white"
            disabled={isSaving}
          />
          <Input
            type="number"
            placeholder="Taxa de entrega"
            value={newBairro.taxa || ''}
            onChange={e => setNewBairro({...newBairro, taxa: parseFloat(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white md:w-32"
            disabled={isSaving}
          />
          <Button 
            onClick={handleAddBairro}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center"
            disabled={isSaving}
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
      
      {/* Bairro list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Bairros</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : bairrosList.length > 0 ? (
            <table className="w-full text-white">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-right">Taxa de entrega</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {bairrosList.map((bairro) => (
                  <tr key={bairro.id} className="border-t border-gray-700">
                    <td className="p-3">
                      {editMode === bairro.id ? (
                        <Input
                          value={editedBairro.name}
                          onChange={e => setEditedBairro({...editedBairro, name: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={isSaving}
                        />
                      ) : (
                        bairro.name
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editMode === bairro.id ? (
                        <Input
                          type="number"
                          value={editedBairro.taxa || 0}
                          onChange={e => setEditedBairro({...editedBairro, taxa: parseFloat(e.target.value) || 0})}
                          className="bg-gray-800 border-gray-700 text-white w-24 ml-auto"
                          disabled={isSaving}
                        />
                      ) : (
                        `R$ ${bairro.taxa.toFixed(2)}`
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {editMode === bairro.id ? (
                          <Button 
                            onClick={() => handleSaveEdit(bairro.id)}
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
                            onClick={() => handleEditBairro(bairro)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isSaving}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDeleteBairro(bairro.id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isSaving}
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
              Nenhum bairro encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BairroManager;
