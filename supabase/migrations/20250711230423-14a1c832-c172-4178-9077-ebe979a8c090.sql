-- Enable realtime for pedidos table
ALTER TABLE public.pedidos REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;