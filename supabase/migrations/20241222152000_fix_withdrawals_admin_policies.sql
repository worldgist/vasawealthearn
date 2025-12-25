-- Fix withdrawals admin policies to allow all authenticated users (for admin purposes)
-- Drop existing admin policies
DROP POLICY IF EXISTS "withdrawals_select_admin" ON public.withdrawals;
DROP POLICY IF EXISTS "withdrawals_update_admin" ON public.withdrawals;

-- Create new admin policies that allow all authenticated users
CREATE POLICY "withdrawals_select_all"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "withdrawals_update_all"
  ON public.withdrawals FOR UPDATE
  USING (auth.uid() IS NOT NULL);




