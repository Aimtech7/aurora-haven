-- Fix function search path security issue
CREATE OR REPLACE FUNCTION delete_expired_reports()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.reports WHERE expires_at < now();
END;
$$;