import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Input } from './ui/input';
import { searchProductsEnhanced } from '@/lib/supabase/productStats';
import { getProductIcon } from '@/utils/productIcons';

interface ProductSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectSuggestion?: (suggestion: string) => void;
}

interface SearchSuggestion {
  id: number;
  name: string;
  category_name: string;
  price: number;
  cart_additions: number;
  relevance_score: number;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ 
  searchQuery, 
  onSearchChange,
  onSelectSuggestion 
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    const handleScroll = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchProductsEnhanced(searchQuery);
        setSuggestions(results as SearchSuggestion[]);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSearchChange('');
    setShowSuggestions(false);
    setSuggestions([]);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion.name);
    }
  };

  return (
    <div className="relative mb-4" ref={wrapperRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" size={20} />
      <Input
        type="text"
        placeholder="Buscar produtos..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        className="pl-10 pr-10 bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
        autoComplete="off"
      />
      {searchQuery && (
        <button
          onClick={() => {
            onSearchChange('');
            setShowSuggestions(false);
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
        >
          <X size={20} />
        </button>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-[100] max-h-96 overflow-y-auto">
          {suggestions.map((suggestion) => {
            const ProductIcon = getProductIcon(suggestion.name, suggestion.category_name);
            return (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 group"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                  <ProductIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium truncate">{suggestion.name}</span>
                    {suggestion.cart_additions > 5 && (
                      <TrendingUp size={14} className="text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="truncate">{suggestion.category_name}</span>
                    <span>•</span>
                    <span className="text-primary">R$ {suggestion.price.toFixed(2)}</span>
                  </div>
                </div>
                {suggestion.cart_additions > 0 && (
                  <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {suggestion.cart_additions}x
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
      
      {isLoading && searchQuery.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg p-4 z-[100]">
          <div className="flex items-center justify-center text-muted-foreground">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="ml-2">Buscando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchBar;
