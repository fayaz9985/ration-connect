-- Update delivery_method check constraint to allow 'sold' and 'converted'
ALTER TABLE public.rice_claims DROP CONSTRAINT IF EXISTS rice_claims_delivery_method_check;
ALTER TABLE public.rice_claims ADD CONSTRAINT rice_claims_delivery_method_check 
  CHECK (delivery_method = ANY (ARRAY['cash_on_delivery'::text, 'pay_now'::text, 'sold'::text, 'converted'::text]));

-- Update status check constraint to allow 'sold' and 'converted'
ALTER TABLE public.rice_claims DROP CONSTRAINT IF EXISTS rice_claims_status_check;
ALTER TABLE public.rice_claims ADD CONSTRAINT rice_claims_status_check 
  CHECK (status = ANY (ARRAY['confirmed'::text, 'out_for_delivery'::text, 'delivered'::text, 'sold'::text, 'converted'::text]));