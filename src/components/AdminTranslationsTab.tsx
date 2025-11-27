import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/contexts/LanguageContext";

interface Translation {
  id: string;
  key: string;
  en: string;
  sw: string;
  category: string;
}

export const AdminTranslationsTab = () => {
  const { t, refreshTranslations } = useTranslation();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = [
    "all",
    "navigation",
    "home",
    "report",
    "track",
    "resources",
    "directory",
    "chatbot",
    "admin",
    "common",
    "emergency",
  ];

  useEffect(() => {
    loadTranslations();
  }, []);

  useEffect(() => {
    filterTranslations();
  }, [searchQuery, categoryFilter, translations]);

  const loadTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from("translations")
        .select("*")
        .order("key");

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error("Error loading translations:", error);
      toast.error("Failed to load translations");
    } finally {
      setLoading(false);
    }
  };

  const filterTranslations = () => {
    let filtered = translations;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.sw.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTranslations(filtered);
  };

  const handleSaveTranslation = async (translation: Partial<Translation>) => {
    try {
      if (editingTranslation) {
        const { error } = await supabase
          .from("translations")
          .update({
            key: translation.key,
            en: translation.en,
            sw: translation.sw,
            category: translation.category,
          })
          .eq("id", editingTranslation.id);

        if (error) throw error;
        toast.success("Translation updated successfully");
      } else {
        const { error } = await supabase
          .from("translations")
          .insert([{
            key: translation.key!,
            en: translation.en!,
            sw: translation.sw!,
            category: translation.category!,
          }]);

        if (error) throw error;
        toast.success("Translation added successfully");
      }

      await loadTranslations();
      await refreshTranslations();
      setIsDialogOpen(false);
      setEditingTranslation(null);
    } catch (error: any) {
      console.error("Error saving translation:", error);
      toast.error(error.message || "Failed to save translation");
    }
  };

  const handleDeleteTranslation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this translation?")) return;

    try {
      const { error } = await supabase
        .from("translations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Translation deleted successfully");
      await loadTranslations();
      await refreshTranslations();
    } catch (error) {
      console.error("Error deleting translation:", error);
      toast.error("Failed to delete translation");
    }
  };

  const openEditDialog = (translation: Translation) => {
    setEditingTranslation(translation);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingTranslation(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6">{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("admin.translations", "Translations")}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Translation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTranslation ? "Edit Translation" : "Add Translation"}
              </DialogTitle>
            </DialogHeader>
            <TranslationForm
              translation={editingTranslation}
              onSave={handleSaveTranslation}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingTranslation(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search translations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Key</TableHead>
              <TableHead>English</TableHead>
              <TableHead>Swahili</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTranslations.map((translation) => (
              <TableRow key={translation.id}>
                <TableCell className="font-mono text-sm">{translation.key}</TableCell>
                <TableCell>{translation.en}</TableCell>
                <TableCell>{translation.sw}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                    {translation.category}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(translation)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTranslation(translation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredTranslations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No translations found
        </div>
      )}
    </div>
  );
};

interface TranslationFormProps {
  translation: Translation | null;
  onSave: (translation: Partial<Translation>) => void;
  onCancel: () => void;
}

const TranslationForm = ({ translation, onSave, onCancel }: TranslationFormProps) => {
  const [formData, setFormData] = useState({
    key: translation?.key || "",
    en: translation?.en || "",
    sw: translation?.sw || "",
    category: translation?.category || "common",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="key">Key</Label>
        <Input
          id="key"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          placeholder="e.g., home.title"
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="navigation">Navigation</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="track">Track</SelectItem>
            <SelectItem value="resources">Resources</SelectItem>
            <SelectItem value="directory">Directory</SelectItem>
            <SelectItem value="chatbot">Chatbot</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="en">English</Label>
        <Input
          id="en"
          value={formData.en}
          onChange={(e) => setFormData({ ...formData, en: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="sw">Swahili</Label>
        <Input
          id="sw"
          value={formData.sw}
          onChange={(e) => setFormData({ ...formData, sw: e.target.value })}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};
