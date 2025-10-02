-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert menu items"
  ON public.menu_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update menu items"
  ON public.menu_items FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete menu items"
  ON public.menu_items FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_phone TEXT,
  room_number TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bills"
  ON public.bills FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert bills"
  ON public.bills FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create bill_items table
CREATE TABLE public.bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bill items"
  ON public.bill_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert bill items"
  ON public.bill_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Insert some pre-seeded menu items
INSERT INTO public.menu_items (name, description, price, category, available) VALUES
  ('Masala Dosa', 'Crispy crepe filled with spiced potato', 80.00, 'Breakfast', true),
  ('Idli Sambar', 'Steamed rice cakes with lentil curry', 60.00, 'Breakfast', true),
  ('Butter Chicken', 'Tender chicken in creamy tomato sauce', 280.00, 'Main Course', true),
  ('Paneer Tikka', 'Grilled cottage cheese with spices', 220.00, 'Main Course', true),
  ('Dal Makhani', 'Creamy black lentils', 180.00, 'Main Course', true),
  ('Biryani', 'Fragrant rice with spiced meat', 320.00, 'Main Course', true),
  ('Naan', 'Traditional Indian bread', 40.00, 'Breads', true),
  ('Garlic Naan', 'Naan with garlic and butter', 50.00, 'Breads', true),
  ('Raita', 'Yogurt with cucumber and spices', 60.00, 'Sides', true),
  ('Green Salad', 'Fresh seasonal vegetables', 80.00, 'Sides', true),
  ('Gulab Jamun', 'Sweet milk dumplings in syrup', 80.00, 'Desserts', true),
  ('Rasmalai', 'Cottage cheese in sweetened milk', 100.00, 'Desserts', true),
  ('Mango Lassi', 'Sweet yogurt drink with mango', 80.00, 'Beverages', true),
  ('Masala Chai', 'Spiced Indian tea', 40.00, 'Beverages', true),
  ('Fresh Lime Soda', 'Refreshing citrus drink', 60.00, 'Beverages', true);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for menu_items updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();