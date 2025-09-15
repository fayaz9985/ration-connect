-- Create otp_codes table for storing OTPs
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  ration_card_no TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('apl', 'bpl', 'aay', 'priority')),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ration_stock table
CREATE TABLE public.ration_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'convert')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ration_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies
CREATE POLICY "Allow all operations on otp_codes" ON public.otp_codes FOR ALL USING (true);
CREATE POLICY "Allow all operations on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on shops" ON public.shops FOR ALL USING (true);
CREATE POLICY "Allow all operations on ration_stock" ON public.ration_stock FOR ALL USING (true);
CREATE POLICY "Allow all operations on transactions" ON public.transactions FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ration_stock_updated_at
  BEFORE UPDATE ON public.ration_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for shops
INSERT INTO public.shops (shop_name, owner_name, latitude, longitude) VALUES
  ('Central Ration Shop', 'Ramesh Kumar', 28.6139, 77.2090),
  ('North District Shop', 'Suresh Sharma', 28.7041, 77.1025),
  ('South Central Shop', 'Priya Singh', 28.5355, 77.3910);

-- Insert sample ration stock
INSERT INTO public.ration_stock (shop_id, item, quantity) 
SELECT s.id, item, quantity FROM public.shops s
CROSS JOIN (VALUES 
  ('Rice', 500),
  ('Wheat', 300),
  ('Sugar', 100),
  ('Oil', 50)
) AS items(item, quantity);