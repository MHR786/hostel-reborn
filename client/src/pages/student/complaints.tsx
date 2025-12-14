import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import {
  MessageSquareWarning,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { Complaint } from "@shared/schema";

const complaintFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.string().default("NORMAL"),
});

type ComplaintFormData = z.infer<typeof complaintFormSchema>;

const priorityOptions = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function StudentComplaints() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints", { studentId: user?.id }],
    enabled: !!user?.id,
  });

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "NORMAL",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ComplaintFormData) => {
      const res = await apiRequest("POST", "/api/complaints", {
        ...data,
        studentId: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Complaint submitted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to submit complaint", variant: "destructive" });
    },
  });

  const onSubmit = (data: ComplaintFormData) => {
    createMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "OPEN":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "OPEN":
        return "outline";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string | null) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "default";
      case "LOW":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquareWarning className="h-6 w-6 text-primary" />
            Complaints
          </h1>
          <p className="text-muted-foreground">
            Submit and track your complaints
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-complaint">
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit a Complaint</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll look into it
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief subject of your complaint"
                          {...field}
                          data-testid="input-subject"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your issue in detail..."
                          rows={4}
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit"
                  >
                    Submit Complaint
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquareWarning className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Complaints</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't submitted any complaints yet.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Complaint
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card
              key={complaint.id}
              data-testid={`card-complaint-${complaint.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(complaint.status)}
                      <span data-testid={`text-complaint-subject-${complaint.id}`}>
                        {complaint.subject}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Submitted on{" "}
                      {format(new Date(complaint.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getPriorityBadgeVariant(complaint.priority)}>
                      {complaint.priority || "Normal"}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(complaint.status)}>
                      {complaint.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p
                    className="text-sm whitespace-pre-wrap"
                    data-testid={`text-complaint-description-${complaint.id}`}
                  >
                    {complaint.description}
                  </p>
                </div>

                {complaint.resolution && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Resolution</p>
                    <p className="text-sm" data-testid={`text-complaint-resolution-${complaint.id}`}>
                      {complaint.resolution}
                    </p>
                    {complaint.resolvedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Resolved on{" "}
                        {format(new Date(complaint.resolvedAt), "MMMM d, yyyy")}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
