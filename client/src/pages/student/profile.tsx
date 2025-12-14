import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BedDouble,
  Building2,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import type { SeatAllocation, Room, Block } from "@shared/schema";

interface AllocationWithDetails extends SeatAllocation {
  room?: Room;
  block?: Block;
}

export default function StudentProfile() {
  const { user } = useAuth();

  const { data: allocation, isLoading } = useQuery<AllocationWithDetails>({
    queryKey: ["/api/students", user?.id, "allocation"],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-student-name">
            {user?.name}
          </h1>
          <p className="text-muted-foreground" data-testid="text-student-email">
            {user?.email}
          </p>
          <Badge variant="secondary" className="mt-2" data-testid="badge-role">
            Student
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <p className="text-sm font-medium" data-testid="text-profile-email">
                  {user?.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </p>
                <p className="text-sm font-medium" data-testid="text-profile-phone">
                  {user?.phone || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date of Birth
                </p>
                <p className="text-sm font-medium" data-testid="text-profile-dob">
                  {user?.dateOfBirth
                    ? format(new Date(user.dateOfBirth), "MMM d, yyyy")
                    : "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joining Date
                </p>
                <p className="text-sm font-medium" data-testid="text-profile-joining">
                  {user?.joiningDate
                    ? format(new Date(user.joiningDate), "MMM d, yyyy")
                    : "Not provided"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Address
              </p>
              <p className="text-sm font-medium" data-testid="text-profile-address">
                {user?.address || "Not provided"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              Room Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allocation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Block
                    </p>
                    <p className="text-sm font-medium" data-testid="text-allocation-block">
                      {allocation.block?.name || "Block A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Room Number</p>
                    <p className="text-sm font-medium" data-testid="text-allocation-room">
                      {allocation.room?.roomNumber || "101"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Bed Number</p>
                    <p className="text-sm font-medium" data-testid="text-allocation-bed">
                      {allocation.bedNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Room Type</p>
                    <Badge variant="secondary" data-testid="badge-allocation-type">
                      {allocation.room?.type || "NON_AC"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="text-sm font-medium" data-testid="text-allocation-floor">
                      {allocation.room?.floor || 1}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Room Capacity</p>
                    <p className="text-sm font-medium" data-testid="text-allocation-capacity">
                      {allocation.room?.capacity || 4} beds
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Allocated On</p>
                  <p className="text-sm font-medium" data-testid="text-allocation-date">
                    {format(new Date(allocation.allocatedDate), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={allocation.isActive ? "default" : "secondary"}>
                    {allocation.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No room has been allocated yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please contact the hostel administration.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Guardian Information
            </CardTitle>
            <CardDescription>Emergency contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Guardian Name</p>
                <p className="text-sm font-medium" data-testid="text-guardian-name">
                  {user?.guardianName || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Guardian Phone
                </p>
                <p className="text-sm font-medium" data-testid="text-guardian-phone">
                  {user?.guardianPhone || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
