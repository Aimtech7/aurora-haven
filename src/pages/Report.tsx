import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Report = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type_of_abuse: "",
    description: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  const abuseTypes = [
    "Online Harassment",
    "Cyberstalking",
    "Non-consensual Image Sharing",
    "Doxxing",
    "Identity Theft",
    "Hacking/Unauthorized Access",
    "Threats",
    "Other",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type_of_abuse || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Insert report
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .insert({
          type_of_abuse: formData.type_of_abuse,
          description: formData.description,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Upload files if any
      if (files.length > 0 && report) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${report.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Store file reference
          const { error: fileError } = await supabase
            .from("files")
            .insert({
              report_id: report.id,
              file_url: fileName,
              file_name: file.name,
            });

          if (fileError) throw fileError;
        }
      }

      toast.success("Report submitted successfully", {
        description: "Your report has been recorded anonymously and securely.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report", {
        description: "Please try again or contact support.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Anonymous Reporting</h1>
            <p className="text-muted-foreground">
              Report incidents safely and anonymously. All information is encrypted.
            </p>
          </div>

          {/* Safety Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This form is completely anonymous. We do not collect any identifying information. 
              Evidence files will be automatically deleted after 48 hours.
            </AlertDescription>
          </Alert>

          {/* Form */}
          <Card className="p-6 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type of Abuse *</Label>
                <Select
                  value={formData.type_of_abuse}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type_of_abuse: value }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type of abuse" />
                  </SelectTrigger>
                  <SelectContent>
                    {abuseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what happened, including dates, platforms, and any relevant details..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Evidence (Optional)</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Screenshots/Evidence
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Files will be automatically deleted after 48 hours
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <EmergencyButton />
    </div>
  );
};

export default Report;