-- Add delivery tracking fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN delivery_status TEXT DEFAULT 'confirmed',
ADD COLUMN estimated_delivery_date DATE,
ADD COLUMN actual_delivery_date DATE,
ADD COLUMN delivery_address TEXT,
ADD COLUMN delivery_notes TEXT;

-- Add check constraint for delivery status
ALTER TABLE public.transactions 
ADD CONSTRAINT check_delivery_status 
CHECK (delivery_status IN ('confirmed', 'preparing', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'));

-- Enable realtime for transactions table
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- Add to realtime publication (if not already added)
-- Note: This might already exist, so we use IF NOT EXISTS equivalent
DO $$ 
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, do nothing
            NULL;
    END;
END $$;