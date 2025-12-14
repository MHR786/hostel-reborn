import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/stats-card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, BedDouble, Utensils, Megaphone, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Notice } from "@shared/schema";

interface DashboardStats {
  totalEmployees: number;
  totalStudents: number;
  totalRooms: number;
  totalBlocks: number;
  totalCapacity: number;
  occupiedSeats: number;
  availableSeats: number;
  occupancyRate: number;
  openComplaints: number;
  activeNotices: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats/dashboard"],
  });

  const { data: notices, isLoading: noticesLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const recentNotices = notices?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome to the Hostel Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Employees"
              value={stats?.totalEmployees || 0}
              icon={Users}
              subtitle="Active staff members"
            />
            <StatsCard
              title="Current Students"
              value={stats?.totalStudents || 0}
              icon={GraduationCap}
              subtitle="Enrolled students"
            />
            <StatsCard
              title="Total Rooms"
              value={stats?.totalRooms || 0}
              icon={BedDouble}
              subtitle={`${stats?.occupiedSeats || 0} seats occupied`}
            />
            <StatsCard
              title="Occupancy Rate"
              value={`${stats?.occupancyRate || 0}%`}
              icon={Utensils}
              subtitle={`${stats?.availableSeats || 0} available seats`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Recent Notices
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {noticesLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentNotices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Megaphone className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No notices yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 hover-elevate"
                    data-testid={`notice-${notice.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium truncate">{notice.title}</h4>
                        <StatusBadge status={notice.priority || "Normal"} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notice.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(notice.createdAt), "MMM d")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Open Complaints</span>
                <span className="text-lg font-semibold">{stats?.openComplaints || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Total Capacity</span>
                <span className="text-lg font-semibold">{stats?.totalCapacity || 0} beds</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Available Seats</span>
                <span className="text-lg font-semibold">{stats?.availableSeats || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <span className="text-sm font-medium">Today</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
