
import React, { useState, useEffect } from 'react';
import { Pencil, Trash, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bairro } from '../../types';
import { bairros, saveBairros } from '../../data/products';
import { useToast } from '@/hooks/use-toast';

const BairroManager: React.FC = () => {
  const { toast } = useToast();
  const [bairrosList, setBairrosList] = useState<Bairro[]>([]);
  const [newBairro, setNewBairro] = useState<Bairro>({
    nome: "",
    taxa: 0
  });
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editedBairro, setEditedBairro] = useState<Bairro>({
    nome: "",
    taxa: 0
  });

  useEffect(() => {
    setBairrosList([...bairros]);
  }, []);

  const handleAddBairro = () => {
    if (!newBairro.nome.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, digite um nome para o bairro",
        variant: "destructive",
      });
      return;
    }

    if (bairrosList.some(b => b.nome === newBairro.nome)) {
      toast({
        title: "Bairro duplicado",
        description: "Este bairro já existe",
        variant: "destructive",
      });
      return;
    }

    const updatedBairros = [...bairrosList, newBairro];
    
    // Save to local storage
    saveBairros(updatedBairros);
    
    // Update local state
    setBairrosList(updatedBairros);
    setNewBairro({ nome: "", taxa: 0 });
    
    toast({
      title: "Bairro adicionado",
      description: `${newBairro.nome} foi adicionado com sucesso`
    });
  };

  const handleEditBairro = (bairro: Bairro) => {
    setEditedBairro({...bairro});
    setEditMode(bairro.nome);
  };

  const handleSaveEdit = (oldNome: string, index: number) => {
    if (!editedBairro.nome.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, digite um nome para o bairro",
        variant: "destructive",
      });
      return;
    }

    if (bairrosList.some(b => b.nome === editedBairro.nome && b.nome !== oldNome)) {
      toast({
        title: "Bairro duplicado",
        description: "Este bairro já existe",
        variant: "destructive",
      });
      return;
    }

    const updatedBairros = [...bairrosList];
    updatedBairros[index] = editedBairro;
    
    // Save to local storage
    saveBairros(updatedBairros);
    
    // Update local state
    setBairrosList(updatedBairros);
    setEditMode(null);
    
    toast({
      title: "Bairro atualizado",
      description: `${editedBairro.nome} foi atualizado com sucesso`
    });
  };

  const handleDeleteBairro = (index: number) => {
    if (confirm('Tem certeza que deseja excluir este bairro?')) {
      const updatedBairros = [...bairrosList];
      updatedBairros.splice(index, 1);
      
      // Save to local storage
      saveBairros(updatedBairros);
      
      // Update local state
      setBairrosList(updatedBairros);
      
      toast({
        title: "Bairro excluído",
        description: "O bairro foi excluído com sucesso"
      });
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
            value={newBairro.nome}
            onChange={e => setNewBairro({...newBairro, nome: e.target.value})}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Input
            type="number"
            placeholder="Taxa de entrega"
            value={newBairro.taxa || ''}
            onChange={e => setNewBairro({...newBairro, taxa: parseFloat(e.target.value) || 0})}
            className="bg-gray-800 border-gray-700 text-white md:w-32"
          />
          <Button 
            onClick={handleAddBairro}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-1 items-center"
          >
            <Plus size={16} /> Adicionar
          </Button>
        </div>
      </div>
      
      {/* Bairro list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Lista de Bairros</h3>
        
        <div className="bg-gray-900/50 rounded-md overflow-hidden">
          {bairrosList.length > 0 ? (
            <table className="w-full text-white">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-right">Taxa de entrega</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {bairrosList.map((bairro, index) => (
                  <tr key={bairro.nome} className="border-t border-gray-700">
                    <td className="p-3">
                      {editMode === bairro.nome ? (
                        <Input
                          value={editedBairro.nome}
                          onChange={e => setEditedBairro({...editedBairro, nome: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      ) : (
                        bairro.nome
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editMode === bairro.nome ? (
                        <Input
                          type="number"
                          value={editedBairro.taxa || 0}
                          onChange={e => setEditedBairro({...editedBairro, taxa: parseFloat(e.target.value) || 0})}
                          className="bg-gray-800 border-gray-700 text-white w-24 ml-auto"
                        />
                      ) : (
                        `R$ ${bairro.taxa.toFixed(2)}`
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {editMode === bairro.nome ? (
                          <Button 
                            onClick={() => handleSaveEdit(bairro.nome, index)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save size={16} />
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleEditBairro(bairro)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDeleteBairro(index)}
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
              Nenhum bairro encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BairroManager;
