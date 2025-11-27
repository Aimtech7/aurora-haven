-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create translations table
CREATE TABLE public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  en TEXT NOT NULL,
  sw TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Public can read all translations
CREATE POLICY "Anyone can read translations"
ON public.translations FOR SELECT
USING (true);

-- Admins can manage translations
CREATE POLICY "Admins can insert translations"
ON public.translations FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update translations"
ON public.translations FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete translations"
ON public.translations FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial translations
INSERT INTO public.translations (key, en, sw, category) VALUES
-- Header/Navigation
('nav.home', 'Home', 'Nyumbani', 'navigation'),
('nav.report', 'Report', 'Ripoti', 'navigation'),
('nav.track', 'Track Report', 'Fuatilia Ripoti', 'navigation'),
('nav.resources', 'Resources', 'Rasilimali', 'navigation'),
('nav.chatbot', 'Chatbot', 'Chatbot', 'navigation'),
('nav.directory', 'Directory', 'Saraka', 'navigation'),
('emergency.button', 'Emergency Exit', 'Toka Haraka', 'common'),
('emergency.title', 'Emergency Exit', 'Toka Haraka', 'emergency'),
('emergency.message', 'You are being redirected to a safe website...', 'Unaelekezwa kwenye tovuti salama...', 'emergency'),

-- Home page
('home.title', 'Safe Space Digital Safety Platform', 'Jukwaa la Usalama wa Kidijitali', 'home'),
('home.subtitle', 'A confidential platform for reporting online gender-based violence and accessing support resources.', 'Jukwaa la siri kwa kuripoti unyanyasaji wa kijinsia mtandaoni na kupata rasilimali za msaada.', 'home'),
('home.report.title', 'Submit a Report', 'Wasilisha Ripoti', 'home'),
('home.report.desc', 'Confidentially report incidents of online harassment, abuse, or violence.', 'Ripoti matukio ya unyanyasaji, unyanyasaji, au udhalimu mtandaoni kwa siri.', 'home'),
('home.track.title', 'Track Your Report', 'Fuatilia Ripoti Yako', 'home'),
('home.track.desc', 'Check the status of your submitted report using your tracking ID.', 'Angalia hali ya ripoti yako kwa kutumia kitambulisho chako cha kufuatilia.', 'home'),
('home.resources.title', 'Safety Resources', 'Rasilimali za Usalama', 'home'),
('home.resources.desc', 'Access educational materials and guides on digital safety and well-being.', 'Pata nyenzo za elimu na miongozo kuhusu usalama wa kidijitali na ustawi.', 'home'),
('home.chatbot.title', 'AI Support Chat', 'Mazungumzo ya Msaada wa AI', 'home'),
('home.chatbot.desc', 'Get immediate support and guidance from our AI assistant.', 'Pata msaada na mwongozo wa haraka kutoka kwa msaidizi wetu wa AI.', 'home'),
('home.directory.title', 'Service Directory', 'Saraka ya Huduma', 'home'),
('home.directory.desc', 'Find local support services, hotlines, and organizations.', 'Tafuta huduma za msaada za ndani, simu za dharura, na mashirika.', 'home'),

