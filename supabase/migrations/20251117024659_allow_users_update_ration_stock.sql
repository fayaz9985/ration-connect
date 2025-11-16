-- Allow authenticated users to insert and update ration_stock
-- This is needed for sell operations where users add stock back to shops

-- Add policy for authenticated users to insert ration_stock
CREATE POLICY "Authenticated users can insert ration_stock"
ON public.ration_stock
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Add policy for authenticated users to update ration_stock
CREATE POLICY "Authenticated users can update ration_stock"
ON public.ration_stock
FOR UPDATE
TO authenticated, anon
USING (true);

