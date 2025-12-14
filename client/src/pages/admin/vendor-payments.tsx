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
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { VendorPayment } from "@shared/schema";
import { format } from "date-fns";

const vendorPaymentSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  amount: z.coerce.number().min(1, "Amount is required"),
  purpose: z.string().min(1, "Purpose is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  invoiceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

type VendorPaymentFormData = z.infer<typeof vendorPaymentSchema>;

const paymentMethods = ["CASH", "BANK_TRANSFER", "UPI", "CARD", "CHEQUE"];

export default function VendorPaymentsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<VendorPayment | null>(null);

  const { data: payments = [], isLoading } = useQuery<VendorPayment[]>({
    queryKey: ["/api/vendor-payments"],
  });

  const form = useForm<VendorPaymentFormData>({
    resolver: zodResolver(vendorPaymentSchema),
    defaultValues: {
      vendorName: "",
      amount: 0,
      purpose: "",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "CASH",
      invoiceNumber: "",
      remarks: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VendorPaymentFormData) => {
      const res = await apiRequest("POST", "/api/vendor-payments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-payments"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Vendor payment added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add payment", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VendorPaymentFormData & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/vendor-payments/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-payments"] });
      setIsDialogOpen(false);
      setSelectedPayment(null);
      form.reset();
      toast({ title: "Payment updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update payment", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vendor-payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-payments"] });
      toast({ title: "Payment deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete payment", variant: "destructive" });
    },
  });

  const openCreateDialog = () => {
    setSelectedPayment(null);
    form.reset({
      vendorName: "",
      amount: 0,
      purpose: "",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "CASH",
      invoiceNumber: "",
      remarks: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (payment: VendorPayment) => {
    setSelectedPayment(payment);
    form.reset({
      vendorName: payment.vendorName,
      amount: Number(payment.amount),
      purpose: payment.purpose,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod || "CASH",
      invoiceNumber: payment.invoiceNumber || "",
      remarks: payment.remarks || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: VendorPaymentFormData) => {
    if (selectedPayment) {
      updateMutation.mutate({ ...data, id: selectedPayment.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      key: "vendorName",
      header: "Vendor",
    },
    {
      key: "amount",
      header: "Amount",
      render: (payment: VendorPayment) => (
        <span className="font-mono font-medium">${payment.amount}</span>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
    },
    {
      key: "paymentDate",
      header: "Date",
      render: (payment: VendorPayment) =>
        format(new Date(payment.paymentDate), "MMM d, yyyy"),
    },
    {
      key: "paymentMethod",
      header: "Method",
      render: (payment: VendorPayment) =>
        payment.paymentMethod?.replace("_", " ") || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Payments"
        description="Manage payments to vendors and suppliers"
        action={{
          label: "Add Payment",
          onClick: openCreateDialog,
          icon: Plus,
        }}
      />

      <DataTable
        data={payments}
        columns={columns}
        isLoading={isLoading}
        searchKey="vendorName"
        searchPlaceholder="Search vendors..."
        emptyMessage="No vendor payments found"
        actions={(payment) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(payment)}
              data-testid={`button-edit-${payment.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(payment.id)}
              data-testid={`button-delete-${payment.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPayment ? "Edit Payment" : "Add Vendor Payment"}
            </DialogTitle>
            <DialogDescription>
              {selectedPayment
                ? "Update payment details"
                : "Record a new payment to a vendor"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor name" {...field} data-testid="input-vendor" />
                    </FormControl>
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
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter purpose" {...field} data-testid="input-purpose" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-invoice" />
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {selectedPayment ? "Update" : "Add"} Payment
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
