-- Add tracking and status columns to reports table
ALTER TABLE public.reports 
ADD COLUMN tracking_id TEXT UNIQUE,
ADD COLUMN status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'resolved', 'requires_action')),
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN admin_notes TEXT;

-- Create function to generate tracking IDs
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql VOLATILE;

-- Create trigger function to auto-generate tracking ID
CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set tracking ID on insert
CREATE TRIGGER reports_tracking_id_trigger
BEFORE INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION set_tracking_id();

-- Create table for status change history
CREATE TABLE public.report_status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create trigger function to track status changes
CREATE OR REPLACE FUNCTION public.track_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.report_status_changes (report_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), 'Status updated');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track status changes
CREATE TRIGGER reports_status_change_trigger
AFTER UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION track_status_change();

-- Enable RLS on status changes table
ALTER TABLE public.report_status_changes ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view all status changes
CREATE POLICY "Admins can view all status changes"
ON public.report_status_changes FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS: Admins can insert status changes
CREATE POLICY "Admins can insert status changes"
ON public.report_status_changes FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create security definer function for public status lookup
CREATE OR REPLACE FUNCTION public.get_report_status(tracking_id_input TEXT)
RETURNS TABLE (
  id UUID,
  tracking_id TEXT,
  type_of_abuse TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, tracking_id, type_of_abuse, status, created_at
  FROM public.reports
  WHERE tracking_id = tracking_id_input;
$$;

-- RLS: Allow admins to view all reports
CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS: Allow admins to update reports
CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Drop and recreate admin_statistics view with status breakdown
DROP VIEW IF EXISTS public.admin_statistics;

CREATE VIEW public.admin_statistics AS
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