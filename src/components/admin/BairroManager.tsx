
import React from 'react';
import { Loader2 } from 'lucide-react';
import { AddBairroForm } from './bairros/AddBairroForm';
import { BairroList } from './bairros/BairroList';
import { useBairroManager } from '@/hooks/useBairroManager';

const BairroManager: React.FC = () => {
  const {
    bairros,
    editingBairro,
    isLoading,
    setBairros,
    setEditingBairro,
    handleSaveEdit,
    handleDeleteBairro,
    handleDragEnd
  } = useBairroManager();

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
