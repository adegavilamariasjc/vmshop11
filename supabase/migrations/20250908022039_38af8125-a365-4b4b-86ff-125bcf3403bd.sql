-- Add deliverer field to pedidos table
ALTER TABLE public.pedidos 
ADD COLUMN entregador text;