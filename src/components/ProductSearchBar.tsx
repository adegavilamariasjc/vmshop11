import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';

interface ProductSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <Input
        type="text"
        placeholder="Buscar produtos..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10 bg-background/50 border-gray-600 text-white placeholder:text-gray-400"
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default ProductSearchBar;
