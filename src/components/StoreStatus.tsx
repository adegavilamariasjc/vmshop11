
import { DoorOpen, DoorClosed } from 'lucide-react';
import { useStoreStatus } from '@/hooks/useStoreStatus';

const StoreStatus = () => {
  const { isOpen } = useStoreStatus();

  return (
    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg">
      {isOpen ? (
        <>
          <DoorOpen className="h-5 w-5 text-green-400" />
          <span className="text-green-400 font-medium">Aberto</span>
        </>
      ) : (
        <>
          <DoorClosed className="h-5 w-5 text-red-400" />
          <span className="text-red-400 font-medium">
            Fechado - Abrimos às 18h
          </span>
        </>
      )}
    </div>
  );
};

export default StoreStatus;
