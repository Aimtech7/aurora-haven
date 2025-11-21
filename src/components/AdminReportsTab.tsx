import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Eye, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface Report {
  id: string;
  tracking_id: string;
  type_of_abuse: string;
  description: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
}

export const AdminReportsTab = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadReports();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        loadReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, statusFilter, searchQuery]);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.tracking_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredReports(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-500/10 text-blue-500";
      case "under_review": return "bg-yellow-500/10 text-yellow-500";
      case "resolved": return "bg-green-500/10 text-green-500";
      case "requires_action": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !newStatus) return;

    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes || selectedReport.admin_notes,
        })
        .eq("id", selectedReport.id);

      if (error) throw error;
      
      toast.success("Report status updated");
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    }
  };

  if (loading) return <div className="text-center py-8">Loading reports...</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by tracking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="requires_action">Requires Action</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{report.tracking_id}</span>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{report.type_of_abuse}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedReport(report);
                  setNewStatus(report.status);
                  setNotes(report.admin_notes || "");
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tracking ID</Label>
                  <p className="font-mono font-bold">{selectedReport.tracking_id}</p>
                </div>
                <div>
                  <Label>Type of Abuse</Label>
                  <p>{selectedReport.type_of_abuse}</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedReport.description}</p>
              </div>

              <div>
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="requires_action">Requires Action</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>

              <Button onClick={handleUpdateStatus} className="w-full">
                Update Report
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
