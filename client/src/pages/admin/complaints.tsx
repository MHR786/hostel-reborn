import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye } from "lucide-react";
import type { User, Complaint } from "@shared/schema";
import { format } from "date-fns";

interface ComplaintWithStudent extends Complaint {
  student?: User;
}

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function ComplaintsPage() {
  const { toast } = useToast();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithStudent | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [resolution, setResolution] = useState("");

  const { data: complaints = [], isLoading } = useQuery<ComplaintWithStudent[]>({
    queryKey: ["/api/complaints"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; status: string; resolution?: string }) => {
      const res = await apiRequest("PATCH", `/api/complaints/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      setSelectedComplaint(null);
      toast({ title: "Complaint updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update complaint", variant: "destructive" });
    },
  });

  const openDetails = (complaint: ComplaintWithStudent) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResolution(complaint.resolution || "");
  };

  const handleUpdate = () => {
    if (!selectedComplaint) return;
    updateMutation.mutate({
      id: selectedComplaint.id,
      status: newStatus,
      resolution: newStatus === "RESOLVED" || newStatus === "CLOSED" ? resolution : undefined,
    });
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (complaint: ComplaintWithStudent) => (
        <div>
          <p className="font-medium text-sm">{complaint.student?.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">{complaint.student?.email}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (complaint: ComplaintWithStudent) => (
        <div>
          <p className="font-medium text-sm">{complaint.subject}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{complaint.description}</p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (complaint: ComplaintWithStudent) => (
        <StatusBadge status={complaint.priority || "Normal"} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (complaint: ComplaintWithStudent) => (
        <StatusBadge status={complaint.status.replace("_", " ")} />
      ),
    },
    {
      key: "createdAt",
      header: "Submitted",
      render: (complaint: ComplaintWithStudent) =>
        format(new Date(complaint.createdAt), "MMM d, yyyy"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints"
        description="Manage student complaints and issues"
      />

      <DataTable
        data={complaints}
        columns={columns}
        isLoading={isLoading}
        searchKey="subject"
        searchPlaceholder="Search complaints..."
        emptyMessage="No complaints found"
        actions={(complaint) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDetails(complaint)}
            data-testid={`button-view-${complaint.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              Review and update complaint status
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="text-sm font-medium">{selectedComplaint.student?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedComplaint.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium">{selectedComplaint.subject}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedComplaint.description}</p>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(newStatus === "RESOLVED" || newStatus === "CLOSED") && (
                  <div>
                    <Label>Resolution</Label>
                    <Textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Enter resolution details"
                      data-testid="input-resolution"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  data-testid="button-update"
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
