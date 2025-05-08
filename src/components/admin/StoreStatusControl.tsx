
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useStoreStatus } from '@/hooks/useStoreStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorOpen, DoorClosed, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StoreStatusControl = () => {
  const { isOpen, manualOverride, setManualOverride } = useStoreStatus();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    
    try {
      await setManualOverride(checked);
      
      toast({
        title: checked ? "Loja aberta manualmente" : "Loja fechada manualmente",
        description: checked 
          ? "Os clientes agora podem fazer pedidos." 
          : "Os clientes não podem fazer pedidos até a loja ser reaberta.",
      });
    } catch (err) {
      console.error('Error toggling store status:', err);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da loja",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getScheduleStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const isScheduledOpen = hour >= 18 || hour < 5;
    
    return (
      <div className="flex items-center gap-2 mt-1">
        <Clock className={`h-4 w-4 ${isScheduledOpen ? 'text-green-400' : 'text-red-400'}`} />
        <span className="text-sm text-gray-300">
          Horário normal: {isScheduledOpen ? 'Aberto' : 'Fechado'}
        </span>
      </div>
    );
  };

  return (
    <Card className="bg-black/50 border-gray-800 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          Status da Loja
          <Badge 
            variant={manualOverride !== null ? "outline" : "secondary"} 
            className="ml-2"
          >
            {manualOverride !== null ? 'Manual' : 'Automático'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Controle se a loja está aberta ou fechada para pedidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isOpen ? (
              <DoorOpen className="h-6 w-6 text-green-500" />
            ) : (
              <DoorClosed className="h-6 w-6 text-red-500" />
            )}
            <div>
              <Label htmlFor="store-status" className="text-white font-medium">
                {isOpen ? 'Loja Aberta' : 'Loja Fechada'}
              </Label>
              {getScheduleStatus()}
            </div>
          </div>
          <Switch 
            id="store-status" 
            checked={isOpen}
            disabled={isUpdating}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreStatusControl;
