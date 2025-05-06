
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export const useBairros = () => {
  const [bairros, setBairros] = useState<{nome: string; taxa: number}[]>([
    { nome: "Selecione Um Bairro", taxa: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBairros = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bairros')
          .select('*')
          .order('nome');
        
        if (error) {
          console.error('Error fetching bairros:', error);
          setIsLoading(false);
          return;
        }
        
        const formattedBairros = data.map(b => ({
          nome: b.nome,
          taxa: b.taxa
        }));
        
        setBairros(formattedBairros);
      } catch (err) {
        console.error('Unexpected error fetching bairros:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBairros();
  }, []);

  return { bairros, isLoading };
};
