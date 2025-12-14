import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
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
import { Plus, Trash2 } from "lucide-react";
import type { User, Salary } from "@shared/schema";
import { format } from "date-fns";

const salaryFormSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  amount: z.coerce.number().min(1, "Amount is required"),
  month: z.string().min(1, "Month is required"),
  year: z.coerce.number().min(2000, "Year is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  bonus: z.coerce.number().optional(),
  deductions: z.coerce.number().optional(),
  remarks: z.string().optional(),
});

type SalaryFormData = z.infer<typeof salaryFormSchema>;

interface SalaryWithEmployee extends Salary {
  employee?: User;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const paymentMethods = ["CASH", "BANK_TRANSFER", "UPI", "CHEQUE"];

export default function SalaryPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: salaries = [], isLoading } = useQuery<SalaryWithEmployee[]>({
    queryKey: ["/api/salaries"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const employees = users.filter((u) => u.role === "EMPLOYEE");

  const form = useForm<SalaryFormData>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      employeeId: "",
      amount: 0,
      month: months[new Date().getMonth()],
      year: new Date().getFullYear(),
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "BANK_TRANSFER",
      bonus: 0,
      deductions: 0,
      remarks: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SalaryFormData) => {
      const res = await apiRequest("POST", "/api/salaries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Salary payment recorded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to record payment", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/salaries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      toast({ title: "Payment record deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete record", variant: "destructive" });
    },
  });

  const onSubmit = (data: SalaryFormData) => {
    createMutation.mutate(data);
  };

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (salary: SalaryWithEmployee) => (
        <div>
          <p className="font-medium text-sm">{salary.employee?.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">{salary.employee?.email}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (salary: SalaryWithEmployee) => (
        <span className="font-mono font-medium">${salary.amount}</span>
      ),
    },
    {
      key: "period",
      header: "Period",
      render: (salary: SalaryWithEmployee) => `${salary.month} ${salary.year}`,
    },
    {
      key: "paymentDate",
      header: "Payment Date",
      render: (salary: SalaryWithEmployee) =>
        format(new Date(salary.paymentDate), "MMM d, yyyy"),
    },
    {
      key: "paymentMethod",
      header: "Method",
      render: (salary: SalaryWithEmployee) =>
        salary.paymentMethod?.replace("_", " ") || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Management"
        description="Record and view employee salary payments"
        action={{
          label: "Add Salary",
          onClick: () => setIsDialogOpen(true),
          icon: Plus,
        }}
      />

      <DataTable
        data={salaries}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No salary records found"
        actions={(salary) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate(salary.id)}
            data-testid={`button-delete-${salary.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Salary Payment</DialogTitle>
            <DialogDescription>
              Record a salary payment for an employee
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-employee">
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} data-testid="input-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-month">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
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
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-method">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method.replace("_", " ")}
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
                  name="bonus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonus</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} data-testid="input-bonus" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deductions</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} data-testid="input-deductions" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-remarks" />
                    </FormControl>
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
                  Add Payment
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
