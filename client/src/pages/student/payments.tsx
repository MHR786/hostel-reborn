import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { StudentPayment } from "@shared/schema";

export default function StudentPayments() {
  const { user } = useAuth();

  const { data: payments = [], isLoading } = useQuery<StudentPayment[]>({
    queryKey: ["/api/student-payments", { studentId: user?.id }],
    enabled: !!user?.id,
  });

  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const approvedPayments = payments.filter((p) => p.status === "APPROVED");
  const rejectedPayments = payments.filter((p) => p.status === "REJECTED");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const totalPending = pendingPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount as string),
    0
  );
  const totalPaid = approvedPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount as string),
    0
  );

  const PaymentTable = ({ data }: { data: StudentPayment[] }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month/Year</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No payments found</p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((payment) => (
              <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                <TableCell className="font-medium">
                  {payment.month} {payment.year}
                </TableCell>
                <TableCell>{payment.paymentType}</TableCell>
                <TableCell className="font-mono">
                  Rs. {parseFloat(payment.amount as string).toLocaleString()}
                </TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {payment.paidDate
                    ? format(new Date(payment.paidDate), "MMM d, yyyy")
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Payment History
        </h1>
        <p className="text-muted-foreground">
          View your payment records and status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl font-bold text-green-600"
              data-testid="text-total-paid"
            >
              Rs. {totalPaid.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {approvedPayments.length} approved payment(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl font-bold text-yellow-600"
              data-testid="text-total-pending"
            >
              Rs. {totalPending.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} pending payment(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            All ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            Approved ({approvedPayments.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({rejectedPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PaymentTable data={payments} />
        </TabsContent>
        <TabsContent value="pending">
          <PaymentTable data={pendingPayments} />
        </TabsContent>
        <TabsContent value="approved">
          <PaymentTable data={approvedPayments} />
        </TabsContent>
        <TabsContent value="rejected">
          <PaymentTable data={rejectedPayments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
