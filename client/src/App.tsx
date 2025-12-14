import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StudentSidebar } from "@/components/student-sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminStudents from "@/pages/admin/students";
import AdminSeats from "@/pages/admin/seats";
import AdminStudentPayments from "@/pages/admin/student-payments";
import AdminVendorPayments from "@/pages/admin/vendor-payments";
import AdminExpenses from "@/pages/admin/expenses";
import AdminEmployees from "@/pages/admin/employees";
import AdminSalary from "@/pages/admin/salary";
import AdminMeals from "@/pages/admin/meals";
import AdminAttendance from "@/pages/admin/attendance";
import AdminNotices from "@/pages/admin/notices";
import AdminComplaints from "@/pages/admin/complaints";
import AdminBlocks from "@/pages/admin/blocks";
import AdminSettings from "@/pages/admin/settings";

import StudentDashboard from "@/pages/student/dashboard";
import StudentProfile from "@/pages/student/profile";
import StudentNotices from "@/pages/student/notices";
import StudentPayments from "@/pages/student/payments";
import StudentMeals from "@/pages/student/meals";
import StudentComplaints from "@/pages/student/complaints";

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/seats" component={AdminSeats} />
      <Route path="/admin/payments/students" component={AdminStudentPayments} />
      <Route path="/admin/payments/vendors" component={AdminVendorPayments} />
      <Route path="/admin/expenses" component={AdminExpenses} />
      <Route path="/admin/employees" component={AdminEmployees} />
      <Route path="/admin/salary" component={AdminSalary} />
      <Route path="/admin/meals" component={AdminMeals} />
      <Route path="/admin/attendance" component={AdminAttendance} />
      <Route path="/admin/notices" component={AdminNotices} />
      <Route path="/admin/complaints" component={AdminComplaints} />
      <Route path="/admin/blocks" component={AdminBlocks} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function StudentRoutes() {
  return (
    <Switch>
      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/notices" component={StudentNotices} />
      <Route path="/student/payments" component={StudentPayments} />
      <Route path="/student/meals" component={StudentMeals} />
      <Route path="/student/complaints" component={StudentComplaints} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b border-border bg-background sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="max-w-7xl mx-auto p-6">
              <AdminRoutes />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function StudentLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <StudentSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b border-border bg-background sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto bg-muted/30">
            <StudentRoutes />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

function AppRouter() {
  const { user, isLoading, isAdmin, isStudent } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    if (location !== "/login") {
      return <Redirect to="/login" />;
    }
    return <LoginPage />;
  }

  if (location === "/login" || location === "/") {
    if (isAdmin) {
      return <Redirect to="/admin" />;
    }
    if (isStudent) {
      return <Redirect to="/student" />;
    }
  }

  if (location.startsWith("/admin")) {
    if (!isAdmin) {
      return <Redirect to="/student" />;
    }
    return <AdminLayout />;
  }

  if (location.startsWith("/student")) {
    if (!isStudent && !isAdmin) {
      return <Redirect to="/login" />;
    }
    return <StudentLayout />;
  }

  if (isAdmin) {
    return <Redirect to="/admin" />;
  }
  if (isStudent) {
    return <Redirect to="/student" />;
  }

  return <NotFound />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
