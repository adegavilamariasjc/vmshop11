-- Fix security issues: Enable RLS on tables that need it
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for pedidos (allow public access for the restaurant system)
CREATE POLICY "Allow public access for pedidos" 
ON public.pedidos 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for page_visits (allow insert for anonymous tracking, select for authenticated)
CREATE POLICY "Allow insert for anonymous users" 
ON public.page_visits 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow read for authenticated users" 
ON public.page_visits 
FOR SELECT 
USING (true);

-- Create policies for system_settings (allow public read, authenticated write)
CREATE POLICY "Allow public read for system_settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage system_settings" 
ON public.system_settings 
FOR ALL 
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);