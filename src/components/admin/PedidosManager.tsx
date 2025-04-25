
import React, { useEffect, useRef } from 'react';
import { RefreshCw, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PedidosTable from './PedidosTable';
import PedidoDetalhe from './PedidoDetalhe';
import NewOrderAlert from './NewOrderAlert';
import { usePedidosManager } from '@/hooks/usePedidosManager';
import { useToast } from '@/hooks/use-toast';

const PedidosManager = () => {
  const {
    pedidos,
    isLoading,
    hasNewPedido,
    refreshing,
    selectedPedido,
    showDetalhe,
    handleRefresh,
    handleAcknowledge,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
    setShowDetalhe,
    formatDateTime,
    setupNotificationSystem,
  } = usePedidosManager();

  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);
  const userInteractedRef = useRef<boolean>(false);
  
  // Setup notification system on component mount
  useEffect(() => {
    console.log("PedidosManager mounted, initializing notification system");
    
    // Initialize AudioContext on component mount
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
    }
    
    // Register user interaction - crucial for enabling audio
    const markUserInteraction = () => {
      userInteractedRef.current = true;
      console.log("User interaction detected, audio should be enabled now");
      
      // Try to resume AudioContext if needed
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(
          () => console.log("AudioContext resumed successfully"),
          err => console.error("Failed to resume AudioContext:", err)
        );
      }
    };
    
    // Listen for any user interaction
    document.addEventListener('click', markUserInteraction);
    document.addEventListener('touchstart', markUserInteraction);
    document.addEventListener('keydown', markUserInteraction);
    
    // Initialize notification system when component mounts
    const cleanup = setupNotificationSystem();
    
    // First initial refresh
    handleRefresh();
    
    // Also set up a periodic refresh as a backup mechanism
    const refreshInterval = setInterval(() => {
      console.log("Periodic refresh triggered");
      handleRefresh();
    }, 15000); // Every 15 seconds as a backup
    
    return () => {
      cleanup(); // Ensure proper cleanup when component unmounts
      clearInterval(refreshInterval);
      
      // Clean up event listeners
      document.removeEventListener('click', markUserInteraction);
      document.removeEventListener('touchstart', markUserInteraction);
      document.removeEventListener('keydown', markUserInteraction);
      
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      
      console.log("PedidosManager unmounted, cleaning up notification system");
    };
  }, [setupNotificationSystem, handleRefresh]);

  // Force refresh when tab becomes visible to ensure we have latest data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Orders tab became visible, refreshing data');
        handleRefresh();
        
        // Also try to resume AudioContext if it was suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(console.error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleRefresh]);

  // Function to try unlocking audio on any user interaction with the page
  const tryUnlockAudio = () => {
    // Create and immediately play+stop a short silent sound
    // This is a common technique to unlock audio on iOS/Safari
    try {
      if (audioContextRef.current) {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        // Configure for silence
        gainNode.gain.value = 0.01;
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        // Play briefly then stop
        oscillator.start(0);
        oscillator.stop(0.1);
        
        console.log("Audio unlock attempt made");
      }
      
      // Also try playing a silent HTML5 audio as backup
      const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjM1LjEwNAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAABAAACUgD///////////////////////////////////////////8AAAAATGF2YzU4LjU5AAAAAAAAAAAAAAAAJAYaAAAAAAAAAlIWqP8AAAAAAAAAAAAAAAAAAP/7kGQAAANUMEoFPeACNQV40KEYABEY41g5vAAIw5gBRjAAAAAoB8ABmDPQD8E/AuQcQMfB8Pgh+D4nQcHz4ICA+D5+CAIAgCL/4IAgiIgg+IPh+SI8EPwQBA7//EH7/+UAgICJ+QfP/4PggIAgAAgv/KAYAAD9/z/aYdV7nU6n0erniO9Ts9vUl1Omm9dVstl3Uf////uQB6//z+SQgaPaAAAIAAAAL4zqs/pYRVFlucDKCIJCEbkYgKUTEETMpQ0Z01ZARBEEWgKwEQQqAuAs/qfQxQt9/U0xEPQlI4iDSpiiDv9Q5Qqv0rIx/9QxiX6U1KFD/1DGgoGqFBNCi9KwMRf/UMYl+lNShRJ/9Q1QUDVCvEgdK6Olnf9TQgBQpdJX9Q9EpchVf9Q1QUDVClyGirox/9QbobTUMmKdDqP/1GNBUTEF01LFTFD/kGLwRNKmKIP/IorDU1a4x/8iisNTVnc4/8iisNf1NGYd/1NGY1/U0JgX9TvJA7//BE0A//sQZN6P0wk4y+Z6AAJWRzlMx5AAChiXJYBeAAE9kuPexiAA//KIorzUOZrf9TvKA7//BE0H/8ois/9TRmNf1NCYk//BE0IAACH4/rGCpro81vyZSed+UWTnqz5w5PyW6lh1L8Ev/0f/6P/9H/+j/wD/6OFbf/o//0f/6P/9Gmorz+j/r/o//0cKujhW3/6P/9H/+j//RwraDsb//R//o4Vt/+j/rUOFbf/o//0cK2//R//o//0f/6P/9H/+tf/o//0f/6P/9P/+j//R//o//0f/6P/9H/+j//R//rX/6P/9H/+j//T//o//0f/6P/9H/+j//R//o//0//6l/+j//T//o/8A/+jhW3/6P/9H/+j//R//o//0f/61/+j//R//o//0//6P/9H/+j//R//o//0f/6P/9H/+j/wD/6P/9H/+j//R//o//0f/6P/9a//R//o//0f/6f/9H/+j//R//o//0f/6P/9H/+j/wD/6P/9H/+j//R//o//0f/6P/9a//R//o/8A/+j//R//o//0f/6P/9H/+j//R//o//1r/9H/+j//R//o//0f/6P/9H/+j//R//o//0f/6P/9a//R//o//0f/6P/9H/+j//R//o//0f/6P/9H/+j//R//o//0f/6P/9H/+j//R//o//0f/6P/AP/o//0f/6P/9H/+j//R//o//0f/6P/9a//R//o//0");
      silentAudio.volume = 0.01;
      silentAudio.play().catch(err => {
        console.log("Silent audio still blocked:", err);
      });
    } catch (err) {
      console.error("Error in audio unlock attempt:", err);
    }
  };

  return (
    <div onClick={tryUnlockAudio} onTouchStart={tryUnlockAudio}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Pedidos</h2>
        <div className="flex items-center gap-3">
          {hasNewPedido && (
            <Button 
              onClick={handleAcknowledge}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium"
            >
              <BellOff className="mr-2 h-4 w-4" />
              Silenciar Alerta
            </Button>
          )}
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="bg-purple-dark hover:bg-purple-600 text-black font-medium"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      {hasNewPedido && (
        <NewOrderAlert 
          hasNewPedido={hasNewPedido} 
          onAcknowledge={handleAcknowledge}
          audioUrl="https://adegavm.shop/ring.mp3"
        />
      )}
      
      <PedidosTable 
        pedidos={pedidos}
        onVisualizarPedido={handleVisualizarPedido}
        onAtualizarStatus={handleAtualizarStatus}
        onExcluirPedido={handleExcluirPedido}
        formatDateTime={formatDateTime}
      />
      
      {showDetalhe && selectedPedido && (
        <PedidoDetalhe 
          pedidoId={selectedPedido}
          onClose={() => setShowDetalhe(false)}
          onDelete={handleRefresh}
          onStatusChange={handleAtualizarStatus}
        />
      )}
    </div>
  );
};

export default PedidosManager;
