
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadCategories } from '../data/categories';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCategoriesData();
  }, [retryCount]);

  const loadCategoriesData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Tentativa de carregar categorias:", retryCount + 1);
      const data = await loadCategories();
      
      if (data && data.length > 0) {
        console.log("Categorias carregadas:", data);
        setCategories(data);
        
        // Se houver categorias, selecione a primeira automaticamente
        if (data.length > 0 && !activeCategory) {
          onSelectCategory(data[0]);
        }
      } else {
        console.log("Nenhuma categoria encontrada, tentativa:", retryCount + 1);
        setError("Nenhuma categoria encontrada no banco de dados.");
        
        // Se não encontrou categorias, exibe mensagem para o usuário
        if (retryCount >= 3) {
          toast({
            title: "Erro ao carregar categorias",
            description: "Não foram encontradas categorias no banco de dados. Tente migrar os dados usando o botão na parte superior da página.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setError("Erro ao carregar categorias");
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias do menu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex overflow-x-auto mb-4 pb-2 gap-2">
        <div className="bg-gray-300 animate-pulse h-10 w-24 rounded-md"></div>
        <div className="bg-gray-300 animate-pulse h-10 w-24 rounded-md"></div>
        <div className="bg-gray-300 animate-pulse h-10 w-24 rounded-md"></div>
      </div>
    );
  }

  if (error || categories.length === 0) {
    return (
      <div className="text-white text-center py-4">
        <p className="mb-2">{error || "Nenhuma categoria disponível."}</p>
        <Button onClick={handleRetry} className="bg-purple-dark hover:bg-purple-600">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto mb-4 pb-2 gap-2">
      {categories.map(category => (
        <motion.div
          key={category}
          onClick={() => onSelectCategory(category)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`cursor-pointer px-3 py-2 rounded-md text-center min-w-max ${
            activeCategory === category 
              ? 'bg-purple-dark text-white' 
              : 'bg-gray-200 text-black'
          }`}
        >
          <span className="text-sm font-semibold whitespace-nowrap">
            {category}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default CategorySelector;
