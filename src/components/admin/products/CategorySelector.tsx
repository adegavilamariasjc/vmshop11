
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SupabaseCategory } from '@/lib/supabase/types';

interface CategorySelectorProps {
  categories: SupabaseCategory[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number) => void;
  isLoading: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  isLoading
}) => {
  return (
    <div className="mb-6">
      <Select 
        value={selectedCategoryId?.toString() || ""} 
        onValueChange={(value) => onCategoryChange(Number(value))}
        disabled={isLoading || categories.length === 0}
      >
        <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white z-50">
          {categories.map(category => (
            <SelectItem 
              key={category.id} 
              value={category.id.toString()} 
              className="text-white hover:bg-gray-700 focus:bg-gray-700"
            >
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
