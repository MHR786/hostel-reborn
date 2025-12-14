import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Notice } from "@shared/schema";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";

const noticeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  visibility: z.string().min(1, "Visibility is required"),
  priority: z.string().optional(),
});

type NoticeFormData = z.infer<typeof noticeFormSchema>;

const visibilityOptions = ["ALL", "STUDENTS", "STAFF"];
const priorityOptions = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function NoticesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const { data: notices = [], isLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: "",
      content: "",
      visibility: "ALL",
      priority: "NORMAL",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: NoticeFormData) => {
      const res = await apiRequest("POST", "/api/notices", {
        ...data,
        createdBy: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Notice created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create notice", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: NoticeFormData & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/notices/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setIsDialogOpen(false);
      setSelectedNotice(null);
      form.reset();
      toast({ title: "Notice updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update notice", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({ title: "Notice deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete notice", variant: "destructive" });
    },
  });

  const openCreateDialog = () => {
    setSelectedNotice(null);
    form.reset({
      title: "",
      content: "",
      visibility: "ALL",
      priority: "NORMAL",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (notice: Notice) => {
    setSelectedNotice(notice);
    form.reset({
      title: notice.title,
      content: notice.content,
      visibility: notice.visibility,
      priority: notice.priority || "NORMAL",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: NoticeFormData) => {
    if (selectedNotice) {
      updateMutation.mutate({ ...data, id: selectedNotice.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (notice: Notice) => (
        <div>
          <p className="font-medium text-sm">{notice.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{notice.content}</p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (notice: Notice) => (
        <StatusBadge status={notice.priority || "Normal"} />
      ),
    },
    {
      key: "visibility",
      header: "Visibility",
    },
    {
      key: "createdAt",
      header: "Created",
      render: (notice: Notice) =>
        format(new Date(notice.createdAt), "MMM d, yyyy"),
    },
    {
      key: "isActive",
      header: "Status",
      render: (notice: Notice) => (
        <StatusBadge status={notice.isActive ? "Approved" : "Closed"} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notice Board"
        description="Create and manage announcements"
        action={{
          label: "Add Notice",
          onClick: openCreateDialog,
          icon: Plus,
        }}
      />

      <DataTable
        data={notices}
        columns={columns}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Search notices..."
        emptyMessage="No notices found"
        actions={(notice) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(notice)}
              data-testid={`button-edit-${notice.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(notice.id)}
              data-testid={`button-delete-${notice.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedNotice ? "Edit Notice" : "Create Notice"}
            </DialogTitle>
            <DialogDescription>
              {selectedNotice
                ? "Update notice details"
                : "Create a new announcement"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter notice content"
                        rows={4}
                        {...field}
                        data-testid="input-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-visibility">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {visibilityOptions.map((opt) => (
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
              </div>
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {selectedNotice ? "Update" : "Create"} Notice
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
