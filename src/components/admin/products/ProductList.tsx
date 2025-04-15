
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Loader2 } from 'lucide-react';
import { ProductItem } from './ProductItem';
import { 
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody
} from '@/components/ui/table';
import type { SupabaseProduct } from '@/lib/supabase/types';

interface ProductListProps {
  products: SupabaseProduct[];
  isLoading: boolean;
  isSaving: boolean;
  selectedCategoryId: number | null;
  onProductsReorder: (result: any) => void;
  onProductUpdate: (updatedProduct: SupabaseProduct) => void;
  onProductDelete: (productId: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  isSaving,
  selectedCategoryId,
  onProductsReorder,
  onProductUpdate,
  onProductDelete
}) => {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
      </div>
    );
  }

  if (!selectedCategoryId) {
    return (
      <div className="p-4 text-center text-gray-400">
        Selecione uma categoria para ver seus produtos
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        Nenhum produto encontrado nesta categoria
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onProductsReorder}>
      <Droppable droppableId="products">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="w-full">
            <Table className="w-full text-white">
              <TableHeader className="bg-gray-800">
                <TableRow>
                  <TableHead className="w-1/2 text-left">Nome</TableHead>
                  <TableHead className="w-1/4 text-right">Preço</TableHead>
                  <TableHead className="w-1/4 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <Draggable
                    key={product.id.toString()}
                    draggableId={product.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`border-t border-gray-700 hover:bg-gray-800/50 transition-colors cursor-move ${
                          product.is_paused ? 'opacity-50' : ''
                        }`}
                      >
                        <ProductItem
                          product={product}
                          onUpdate={onProductUpdate}
                          onDelete={onProductDelete}
                          isSaving={isSaving}
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
  );
};
