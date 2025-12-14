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
import { Plus, Trash2 } from "lucide-react";
import type { User, Room, Block, SeatAllocation } from "@shared/schema";
import { format } from "date-fns";

const allocationFormSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  roomId: z.string().min(1, "Please select a room"),
  bedNumber: z.coerce.number().min(1, "Bed number is required"),
  allocatedDate: z.string().min(1, "Allocation date is required"),
});

type AllocationFormData = z.infer<typeof allocationFormSchema>;

interface AllocationWithDetails extends SeatAllocation {
  student?: User;
  room?: Room & { block?: Block };
}

export default function SeatsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: allocations = [], isLoading } = useQuery<AllocationWithDetails[]>({
    queryKey: ["/api/seat-allocations"],
  });

  const { data: students = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: rooms = [] } = useQuery<(Room & { block?: Block })[]>({
    queryKey: ["/api/rooms"],
  });

  const studentList = students.filter((u) => u.role === "STUDENT");
  const allocatedStudentIds = allocations.filter(a => a.isActive).map(a => a.studentId);
  const availableStudents = studentList.filter(s => !allocatedStudentIds.includes(s.id));

  const form = useForm<AllocationFormData>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      studentId: "",
      roomId: "",
      bedNumber: 1,
      allocatedDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AllocationFormData) => {
      const res = await apiRequest("POST", "/api/seat-allocations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seat-allocations"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Seat allocated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to allocate seat", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/seat-allocations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seat-allocations"] });
      toast({ title: "Allocation removed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to remove allocation", variant: "destructive" });
    },
  });

  const onSubmit = (data: AllocationFormData) => {
    createMutation.mutate(data);
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (allocation: AllocationWithDetails) => (
        <div>
          <p className="font-medium text-sm">{allocation.student?.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">{allocation.student?.email}</p>
        </div>
      ),
    },
    {
      key: "room",
      header: "Room",
      render: (allocation: AllocationWithDetails) => (
        <div>
          <p className="font-medium text-sm">
            {allocation.room?.block?.name} - Room {allocation.room?.roomNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            Bed #{allocation.bedNumber} | {allocation.room?.type}
          </p>
        </div>
      ),
    },
    {
      key: "allocatedDate",
      header: "Allocated On",
      render: (allocation: AllocationWithDetails) =>
        format(new Date(allocation.allocatedDate), "MMM d, yyyy"),
    },
    {
      key: "isActive",
      header: "Status",
      render: (allocation: AllocationWithDetails) => (
        <StatusBadge status={allocation.isActive ? "Approved" : "Closed"} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seat Allocation"
        description="Assign rooms and beds to students"
        action={{
          label: "Allocate Seat",
          onClick: () => setIsDialogOpen(true),
          icon: Plus,
        }}
      />

      <DataTable
        data={allocations}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No seat allocations found"
        actions={(allocation) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate(allocation.id)}
            data-testid={`button-delete-${allocation.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Seat</DialogTitle>
            <DialogDescription>
              Assign a room and bed to a student
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-student">
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
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
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-room">
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.block?.name} - Room {room.roomNumber} ({room.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed Number *</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} data-testid="input-bed" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allocatedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allocation Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date" />
                      </FormControl>
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
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  Allocate Seat
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
