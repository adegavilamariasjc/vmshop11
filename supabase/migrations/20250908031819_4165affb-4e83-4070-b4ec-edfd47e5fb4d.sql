-- Fix function search path issue
CREATE OR REPLACE FUNCTION public.migrate_initial_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  category_id INTEGER;
BEGIN
  -- Insert ice flavors
  INSERT INTO public.ice_flavors (name) VALUES
  ('Coco'), ('Melancia'), ('Maracujá'), ('Maçã Verde'), ('Morango'), ('Gelo de Água')
  ON CONFLICT (name) DO NOTHING;

  -- Insert alcohol options
  INSERT INTO public.alcohol_options (name, extra_cost) VALUES
  ('Vodka', 0),
  ('Pinga', 0),
  ('Jurupinga', 10),
  ('Whisky', 10),
  ('Gin', 10),
  ('Saquê', 10)
  ON CONFLICT (name) DO NOTHING;

  -- Insert initial neighborhood (bairro)
  INSERT INTO public.bairros (nome, taxa) VALUES
  ('Selecione Um Bairro', 0)
  ON CONFLICT (nome) DO NOTHING;

END;
$function$;