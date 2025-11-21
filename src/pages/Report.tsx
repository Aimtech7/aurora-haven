import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, AlertCircle, Copy, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);

  const copyToClipboard = () => {
    if (trackingId) {
      navigator.clipboard.writeText(trackingId);
      toast.success("Tracking ID copied to clipboard");
    }
  };

  const downloadTrackingInfo = () => {
    if (!trackingId) return;
    const text = `Digital Violence Report Tracking Information\n\nTracking ID: ${trackingId}\n\nIMPORTANT: Save this tracking ID to check your report status later.\nYou can track your report at: ${window.location.origin}/track-report\n\nThis is the only way to track your report. We cannot recover it if lost.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-tracking-${trackingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Tracking information downloaded");
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

      // Send notification to admin (non-blocking, don't wait for response)
      supabase.functions
        .invoke("report-notifications", {
          body: {
            tracking_id: report.tracking_id,
            type_of_abuse: report.type_of_abuse,
            submitted_at: report.created_at,
          },
        })
        .catch((error) => {
          console.error("Failed to send notification:", error);
          // Don't fail the submission if notification fails
        });

      // Show tracking ID dialog
      setTrackingId(report.tracking_id);
      setShowTrackingDialog(true);
      
      // Reset form
      setFormData({ type_of_abuse: "", description: "" });
      setFiles([]);
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

      {/* Tracking ID Dialog */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Report Submitted Successfully</DialogTitle>
            <DialogDescription className="text-center">
              Your report has been recorded anonymously and securely.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-primary/10 border-2 border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-center mb-2">Your Tracking ID</p>
              <p className="text-2xl font-mono font-bold text-center tracking-wider">
                {trackingId}
              </p>
            </div>

            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-sm">
                <strong>IMPORTANT:</strong> Save this tracking ID. This is the only way to check your report status.
                We cannot recover it if lost.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={copyToClipboard} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy ID
              </Button>
              <Button variant="outline" onClick={downloadTrackingInfo} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => navigate("/track-report")}
                className="w-full"
              >
                Track Report Status
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTrackingDialog(false);
                  navigate("/");
                }}
                className="w-full"
              >
                Return Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EmergencyButton />
    </div>
  );
};


export default Report;