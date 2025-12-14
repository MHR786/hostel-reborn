import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Save, CalendarCheck, Check, X } from "lucide-react";
import type { User, Attendance } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AttendanceWithUser extends Attendance {
  user?: User;
}

export default function AttendancePage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceStates, setAttendanceStates] = useState<Record<string, string>>({});
  const [userType, setUserType] = useState<"STUDENT" | "EMPLOYEE">("STUDENT");

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery<AttendanceWithUser[]>({
    queryKey: ["/api/attendance", selectedDate],
  });

  const filteredUsers = users.filter((u) => u.role === userType);

  const saveMutation = useMutation({
    mutationFn: async (data: { date: string; records: { userId: string; status: string }[] }) => {
      const res = await apiRequest("POST", "/api/attendance/bulk", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance", selectedDate] });
      toast({ title: "Attendance saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save attendance", variant: "destructive" });
    },
  });

  const getAttendanceStatus = (userId: string) => {
    if (attendanceStates[userId]) {
      return attendanceStates[userId];
    }
    const record = attendanceRecords.find((r) => r.userId === userId);
    return record?.status || "ABSENT";
  };

  const setStatus = (userId: string, status: string) => {
    setAttendanceStates({
      ...attendanceStates,
      [userId]: status,
    });
  };

  const handleSave = () => {
    const records = filteredUsers.map((user) => ({
      userId: user.id,
      status: getAttendanceStatus(user.id),
    }));
    saveMutation.mutate({ date: selectedDate, records });
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setAttendanceStates({});
  };

  const isLoading = usersLoading || attendanceLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mark daily attendance for students and staff
          </p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
          <Save className="h-4 w-4 mr-2" />
          Save Attendance
        </Button>
      </div>

      <Tabs value={userType} onValueChange={(v) => setUserType(v as "STUDENT" | "EMPLOYEE")}>
        <TabsList>
          <TabsTrigger value="STUDENT" data-testid="tab-students">Students</TabsTrigger>
          <TabsTrigger value="EMPLOYEE" data-testid="tab-employees">Employees</TabsTrigger>
        </TabsList>

        <TabsContent value={userType} className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  {userType === "STUDENT" ? "Student" : "Employee"} Attendance
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeDate(-1)}
                    data-testid="button-prev-date"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setAttendanceStates({});
                    }}
                    className="w-auto"
                    data-testid="input-date"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeDate(1)}
                    data-testid="button-next-date"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    No {userType.toLowerCase()}s found
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => {
                    const status = getAttendanceStatus(user.id);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        data-testid={`row-${user.id}`}
                      >
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatus(user.id, "PRESENT")}
                            className={cn(
                              status === "PRESENT" && "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                            )}
                            data-testid={`button-present-${user.id}`}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Present
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatus(user.id, "ABSENT")}
                            className={cn(
                              status === "ABSENT" && "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400"
                            )}
                            data-testid={`button-absent-${user.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Absent
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatus(user.id, "LEAVE")}
                            className={cn(
                              status === "LEAVE" && "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400"
                            )}
                            data-testid={`button-leave-${user.id}`}
                          >
                            Leave
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
