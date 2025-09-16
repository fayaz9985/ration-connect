-- Add family_members column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN family_members INTEGER NOT NULL DEFAULT 4;

-- Create rice_claims table to track monthly rice claims
CREATE TABLE public.rice_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  quantity_kg INTEGER NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('cash_on_delivery', 'pay_now')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'out_for_delivery', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rice_claims table
ALTER TABLE public.rice_claims ENABLE ROW LEVEL SECURITY;

-- Create policy for rice_claims
CREATE POLICY "Allow all operations on rice_claims" 
ON public.rice_claims 
FOR ALL 
USING (true);

-- Add trigger for rice_claims updated_at
CREATE TRIGGER update_rice_claims_updated_at
BEFORE UPDATE ON public.rice_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 50 ration shops across Telangana
-- 20 shops in Hyderabad
INSERT INTO public.shops (shop_name, owner_name, latitude, longitude) VALUES
('Telangana Ration Shop - Secunderabad', 'Rajesh Kumar', 17.4399, 78.4983),
('Hyderabad Central Ration Depot', 'Srinivas Rao', 17.3850, 78.4867),
('Banjara Hills Ration Center', 'Madhavi Reddy', 17.4126, 78.4482),
('Jubilee Hills PDS Shop', 'Venkat Reddy', 17.4239, 78.4738),
('Kondapur Ration Store', 'Lakshmi Devi', 17.4615, 78.3657),
('Gachibowli Govt Ration Shop', 'Ramesh Babu', 17.4400, 78.3489),
('Kukatpally Ration Depot', 'Suresh Kumar', 17.4844, 78.4172),
('Miyapur PDS Center', 'Anitha Sharma', 17.5049, 78.3434),
('Begumpet Ration Shop', 'Narasimha Rao', 17.4504, 78.4717),
('Ameerpet Govt Store', 'Priya Kumari', 17.4370, 78.4482),
('L.B. Nagar Ration Center', 'Krishna Murthy', 17.3496, 78.5503),
('Dilsukhnagar PDS Shop', 'Padma Reddy', 17.3688, 78.5249),
('Uppal Ration Depot', 'Bharath Kumar', 17.4062, 78.5562),
('Malakpet Govt Ration Shop', 'Saritha Devi', 17.4011, 78.4897),
('Charminar Area Ration Store', 'Abdul Rahman', 17.3616, 78.4747),
('Mehdipatnam PDS Center', 'Vijaya Lakshmi', 17.3931, 78.4378),
('Tolichowki Ration Shop', 'Ramana Reddy', 17.3932, 78.4017),
('Shamshabad Ration Depot', 'Govind Rao', 17.2403, 78.4294),
('Nizampet Govt Store', 'Sushma Reddy', 17.5137, 78.3912),
('Kompally PDS Shop', 'Ravi Teja', 17.5449, 78.4908);

-- 10 shops in Warangal
INSERT INTO public.shops (shop_name, owner_name, latitude, longitude) VALUES
('Warangal Central Ration Shop', 'Chandrasekhar Rao', 18.0011, 79.5881),
('Kazipet Ration Depot', 'Manjula Devi', 18.0142, 79.4564),
('Subedari Govt Ration Store', 'Bhaskar Reddy', 17.9689, 79.5941),
('Hanamkonda PDS Center', 'Laxman Kumar', 18.0142, 79.5645),
('Warangal Urban Ration Shop', 'Shanti Kumari', 18.0087, 79.5320),
('Jammikunta Ration Depot', 'Naresh Babu', 18.1167, 79.4833),
('Mahabubabad PDS Shop', 'Kamala Devi', 17.5984, 80.0088),
('Bhupalpally Govt Store', 'Sudhakar Reddy', 18.4386, 79.8897),
('Mulugu Ration Center', 'Prasad Kumar', 18.1924, 79.9289),
('Jangaon Ration Shop', 'Hymavathi Reddy', 17.7230, 79.1813);

-- 20 shops in other Telangana districts
INSERT INTO public.shops (shop_name, owner_name, latitude, longitude) VALUES
('Nizamabad Central Ration Shop', 'Satish Reddy', 18.6725, 78.0941),
('Karimnagar PDS Depot', 'Kavitha Sharma', 18.4386, 79.1288),
('Khammam Govt Ration Store', 'Rajesh Naik', 17.2473, 80.1514),
('Mahbubnagar Ration Center', 'Sunitha Reddy', 16.7393, 77.9974),
('Rangareddy District Store', 'Mohan Krishna', 17.4416, 78.3984),
('Medak Ration Depot', 'Swapna Kumari', 18.0488, 78.2747),
('Nalgonda PDS Shop', 'Sai Kumar', 17.0542, 79.2669),
('Adilabad Govt Ration Shop', 'Ramulu Naidu', 19.6640, 78.5320),
('Sangareddy Ration Center', 'Anuradha Devi', 17.6186, 78.0797),
('Siddipet PDS Store', 'Balakrishna Reddy', 18.1018, 78.8484),
('Peddapalli Ration Shop', 'Kiran Kumar', 18.6161, 79.3737),
('Jagtial Govt Store', 'Lalitha Kumari', 18.7898, 78.9165),
('Rajanna Sircilla Depot', 'Chandra Mohan', 18.3969, 78.8155),
('Mancherial Ration Center', 'Padmavathi Reddy', 18.8730, 79.4579),
('Jayashankar Bhoopalpally PDS', 'Venkateswarlu', 18.0142, 79.6441),
('Yadadri Bhuvanagiri Store', 'Sreelatha Devi', 17.3240, 78.8445),
('Jogulamba Gadwal Shop', 'Nagaraju Reddy', 16.2093, 77.7829),
('Wanaparthy Ration Depot', 'Mallikarjun Reddy', 16.3596, 78.0593),
('Nagarkurnool PDS Center', 'Bhavani Sharma', 16.4922, 78.3137),
('Vikarabad Govt Ration Shop', 'Srinath Kumar', 17.3370, 77.9047);

-- Add sample stock for all shops
INSERT INTO public.ration_stock (shop_id, item, quantity)
SELECT s.id, 'Rice', 500 + (RANDOM() * 1000)::INTEGER
FROM public.shops s;

INSERT INTO public.ration_stock (shop_id, item, quantity)  
SELECT s.id, 'Wheat', 300 + (RANDOM() * 500)::INTEGER
FROM public.shops s;

INSERT INTO public.ration_stock (shop_id, item, quantity)
SELECT s.id, 'Sugar', 100 + (RANDOM() * 200)::INTEGER  
FROM public.shops s;