
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const ORIGIN_OPTIONS = ['Facebook', 'Instagram', 'Google', 'Loja física'] as const;

interface OriginSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OriginSurveyModal: React.FC<OriginSurveyModalProps> = ({ isOpen, onClose }) => {
  const handleOriginSelect = async (origin: string) => {
    try {
      await supabase
        .from('client_origins')
        .insert([{ origin }]);
      
      onClose();
    } catch (error) {
      console.error('Error saving origin:', error);
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
