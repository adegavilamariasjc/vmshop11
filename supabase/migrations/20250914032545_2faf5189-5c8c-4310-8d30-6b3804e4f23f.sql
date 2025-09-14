-- Enable realtime for pedidos table to ensure telegram updates sync with frontend
ALTER TABLE public.pedidos REPLICA IDENTITY FULL;

-- Add pedidos table to realtime publication if not already added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'pedidos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
    END IF;
END $$;