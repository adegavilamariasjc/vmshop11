
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface OriginSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OriginSurveyModal: React.FC<OriginSurveyModalProps> = ({ isOpen, onClose }) => {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const originOptions = [
    'Instagram',
    'Google',
    'Indicação',
    'Facebook',
    'WhatsApp',
    'TikTok',
    'Ja respondi'
  ];

  const handleSubmit = async () => {
    if (!selectedOrigin) {
      toast({
        title: "Selecione uma opção",
        description: "Por favor, selecione como você nos encontrou.",
        variant: "destructive",
      });
      return;
    }

    if (selectedOrigin === "Ja respondi") {
      localStorage.setItem('originSurveyCompleted', 'true');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('client_origins')
        .insert([{ origin: selectedOrigin }]);

      if (error) {
        console.error('Error saving origin data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível registrar sua resposta. Tente novamente.",
          variant: "destructive",
        });
      } else {
        console.log('Origin data saved successfully:', data);
        localStorage.setItem('originSurveyCompleted', 'true');
        toast({
          title: "Obrigado!",
          description: "Sua resposta foi registrada com sucesso.",
        });
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error saving origin data:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar sua resposta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Como você nos encontrou?</DialogTitle>
          <DialogDescription className="text-sm text-gray-300">
            Sua resposta nos ajuda a melhorar nossos serviços.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedOrigin} onValueChange={setSelectedOrigin}>
            {originOptions.map(origin => (
              <div key={origin} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={origin} id={origin} />
                <Label htmlFor={origin} className="cursor-pointer">{origin}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedOrigin}
            className="bg-purple-dark hover:bg-purple-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OriginSurveyModal;
