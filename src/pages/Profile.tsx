import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, Palette, Globe, LogOut, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { EmergencyButton } from "@/components/EmergencyButton";

interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface Preferences {
  language: string;
  theme: string;
  email_notifications: boolean;
  report_status_notifications: boolean;
  resource_updates: boolean;
  privacy_level: string;
}

interface Report {
  id: string;
  tracking_id: string;
  type_of_abuse: string;
  status: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { t, language, setLanguage, refreshTranslations } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  // Form states
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      loadUserData();
    }
  }, [user, authLoading, navigate]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setDisplayName(profileData.display_name || "");

      // Load preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (prefsError) throw prefsError;
      setPreferences(prefsData);

      // Sync preferences with contexts
      if (prefsData.language !== language) {
        setLanguage(prefsData.language as "en" | "sw");
      }
      if (prefsData.theme !== theme) {
        setTheme(prefsData.theme as "light" | "dark" | "system");
      }

      // Load reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("id, tracking_id, type_of_abuse, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);
    } catch (error: any) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
      setProfile({ ...profile, display_name: displayName });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (updates: Partial<Preferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences({ ...preferences!, ...updates });
      
      // Sync with contexts
      if (updates.language) {
        setLanguage(updates.language as "en" | "sw");
        await refreshTranslations();
      }
      if (updates.theme) {
        setTheme(updates.theme as "light" | "dark" | "system");
      }

      toast.success("Preferences saved");
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to save preferences");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete user data (profile and preferences will cascade)
      const { error } = await supabase.auth.admin.deleteUser(user!.id);
      if (error) throw error;
      
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile || !preferences) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Palette className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Shield className="w-4 h-4 mr-2" />
              My Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email || ""} disabled />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back.
                </p>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Appearance & Language</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Language
                    </Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => handleSavePreferences({ language: value })}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Kiswahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="theme">
                      <Palette className="w-4 h-4 inline mr-2" />
                      Theme
                    </Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => handleSavePreferences({ theme: value })}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="privacy">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Privacy Level
                    </Label>
                    <Select
                      value={preferences.privacy_level}
                      onValueChange={(value) => handleSavePreferences({ privacy_level: value })}
                    >
                      <SelectTrigger id="privacy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal - Maximum anonymity</SelectItem>
                        <SelectItem value="standard">Standard - Balanced</SelectItem>
                        <SelectItem value="maximum">Maximum - Full features</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive general updates via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.email_notifications}
                      onCheckedChange={(checked) =>
                        handleSavePreferences({ email_notifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="report-notifications">Report Status Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when your report status changes
                      </p>
                    </div>
                    <Switch
                      id="report-notifications"
                      checked={preferences.report_status_notifications}
                      onCheckedChange={(checked) =>
                        handleSavePreferences({ report_status_notifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="resource-updates">Resource Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about new safety resources
                      </p>
                    </div>
                    <Switch
                      id="resource-updates"
                      checked={preferences.resource_updates}
                      onCheckedChange={(checked) =>
                        handleSavePreferences({ resource_updates: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Reports</h2>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't submitted any reports yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-sm text-primary mb-1">
                            {report.tracking_id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {report.type_of_abuse}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : report.status === "under_review"
                                ? "bg-blue-100 text-blue-800"
                                : report.status === "requires_action"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {report.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <EmergencyButton />
    </div>
  );
};

export default Profile;
