-- Drop the old view and recreate without security definer
DROP VIEW IF EXISTS public.admin_statistics;

-- Create a regular view (not security definer)
CREATE VIEW public.admin_statistics AS
SELECT
  (SELECT COUNT(*) FROM public.reports) AS total_reports,
  (SELECT COUNT(*) FROM public.files) AS total_evidence_files,
  (SELECT COUNT(*) FROM public.resources) AS total_resources,
  (SELECT COUNT(*) FROM public.services) AS total_services,
  (SELECT COUNT(*) FROM public.reports WHERE created_at >= NOW() - INTERVAL '7 days') AS reports_last_week,
  (SELECT COUNT(*) FROM public.reports WHERE created_at >= NOW() - INTERVAL '30 days') AS reports_last_month;