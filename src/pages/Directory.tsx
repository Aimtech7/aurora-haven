import { useState, useEffect } from "react";
import { Phone, Globe, MapPin, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  organization: string;
  location: string;
  phone: string;
  website: string | null;
  description: string | null;
}

const Directory = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, services]);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("organization", { ascending: true });

    if (error) {
      console.error("Error fetching services:", error);
      return;
    }

    setServices(data || []);
  };

  const filterServices = () => {
    if (!searchQuery) {
      setFilteredServices(services);
      return;
    }

    const filtered = services.filter((service) =>
      service.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredServices(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Support Services Directory</h1>
            <p className="text-muted-foreground">
              Verified helplines and organizations ready to help
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by organization, location, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Services List */}
          <div className="grid gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="p-6 hover:shadow-card transition-all duration-300">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{service.organization}</h3>
                    {service.description && (
                      <p className="text-muted-foreground">{service.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{service.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={`tel:${service.phone.replace(/\s/g, '')}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {service.phone}
                      </a>
                    </div>

                    {service.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={service.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm">
                      <a href={`tel:${service.phone.replace(/\s/g, '')}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                    {service.website && (
                      <Button asChild variant="outline" size="sm">
                        <a href={service.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-2" />
                          Visit
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <EmergencyButton />
    </div>
  );
};

export default Directory;