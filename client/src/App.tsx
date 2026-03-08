import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CountryJobs from "./pages/CountryJobs";
import Auth from "./pages/Auth";
import Employers from "./pages/Employers";
import EmployerProfile from "./pages/EmployerProfile";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import SeekerDashboard from "./pages/dashboard/SeekerDashboard";
import EmployerDashboard from "./pages/dashboard/EmployerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/not-found";

function ProtectedRoute({ component: Component, allowedRoles }: { component: () => JSX.Element; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  if (!user) {
    setLocation("/auth");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    setLocation("/");
    return null;
  }

  return <Component />;
}

function ProtectedSeekerDashboard() {
  return <ProtectedRoute component={SeekerDashboard} allowedRoles={["JOB_SEEKER"]} />;
}
function ProtectedEmployerDashboard() {
  return <ProtectedRoute component={EmployerDashboard} allowedRoles={["EMPLOYER"]} />;
}
function ProtectedAdminDashboard() {
  return <ProtectedRoute component={AdminDashboard} allowedRoles={["SUPER_ADMIN"]} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/us" component={CountryJobs} />
      <Route path="/jobs/uk" component={CountryJobs} />
      <Route path="/jobs/nigeria" component={CountryJobs} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/auth" component={Auth} />
      <Route path="/employers" component={Employers} />
      <Route path="/employers/:slug" component={EmployerProfile} />
      <Route path="/resources" component={Resources} />
      <Route path="/resources/:slug" component={ResourceDetail} />

      <Route path="/dashboard" component={ProtectedSeekerDashboard} />
      <Route path="/dashboard/:tab" component={ProtectedSeekerDashboard} />

      <Route path="/employer/dashboard" component={ProtectedEmployerDashboard} />
      <Route path="/employer/post-job" component={ProtectedEmployerDashboard} />
      <Route path="/employer/jobs" component={ProtectedEmployerDashboard} />

      <Route path="/admin" component={ProtectedAdminDashboard} />
      <Route path="/admin/:tab" component={ProtectedAdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
