-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create reports table for anonymous incident reporting
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_of_abuse TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '48 hours'
);

-- Create files table for evidence uploads with auto-delete
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '48 hours'
);

-- Create resources table for knowledge center articles
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table for support directory
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to delete expired reports
CREATE OR REPLACE FUNCTION delete_expired_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM public.reports WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables (fully public access for anonymous reporting)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access to all tables
CREATE POLICY "Anyone can insert reports" ON public.reports FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "No one can read reports" ON public.reports FOR SELECT TO anon USING (false);

CREATE POLICY "Anyone can insert files" ON public.files FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "No one can read files" ON public.files FOR SELECT TO anon USING (false);

CREATE POLICY "Anyone can read resources" ON public.resources FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can read services" ON public.services FOR SELECT TO anon USING (true);

-- Insert sample resources
INSERT INTO public.resources (title, content, category) VALUES
  ('Understanding Digital Harassment', 'Digital harassment includes unwanted contact, threatening messages, sharing private information without consent, and creating fake profiles to impersonate or harass someone. Recognize the signs and know that you are not alone.', 'harassment'),
  ('Protecting Your Online Privacy', 'Secure your accounts with strong passwords, enable two-factor authentication, review privacy settings on all social media platforms, and be cautious about what personal information you share online.', 'privacy'),
  ('What is Cyberstalking?', 'Cyberstalking is the use of technology to repeatedly harass or threaten someone. This can include monitoring your online activity, tracking your location, or sending threatening messages. Document everything and seek help.', 'stalking'),
  ('Your Legal Rights', 'In many regions, digital violence is recognized as a crime. You have the right to report incidents to law enforcement, seek restraining orders, and access legal support. Contact local authorities or legal aid organizations.', 'legal'),
  ('Account Security Best Practices', 'Change passwords immediately if compromised, log out of all sessions, check connected apps and devices, enable login alerts, and use unique passwords for each account. Consider using a password manager.', 'security');

-- Insert sample support services
INSERT INTO public.services (organization, location, phone, website, description) VALUES
  ('National Domestic Violence Hotline', 'United States', '1-800-799-7233', 'https://www.thehotline.org', '24/7 support for victims of domestic violence and abuse'),
  ('Cyber Civil Rights Initiative', 'Online', '1-844-878-2274', 'https://www.cybercivilrights.org', 'Support for victims of nonconsensual pornography and online abuse'),
  ('RAINN (Rape, Abuse & Incest National Network)', 'United States', '1-800-656-4673', 'https://www.rainn.org', 'Support for survivors of sexual violence'),
  ('Women''s Aid', 'United Kingdom', '0808 2000 247', 'https://www.womensaid.org.uk', 'Support for women experiencing domestic abuse'),
  ('Crisis Text Line', 'United States', 'Text HOME to 741741', 'https://www.crisistextline.org', 'Free 24/7 text-based crisis support');