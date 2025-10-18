
import { DoorOpen, DoorClosed } from 'lucide-react';
import { useStoreStatus } from '@/hooks/useStoreStatus';

const StoreStatus = () => {
  const { isOpen: isDeliveryOpen } = useStoreStatus(false);
  const { isOpen: isBalcaoOpen } = useStoreStatus(true);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg">
        {isDeliveryOpen ? (
          <>
            <DoorOpen className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">Delivery Aberto (18h-6h)</span>
          </>
        ) : (
          <>
            <DoorClosed className="h-5 w-5 text-red-400" />
            <span className="text-red-400 font-medium">Delivery Fechado (18h-6h)</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg">
        {isBalcaoOpen ? (
          <>
            <DoorOpen className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">Balcão Aberto (14h-6h)</span>
          </>
        ) : (
          <>
            <DoorClosed className="h-5 w-5 text-red-400" />
            <span className="text-red-400 font-medium">Balcão Fechado (14h-6h)</span>
          </>
        )}
      </div>
    </div>
  );
};

export default StoreStatus;