-- Report page
('report.title', 'Submit a Report', 'Wasilisha Ripoti', 'report'),
('report.subtitle', 'Your report will be kept confidential and will automatically expire after 48 hours.', 'Ripoti yako itawekwa siri na itaisha kiotomatiki baada ya masaa 48.', 'report'),
('report.type.label', 'Type of Abuse', 'Aina ya Unyanyasaji', 'report'),
('report.type.placeholder', 'Select type of abuse', 'Chagua aina ya unyanyasaji', 'report'),
('report.type.harassment', 'Online Harassment', 'Unyanyasaji Mtandaoni', 'report'),
('report.type.stalking', 'Cyberstalking', 'Ufuatiliaji Mtandaoni', 'report'),
('report.type.doxxing', 'Doxxing', 'Kufichua Taarifa Binafsi', 'report'),
('report.type.imageAbuse', 'Non-consensual Image Sharing', 'Kushiriki Picha Bila Idhini', 'report'),
('report.type.threats', 'Threats of Violence', 'Vitisho vya Udhalimu', 'report'),
('report.type.other', 'Other', 'Nyingine', 'report'),
('report.description.label', 'Description', 'Maelezo', 'report'),
('report.description.placeholder', 'Describe what happened in as much detail as you feel comfortable sharing...', 'Eleza nini kilitokea kwa undani unaojiamini kushiriki...', 'report'),
('report.evidence.label', 'Evidence (Optional)', 'Ushahidi (Si Lazima)', 'report'),
('report.evidence.desc', 'Upload screenshots, messages, or other evidence. Max 5 files, 10MB each.', 'Pakia picha za skrini, ujumbe, au ushahidi mwingine. Juu zaidi ya faili 5, MB 10 kila moja.', 'report'),
('report.evidence.button', 'Choose Files', 'Chagua Faili', 'report'),
('report.submit', 'Submit Report', 'Wasilisha Ripoti', 'report'),
('report.submitting', 'Submitting...', 'Inawasilisha...', 'report'),
('report.success.title', 'Report Submitted Successfully', 'Ripoti Imewasilishwa', 'report'),
('report.success.save', 'Please save your tracking ID:', 'Tafadhali hifadhi kitambulisho chako cha kufuatilia:', 'report'),
('report.success.important', 'This is the only way to check your report status. We cannot recover it if lost.', 'Hii ndiyo njia pekee ya kuangalia hali ya ripoti yako. Hatuwezi kuirejesha ikiwa imepotea.', 'report'),
('report.success.copy', 'Copy ID', 'Nakili Kitambulisho', 'report'),
('report.success.download', 'Download Info', 'Pakua Taarifa', 'report'),
('report.success.track', 'Track Report Status', 'Fuatilia Hali ya Ripoti', 'report'),
('report.success.home', 'Return Home', 'Rudi Nyumbani', 'report'),
('report.error', 'Failed to submit report. Please try again.', 'Imeshindwa kuwasilisha ripoti. Tafadhali jaribu tena.', 'report'),

-- Track Report page
('track.title', 'Track Your Report', 'Fuatilia Ripoti Yako', 'track'),
('track.subtitle', 'Enter your tracking ID to check the status of your report', 'Weka kitambulisho chako cha kufuatilia ili kuangalia hali ya ripoti yako', 'track'),
('track.input.placeholder', 'Enter tracking ID (e.g., RPT-ABC12345)', 'Weka kitambulisho cha kufuatilia (k.m., RPT-ABC12345)', 'track'),
('track.button', 'Track Report', 'Fuatilia Ripoti', 'track'),
('track.notfound', 'Report not found. Please check your tracking ID.', 'Ripoti haipatikani. Tafadhali angalia kitambulisho chako cha kufuatilia.', 'track'),
('track.status.submitted', 'Submitted', 'Imewasilishwa', 'track'),
('track.status.under_review', 'Under Review', 'Inakaguliwa', 'track'),
('track.status.resolved', 'Resolved', 'Imetatuliwa', 'track'),
('track.status.requires_action', 'Requires Action', 'Inahitaji Hatua', 'track'),
('track.info.submitted', 'Your report has been received and is awaiting review.', 'Ripoti yako imepokelewa na inasubiri ukaguzi.', 'track'),
('track.info.under_review', 'An administrator is currently reviewing your report.', 'Msimamizi anakagua ripoti yako kwa sasa.', 'track'),
('track.info.resolved', 'Your report has been reviewed and resolved.', 'Ripoti yako imekaguliwa na kutatuliwa.', 'track'),
('track.info.requires_action', 'Additional information or action may be needed.', 'Taarifa au hatua za ziada zinaweza kuhitajika.', 'track'),
('track.submitted.date', 'Submitted', 'Imewasilishwa', 'track'),
('track.type', 'Type of Abuse', 'Aina ya Unyanyasaji', 'track'),
('track.support', 'Need additional support? Chat with our AI assistant', 'Unahitaji msaada zaidi? Zungumza na msaidizi wetu wa AI', 'track'),

