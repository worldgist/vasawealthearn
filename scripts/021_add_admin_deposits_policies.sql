-- Add admin policies for deposits table
-- Allow admins to view all deposits
CREATE POLICY "deposits_select_admin"
  ON public.deposits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- Allow admins to update all deposits
CREATE POLICY "deposits_update_admin"
  ON public.deposits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- Add admin policies for transactions table
-- Allow admins to view all transactions
CREATE POLICY "transactions_select_admin"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- Allow admins to update all transactions
CREATE POLICY "transactions_update_admin"
  ON public.transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );


