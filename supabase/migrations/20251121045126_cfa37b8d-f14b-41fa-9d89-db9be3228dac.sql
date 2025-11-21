-- Fix security issues: Add search_path to all functions

-- Fix generate_tracking_id function
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TEXT 
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'RPT-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Fix set_tracking_id trigger function
CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix track_status_change trigger function
CREATE OR REPLACE FUNCTION public.track_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.report_status_changes (report_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), 'Status updated');
  END IF;
  RETURN NEW;
END;
$$;

-- Convert admin_statistics view to a function to avoid security definer view issue
DROP VIEW IF EXISTS public.admin_statistics;

CREATE OR REPLACE FUNCTION public.get_admin_statistics()
RETURNS TABLE (
  total_reports BIGINT,
  reports_last_week BIGINT,
  reports_last_month BIGINT,
  reports_submitted BIGINT,
  reports_under_review BIGINT,
  reports_resolved BIGINT,
  reports_requires_action BIGINT,
  total_services BIGINT,
  total_resources BIGINT,
  total_evidence_files BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(DISTINCT r.id) as total_reports,
    COUNT(DISTINCT CASE WHEN r.created_at >= NOW() - INTERVAL '7 days' THEN r.id END) as reports_last_week,
    COUNT(DISTINCT CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN r.id END) as reports_last_month,
    COUNT(DISTINCT CASE WHEN r.status = 'submitted' THEN r.id END) as reports_submitted,
    COUNT(DISTINCT CASE WHEN r.status = 'under_review' THEN r.id END) as reports_under_review,
    COUNT(DISTINCT CASE WHEN r.status = 'resolved' THEN r.id END) as reports_resolved,
    COUNT(DISTINCT CASE WHEN r.status = 'requires_action' THEN r.id END) as reports_requires_action,
    COUNT(DISTINCT s.id) as total_services,
    COUNT(DISTINCT res.id) as total_resources,
    COUNT(DISTINCT f.id) as total_evidence_files
  FROM public.reports r
  LEFT JOIN public.services s ON true
  LEFT JOIN public.resources res ON true
  LEFT JOIN public.files f ON true;
$$;