import { useState } from "react";
import { Search, CheckCircle2, Clock, AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportStatus {
  id: string;
  tracking_id: string;
  type_of_abuse: string;
  status: string;
  created_at: string;
}

interface StatusChange {
  id: string;
  old_status: string | null;
  new_status: string;
  created_at: string;
  notes: string | null;
}

const TrackReport = () => {
  const [trackingId, setTrackingId] = useState("");
  const [searching, setSearching] = useState(false);
  const [report, setReport] = useState<ReportStatus | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusChange[]>([]);
  const [error, setError] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-5 h-5" />;
      case "under_review":
        return <Search className="w-5 h-5" />;
      case "resolved":
        return <CheckCircle2 className="w-5 h-5" />;
      case "requires_action":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "under_review":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "requires_action":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "submitted":
        return "Your report has been received and is awaiting review.";
      case "under_review":
        return "An administrator is currently reviewing your report.";
      case "resolved":
        return "Your report has been reviewed and resolved.";
      case "requires_action":
        return "Additional information or action may be needed regarding your report.";
      default:
        return "";
    }
  };

  const copyTrackingId = () => {
    if (report?.tracking_id) {
      navigator.clipboard.writeText(report.tracking_id);
      toast.success("Tracking ID copied to clipboard");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }

    // Validate format (RPT-XXXXXXXX)
    const trackingIdPattern = /^RPT-[A-Z0-9]{8}$/;
    if (!trackingIdPattern.test(trackingId.trim().toUpperCase())) {
      setError("Invalid tracking ID format. Expected format: RPT-XXXXXXXX");
      return;
    }

    setSearching(true);
    setError("");
    setReport(null);
    setStatusHistory([]);

    try {
      // Fetch report status using the security definer function
      const { data, error: reportError } = await supabase
        .rpc("get_report_status", { tracking_id_input: trackingId.trim().toUpperCase() })
        .single();

      if (reportError || !data) {
        setError("Report not found. Please check your tracking ID and try again.");
        return;
      }

      setReport(data);

      // Fetch status history if user has access (they won't unless admin, but we try)
      const { data: history } = await supabase
        .from("report_status_changes")
        .select("*")
        .eq("report_id", data.id)
        .order("created_at", { ascending: true });

      if (history) {
        setStatusHistory(history);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Track Your Report</h1>
            <p className="text-muted-foreground">
              Enter your tracking ID to check the status of your report
            </p>
          </div>

          {/* Search Form */}
          <Card className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tracking-id">Tracking ID</Label>
                <Input
                  id="tracking-id"
                  placeholder="RPT-ABC12345"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Format: RPT-XXXXXXXX (8 characters)
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={searching}>
                {searching ? "Searching..." : "Track Report"}
              </Button>
            </form>
          </Card>

          {/* Report Status */}
          {report && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tracking ID</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-mono font-bold">{report.tracking_id}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyTrackingId}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(report.status)} flex items-center gap-2`}>
                      {getStatusIcon(report.status)}
                      {report.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Type of Abuse</p>
                      <p className="font-medium">{report.type_of_abuse}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {new Date(report.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{getStatusMessage(report.status)}</p>
                  </div>
                </div>
              </Card>

              {/* Status Timeline */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Status Timeline</h3>
                <div className="space-y-4">
                  {/* Initial submission */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Submitted</p>
                        <Badge variant="outline" className="text-xs">
                          {new Date(report.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Report received</p>
                    </div>
                  </div>

                  {/* Status changes from history */}
                  {statusHistory.map((change) => (
                    <div key={change.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full ${getStatusColor(change.new_status).split(" ")[0]} flex items-center justify-center`}>
                          {getStatusIcon(change.new_status)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">
                            {change.new_status.replace("_", " ")}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {new Date(change.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        {change.notes && (
                          <p className="text-sm text-muted-foreground">{change.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Additional Support */}
              <Card className="p-6 bg-muted/50">
                <h3 className="font-semibold mb-2">Need Additional Support?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our AI chatbot is available 24/7 to provide guidance and resources.
                </p>
                <Button variant="outline" onClick={() => window.location.href = "/chatbot"}>
                  Chat with Support
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrackReport;
