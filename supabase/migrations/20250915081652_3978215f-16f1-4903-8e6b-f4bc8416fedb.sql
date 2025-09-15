-- Create tables for motoboy chat system and receipt management

-- Table for chat messages between system and motoboys
CREATE TABLE public.motoboy_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('system', 'motoboy')),
  message_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for receipt photos and verification
CREATE TABLE public.pedido_comprovantes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_analysis jsonb,
  verified boolean DEFAULT false,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  verified_at timestamp with time zone
);

-- Table for motoboy payments and reports
CREATE TABLE public.motoboy_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  motoboy_name text NOT NULL,
  delivery_fee numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.motoboy_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_comprovantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoboy_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat messages
CREATE POLICY "Allow public access for motoboy_chat_messages" 
ON public.motoboy_chat_messages 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- RLS policies for comprovantes
CREATE POLICY "Allow public access for pedido_comprovantes" 
ON public.pedido_comprovantes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- RLS policies for payments
CREATE POLICY "Allow public access for motoboy_payments" 
ON public.motoboy_payments 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add realtime to new tables
ALTER TABLE public.motoboy_chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.pedido_comprovantes REPLICA IDENTITY FULL;
ALTER TABLE public.motoboy_payments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.motoboy_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedido_comprovantes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.motoboy_payments;