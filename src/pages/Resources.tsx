import { useState, useEffect } from "react";
import { BookOpen, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
  id: string;
  title: string;
  content: string;
  category: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["harassment", "privacy", "stalking", "legal", "security"];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, selectedCategory, resources]);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resources:", error);
      return;
    }

    setResources(data || []);
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedCategory) {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      harassment: "bg-primary/10 text-primary",
      privacy: "bg-accent/10 text-accent",
      stalking: "bg-destructive/10 text-destructive",
      legal: "bg-secondary text-secondary-foreground",
      security: "bg-primary/10 text-primary",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Digital Safety Knowledge Center</h1>
            <p className="text-muted-foreground">
              Learn about digital violence, privacy protection, and your rights
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="p-6 hover:shadow-card transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold">{resource.title}</h3>
                    <Badge className={getCategoryColor(resource.category)}>
                      {resource.category}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {resource.content}
                  </p>
                </div>
              </Card>
            ))}

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resources found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <EmergencyButton />
    </div>
  );
};

export default Resources;