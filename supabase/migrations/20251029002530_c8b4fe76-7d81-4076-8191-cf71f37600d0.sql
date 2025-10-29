-- Drop the existing restrictive policy for motoboys
DROP POLICY IF EXISTS "Motoboys can view assigned pedidos" ON public.pedidos;

-- Create new policy: Motoboys can view all delivery orders (excluding BALCAO)
CREATE POLICY "Motoboys can view all delivery orders"
ON public.pedidos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'motoboy'::app_role) 
  AND cliente_bairro <> 'BALCAO'
);

-- Update the policy for motoboys to update orders
DROP POLICY IF EXISTS "Motoboys can update assigned pedidos status" ON public.pedidos;

CREATE POLICY "Motoboys can update delivery orders"
ON public.pedidos
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'motoboy'::app_role) 
  AND cliente_bairro <> 'BALCAO'
)
WITH CHECK (
  has_role(auth.uid(), 'motoboy'::app_role) 
  AND cliente_bairro <> 'BALCAO'
);