import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  FileText,
  BookOpen,
  Phone,
  LogOut,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminReportsTab } from "@/components/AdminReportsTab";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Statistics {
  total_reports: number;
  total_evidence_files: number;
  total_resources: number;
  total_services: number;
  reports_last_week: number;
  reports_last_month: number;
  reports_submitted: number;
  reports_under_review: number;
  reports_resolved: number;
  reports_requires_action: number;
}

interface Resource {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface Service {
  id: string;
  organization: string;
  location: string;
  phone: string;
  website: string | null;
  description: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Resource form state
  const [resourceDialog, setResourceDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    content: "",
    category: "",
  });

  // Service form state
  const [serviceDialog, setServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    organization: "",
    location: "",
    phone: "",
    website: "",
    description: "",
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      toast.error("Unauthorized access");
      navigate("/admin/login");
    }
  };

  const loadData = async () => {
    try {
      // Load statistics using function instead of view
      const { data: stats, error: statsError } = await supabase
        .rpc("get_admin_statistics")
        .single();
      
      if (statsError) throw statsError;
      if (stats) setStatistics(stats);

      // Load resources
      const { data: resourcesData } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (resourcesData) setResources(resourcesData);

      // Load services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (servicesData) setServices(servicesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const handleSaveResource = async () => {
    try {
      if (editingResource) {
        const { error } = await supabase
          .from("resources")
          .update(resourceForm)
          .eq("id", editingResource.id);
        
        if (error) throw error;
        toast.success("Resource updated successfully");
      } else {
        const { error } = await supabase
          .from("resources")
          .insert(resourceForm);
        
        if (error) throw error;
        toast.success("Resource created successfully");
      }
      
      setResourceDialog(false);
      setEditingResource(null);
      setResourceForm({ title: "", content: "", category: "" });
      loadData();
    } catch (error: any) {
      console.error("Error saving resource:", error);
      toast.error(error.message || "Failed to save resource");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Resource deleted successfully");
      loadData();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      toast.error(error.message || "Failed to delete resource");
    }
  };

  const handleSaveService = async () => {
    try {
      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(serviceForm)
          .eq("id", editingService.id);
        
        if (error) throw error;
        toast.success("Service updated successfully");
      } else {
        const { error } = await supabase
          .from("services")
          .insert(serviceForm);
        
        if (error) throw error;
        toast.success("Service created successfully");
      }
      
      setServiceDialog(false);
      setEditingService(null);
      setServiceForm({
        organization: "",
        location: "",
        phone: "",
        website: "",
        description: "",
      });
      loadData();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.error(error.message || "Failed to save service");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Service deleted successfully");
      loadData();
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast.error(error.message || "Failed to delete service");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <Shield className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Survivor Hub Management</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Statistics */}
        <section className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{statistics?.total_reports || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Week</p>
                <p className="text-2xl font-bold">{statistics?.reports_last_week || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resources</p>
                <p className="text-2xl font-bold">{statistics?.total_resources || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Services</p>
                <p className="text-2xl font-bold">{statistics?.total_services || 0}</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Management Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <AdminReportsTab />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Resources</h2>
              <Dialog open={resourceDialog} onOpenChange={setResourceDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingResource(null);
                    setResourceForm({ title: "", content: "", category: "" });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingResource ? "Edit Resource" : "Add New Resource"}
                    </DialogTitle>
                    <DialogDescription>
                      Create educational content for survivors
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={resourceForm.title}
                        onChange={(e) =>
                          setResourceForm({ ...resourceForm, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={resourceForm.category}
                        onValueChange={(value) =>
                          setResourceForm({ ...resourceForm, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Digital Safety">Digital Safety</SelectItem>
                          <SelectItem value="Legal Rights">Legal Rights</SelectItem>
                          <SelectItem value="Cyberstalking">Cyberstalking</SelectItem>
                          <SelectItem value="Privacy">Privacy</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        rows={8}
                        value={resourceForm.content}
                        onChange={(e) =>
                          setResourceForm({ ...resourceForm, content: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveResource}>Save Resource</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {resources.map((resource) => (
                <Card key={resource.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{resource.title}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {resource.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.content}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingResource(resource);
                          setResourceForm({
                            title: resource.title,
                            content: resource.content,
                            category: resource.category,
                          });
                          setResourceDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Services</h2>
              <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingService(null);
                    setServiceForm({
                      organization: "",
                      location: "",
                      phone: "",
                      website: "",
                      description: "",
                    });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? "Edit Service" : "Add New Service"}
                    </DialogTitle>
                    <DialogDescription>
                      Add support services for survivors
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="organization">Organization Name</Label>
                      <Input
                        id="organization"
                        value={serviceForm.organization}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, organization: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={serviceForm.location}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={serviceForm.phone}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        type="url"
                        value={serviceForm.website}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, website: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        value={serviceForm.description}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, description: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveService}>Save Service</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {services.map((service) => (
                <Card key={service.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{service.organization}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>📍 {service.location}</p>
                        <p>📞 {service.phone}</p>
                        {service.website && <p>🌐 {service.website}</p>}
                        {service.description && (
                          <p className="mt-2">{service.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingService(service);
                          setServiceForm({
                            organization: service.organization,
                            location: service.location,
                            phone: service.phone,
                            website: service.website || "",
                            description: service.description || "",
                          });
                          setServiceDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
