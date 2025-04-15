
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { addBairro } from '@/lib/supabase';

interface AddBairroFormProps {
  onBairroAdded: (bairro: any) => void;
  bairrosLength: number;
}

export const AddBairroForm: React.FC<AddBairroFormProps> = ({ onBairroAdded, bairrosLength }) => {
  const [newBairro, setNewBairro] = useState({ nome: '', taxa: 0 });
  const { toast } = useToast();

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
      const addedBairro = await addBairro({ 
        nome: newBairro.nome, 
        taxa: newBairro.taxa,
        order_index: bairrosLength
      });
      
      if (addedBairro) {
        onBairroAdded(addedBairro);
        setNewBairro({ nome: '', taxa: 0 });
        
        toast({
          title: 'Sucesso',
          description: 'Bairro adicionado com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar bairro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o bairro.',
        variant: 'destructive',
      });
    }
  };

  return (
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
  );
};
