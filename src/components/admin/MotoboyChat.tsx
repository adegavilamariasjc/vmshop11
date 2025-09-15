import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Send, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ChatMessage {
  id: string;
  sender_type: 'system' | 'motoboy';
  message_text: string;
  created_at: string;
}

interface MotoboyPedido {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_endereco: string;
  cliente_bairro: string;
  cliente_whatsapp: string;
  status: string;
  total: number;
  taxa_entrega: number;
}

interface MotoboyChatProps {
  pedido: MotoboyPedido;
  onStatusChange: (pedidoId: string, newStatus: string) => void;
}

const MotoboyChat: React.FC<MotoboyChatProps> = ({ pedido, onStatusChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadChatMessages();
    subscribeToMessages();
    
    // Automatically start conversation when pedido status changes
    if (pedido.status === 'pronto') {
      sendSystemMessage('🚀 Pedido pronto para entrega! Por favor, confirme que pegou o pedido e está a caminho.');
    }
  }, [pedido.id, pedido.status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('motoboy_chat_messages')
        .select('*')
        .eq('pedido_id', pedido.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      // Type assertion to handle the database type mismatch
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'system' | 'motoboy'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat_${pedido.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'motoboy_chat_messages',
          filter: `pedido_id=eq.${pedido.id}`
        },
        (payload) => {
          const newMsg = {
            ...payload.new,
            sender_type: payload.new.sender_type as 'system' | 'motoboy'
          } as ChatMessage;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendSystemMessage = async (messageText: string) => {
    const { error } = await supabase
      .from('motoboy_chat_messages')
      .insert({
        pedido_id: pedido.id,
        sender_type: 'system',
        message_text: messageText
      });

    if (error) {
      console.error('Error sending system message:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('motoboy_chat_messages')
      .insert({
        pedido_id: pedido.id,
        sender_type: 'motoboy',
        message_text: newMessage
      });

    if (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setNewMessage('');
    
    // System responses based on message content
    setTimeout(() => {
      if (newMessage.toLowerCase().includes('peguei') || newMessage.toLowerCase().includes('saindo')) {
        onStatusChange(pedido.id, 'em_deslocamento');
        sendSystemMessage('✅ Perfeito! Status alterado para "Em deslocamento". Ao chegar no destino e entregar o pedido, envie uma foto do comprovante de entrega.');
      } else if (newMessage.toLowerCase().includes('entregue') || newMessage.toLowerCase().includes('entreguei')) {
        sendSystemMessage('📸 Ótimo! Por favor, envie uma foto do comprovante de entrega para finalizar o pedido.');
      }
    }, 1000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie apenas imagens",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Save comprovante
        const { error } = await supabase
          .from('pedido_comprovantes')
          .insert({
            pedido_id: pedido.id,
            image_url: base64,
            image_analysis: { uploaded_by: 'motoboy', timestamp: new Date().toISOString() }
          });

        if (error) {
          throw error;
        }

        // Send confirmation message
        await supabase
          .from('motoboy_chat_messages')
          .insert({
            pedido_id: pedido.id,
            sender_type: 'motoboy',
            message_text: '📸 Comprovante de entrega enviado'
          });

        // Change status to delivered
        onStatusChange(pedido.id, 'entregue');
        
        // System confirmation
        setTimeout(() => {
          sendSystemMessage('🎉 Comprovante recebido e analisado! Pedido finalizado com sucesso. Obrigado pela entrega!');
        }, 1000);

        toast({
          title: "Comprovante enviado!",
          description: "Pedido finalizado com sucesso",
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro no upload",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500';
      case 'aceito': return 'bg-blue-500';
      case 'preparando': return 'bg-orange-500';
      case 'pronto': return 'bg-green-500';
      case 'em_deslocamento': return 'bg-purple-500';
      case 'entregue': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aceito': return 'Aceito';
      case 'preparando': return 'Em Produção';
      case 'pronto': return 'Pronto para Entrega';
      case 'em_deslocamento': return 'Em Deslocamento';
      case 'entregue': return 'Entregue';
      default: return status;
    }
  };

  return (
    <Card className="h-full bg-black/80 border-purple-dark">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-bold">Pedido #{pedido.codigo_pedido}</h3>
            <Badge className={`${getStatusColor(pedido.status)} text-white`}>
              {getStatusText(pedido.status)}
            </Badge>
          </div>
          <div className="text-sm text-gray-300">
            <p><strong>{pedido.cliente_nome}</strong></p>
            <p>{pedido.cliente_endereco} - {pedido.cliente_bairro}</p>
            <p>Total: R$ {pedido.total.toFixed(2)} | Taxa: R$ {pedido.taxa_entrega.toFixed(2)}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'motoboy' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender_type === 'motoboy'
                    ? 'bg-purple-dark text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="text-sm">{message.message_text}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-gray-800 border-gray-600 text-white"
            disabled={pedido.status === 'entregue'}
          />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || pedido.status === 'entregue'}
            className="bg-green-600 hover:bg-green-700"
          >
            {uploading ? <Upload className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </Button>
          
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || pedido.status === 'entregue'}
            className="bg-purple-dark hover:bg-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MotoboyChat;