import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";
import {
  BedDouble,
  Building2,
  CreditCard,
  Megaphone,
  MessageSquareWarning,
  Utensils,
  Calendar,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import type { SeatAllocation, Room, Block, StudentPayment, Notice, MealRecord } from "@shared/schema";

interface AllocationWithDetails extends SeatAllocation {
  room?: Room;
  block?: Block;
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: allocation, isLoading: allocationLoading } = useQuery<AllocationWithDetails>({
    queryKey: ["/api/students", user?.id, "allocation"],
    enabled: !!user?.id,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<StudentPayment[]>({
    queryKey: ["/api/student-payments", { studentId: user?.id }],
    enabled: !!user?.id,
  });

  const { data: notices = [], isLoading: noticesLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const { data: mealRecords = [], isLoading: mealsLoading } = useQuery<MealRecord[]>({
    queryKey: ["/api/meal-records", { studentId: user?.id }],
    enabled: !!user?.id,
  });

  const pendingPayments = payments.filter((p) => p.status === "PENDING").length;
  const recentNotices = notices.filter((n) => n.isActive).slice(0, 3);
  const todaysMeals = mealRecords.find(
    (m) => m.date === new Date().toISOString().split("T")[0]
  );

  const isLoading = allocationLoading || paymentsLoading || noticesLoading || mealsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-welcome">
          Welcome, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your hostel life
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              Room Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allocation ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Block</span>
                  <span className="font-medium" data-testid="text-block-name">
                    {allocation.block?.name || "Block A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Room</span>
                  <span className="font-medium" data-testid="text-room-number">
                    {allocation.room?.roomNumber || "101"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bed No.</span>
                  <span className="font-medium" data-testid="text-bed-number">
                    {allocation.bedNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="secondary" data-testid="badge-room-type">
                    {allocation.room?.type || "NON_AC"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No room allocated yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold" data-testid="text-pending-payments">
                  {pendingPayments}
                </p>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
              </div>
              <Link href="/student/payments">
                <Button variant="outline" className="w-full" data-testid="link-view-payments">
                  View All Payments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Today's Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Breakfast</span>
                <Badge variant={todaysMeals?.breakfast ? "default" : "outline"}>
                  {todaysMeals?.breakfast ? "Taken" : "Not Taken"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lunch</span>
                <Badge variant={todaysMeals?.lunch ? "default" : "outline"}>
                  {todaysMeals?.lunch ? "Taken" : "Not Taken"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dinner</span>
                <Badge variant={todaysMeals?.dinner ? "default" : "outline"}>
                  {todaysMeals?.dinner ? "Taken" : "Not Taken"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Recent Notices
              </CardTitle>
              <Link href="/student/notices">
                <Button variant="ghost" size="sm" data-testid="link-view-all-notices">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentNotices.length > 0 ? (
              <div className="space-y-4">
                {recentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-notice-title-${notice.id}`}>
                          {notice.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {notice.content}
                        </p>
                      </div>
                      {notice.priority === "URGENT" && (
                        <Badge variant="destructive" className="shrink-0">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notice.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Megaphone className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notices available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/student/profile">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="link-profile">
                  <Building2 className="h-5 w-5" />
                  <span className="text-xs">My Profile</span>
                </Button>
              </Link>
              <Link href="/student/complaints">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="link-complaints">
                  <MessageSquareWarning className="h-5 w-5" />
                  <span className="text-xs">Submit Complaint</span>
                </Button>
              </Link>
              <Link href="/student/meals">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="link-meals">
                  <Utensils className="h-5 w-5" />
                  <span className="text-xs">Meal Records</span>
                </Button>
              </Link>
              <Link href="/student/payments">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="link-payments">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Payments</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.guardianPhone && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.guardianName || "Guardian"}</p>
                <p className="text-sm text-muted-foreground">{user.guardianPhone}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${user.guardianPhone}`}>Call</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
