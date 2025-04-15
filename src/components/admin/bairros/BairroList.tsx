
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { BairroItem } from './BairroItem';
import type { SupabaseBairro } from '@/lib/supabase/types';

interface BairroListProps {
  bairros: SupabaseBairro[];
  editingBairro: SupabaseBairro | null;
  onDragEnd: (result: any) => void;
  onEdit: (bairro: SupabaseBairro) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: number) => void;
  setEditingBairro: (bairro: SupabaseBairro | null) => void;
}

export const BairroList: React.FC<BairroListProps> = ({
  bairros,
  editingBairro,
  onDragEnd,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  setEditingBairro,
}) => {
  return (
    <div className="bg-black/50 rounded-md overflow-hidden">
      <DragDropContext onDragEnd={onDragEnd}>
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
                          <BairroItem
                            bairro={bairro}
                            editingBairro={editingBairro}
                            onEdit={onEdit}
                            onSave={onSave}
                            onCancel={onCancel}
                            onDelete={onDelete}
                            setEditingBairro={setEditingBairro}
                          />
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
  );
};
