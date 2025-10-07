-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Drop existing menu_items policies
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can delete menu items" ON public.menu_items;

-- Create new menu_items policies
CREATE POLICY "Anyone authenticated can view menu items"
ON public.menu_items
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert menu items"
ON public.menu_items
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update menu items"
ON public.menu_items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete menu items"
ON public.menu_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing bills policies
DROP POLICY IF EXISTS "Users can insert bills" ON public.bills;
DROP POLICY IF EXISTS "Users can view their own bills" ON public.bills;

-- Create new bills policies
CREATE POLICY "Authenticated users can insert bills"
ON public.bills
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own bills or admins can view all"
ON public.bills
FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- Drop existing bill_items policies
DROP POLICY IF EXISTS "Users can insert bill items" ON public.bill_items;
DROP POLICY IF EXISTS "Users can view bill items" ON public.bill_items;

-- Create new bill_items policies
CREATE POLICY "Users can insert bill items for their bills"
ON public.bill_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bills
    WHERE bills.id = bill_items.bill_id
    AND bills.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view their own bill items or admins can view all"
ON public.bill_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bills
    WHERE bills.id = bill_items.bill_id
    AND (bills.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Insert default admin role for first user (you'll need to update this with actual user ID)
-- This is commented out - you'll need to manually assign admin role to users via SQL
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');