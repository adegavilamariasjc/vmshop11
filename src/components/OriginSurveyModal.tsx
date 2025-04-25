
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ORIGIN_OPTIONS = ['Facebook', 'Instagram', 'Google', 'Loja física', 'Ja respondi'] as const;

interface OriginSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OriginSurveyModal: React.FC<OriginSurveyModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const handleOriginSelect = async (origin: string) => {
    try {
      // Save to database
      await supabase
        .from('client_origins')
        .insert([{ origin }]);
      
      // Set in local storage to remember the user has responded
      localStorage.setItem('originSurveyCompleted', 'true');
      
      toast({
        title: 'Obrigado!',
        description: 'Sua resposta foi registrada com sucesso.',
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving origin:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar sua resposta. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Como conheceu a VM?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Ajude-nos a melhorar nosso atendimento respondendo essa breve pergunta
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {ORIGIN_OPTIONS.map((origin) => (
            <Button
              key={origin}
              onClick={() => handleOriginSelect(origin)}
              variant="outline"
              className="p-8 text-lg hover:bg-purple-100 hover:text-purple-900 transition-colors"
            >
              {origin}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OriginSurveyModal;