-- Resources page
('resources.title', 'Safety Resources', 'Rasilimali za Usalama', 'resources'),
('resources.subtitle', 'Educational materials and guides to help you stay safe online', 'Nyenzo za elimu na miongozo ya kukusaidia kukaa salama mtandaoni', 'resources'),
('resources.search', 'Search resources...', 'Tafuta rasilimali...', 'resources'),
('resources.all', 'All Categories', 'Kategoria Zote', 'resources'),
('resources.safety', 'Digital Safety', 'Usalama wa Kidijitali', 'resources'),
('resources.legal', 'Legal Rights', 'Haki za Kisheria', 'resources'),
('resources.support', 'Mental Health Support', 'Msaada wa Afya ya Akili', 'resources'),
('resources.prevention', 'Prevention Tips', 'Vidokezo vya Uzuiaji', 'resources'),
('resources.notfound', 'No resources found matching your search.', 'Hakuna rasilimali zilizopatikana zinazofanana na utafutaji wako.', 'resources'),

-- Directory page
('directory.title', 'Support Services Directory', 'Saraka ya Huduma za Msaada', 'directory'),
('directory.subtitle', 'Find local organizations and services that can help', 'Tafuta mashirika na huduma za ndani zinazoweza kusaidia', 'directory'),
('directory.search', 'Search services...', 'Tafuta huduma...', 'directory'),
('directory.location', 'Location', 'Mahali', 'directory'),
('directory.phone', 'Phone', 'Simu', 'directory'),
('directory.website', 'Visit Website', 'Tembelea Tovuti', 'directory'),
('directory.notfound', 'No services found matching your search.', 'Hakuna huduma zilizopatikani zinazofanana na utafutaji wako.', 'directory'),

-- Chatbot page
('chatbot.title', 'AI Support Assistant', 'Msaidizi wa Msaada wa AI', 'chatbot'),
('chatbot.placeholder', 'Type your message...', 'Andika ujumbe wako...', 'chatbot'),
('chatbot.send', 'Send', 'Tuma', 'chatbot'),

-- Admin Dashboard
('admin.title', 'Admin Dashboard', 'Dashibodi ya Msimamizi', 'admin'),
('admin.stats', 'Statistics', 'Takwimu', 'admin'),
('admin.reports', 'Reports', 'Ripoti', 'admin'),
('admin.resources', 'Resources', 'Rasilimali', 'admin'),
('admin.services', 'Services', 'Huduma', 'admin'),
('admin.translations', 'Translations', 'Tafsiri', 'admin'),
('admin.logout', 'Logout', 'Ondoka', 'admin'),

-- Admin Login
('login.title', 'Admin Login', 'Kuingia kwa Msimamizi', 'admin'),
('login.email', 'Email', 'Barua pepe', 'admin'),
('login.password', 'Password', 'Nywila', 'admin'),
('login.button', 'Login', 'Ingia', 'admin'),
('login.error', 'Invalid credentials', 'Taarifa za kuingia si sahihi', 'admin'),

-- Common
('common.loading', 'Loading...', 'Inapakia...', 'common'),
('common.error', 'An error occurred', 'Hitilafu imetokea', 'common'),
('common.save', 'Save', 'Hifadhi', 'common'),
('common.cancel', 'Cancel', 'Ghairi', 'common'),
('common.delete', 'Delete', 'Futa', 'common'),
('common.edit', 'Edit', 'Hariri', 'common'),
('common.close', 'Close', 'Funga', 'common'),
('common.search', 'Search', 'Tafuta', 'common'),
('common.filter', 'Filter', 'Chuja', 'common');