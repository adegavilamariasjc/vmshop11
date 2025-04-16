import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { BairroItem } from './BairroItem';
import { GripVertical } from 'lucide-react';
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
        <Table>
          <TableHeader className="bg-gray-800">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white text-right">Taxa (R$)</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          
          <Droppable droppableId="bairros" direction="vertical">
            {(provided: DroppableProvided) => (
              <TableBody
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {bairros.map((bairro, index) => (
                  <Draggable
                    key={bairro.id.toString()}
                    draggableId={bairro.id.toString()}
                    index={index}
                  >
                    {(dragProvided: DraggableProvided) => (
                      <TableRow
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        <td 
                          className="py-2 pl-4 cursor-move" 
                          {...dragProvided.dragHandleProps}
                        >
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </td>
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
            )}
          </Droppable>
        </Table>
      </DragDropContext>
    </div>
  );
};
